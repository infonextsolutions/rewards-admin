import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://rewardsapi.hireagent.co/api";

// const API_BASE =
//  "http://localhost:4001/api";

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
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration and authentication errors
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
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
    }

    // Return the error for further handling
    return Promise.reject(error);
  }
);

export default apiClient;
