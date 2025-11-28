import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://rewardsapi.hireagent.co/api";

// const API_BASE = "http://localhost:4001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("[API Client] No token found in localStorage");
      }

      // Log request for debugging
      console.log("[API Client] Making request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
      });
    }
    return config;
  },
  (error) => {
    console.error("[API Client] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration and authentication errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log("[API Client] Response received:", {
      status: response.status,
      url: response.config?.url,
      hasData: !!response.data,
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error("[API Client] Response error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      responseData: error.response?.data,
    });

    // Handle authentication errors
    if (error.response) {
      const status = error.response.status;

      // Handle 401 (Unauthorized) or 403 (Forbidden) errors
      if (status === 401 || status === 403) {
        console.error("Authentication error: Token expired or invalid");

        // Clear auth data from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("biometricRequired");

          // Redirect to login page
          window.location.href = "/login";
        }
      }

      // Handle 404 (Not Found) - endpoint doesn't exist
      if (status === 404) {
        console.error(
          "Endpoint not found:",
          error.config?.baseURL + error.config?.url
        );
        console.error(
          "Please check if the backend server is running and the route is correct"
        );
      }

      // Handle network errors
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        console.error("Network error: Cannot connect to backend server");
        console.error(
          "Please check if the backend is running on:",
          error.config?.baseURL
        );
      }
    }

    // Return the error for further handling
    return Promise.reject(error);
  }
);

export default apiClient;
