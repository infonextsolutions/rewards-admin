// Authentication API service
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://rewardsapi.hireagent.co/api";

// git stat
export const authAPI = {
  // Admin login
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE}/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Store token and user data
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem(
          "biometricRequired",
          JSON.stringify(data.biometricRequired)
        );
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      // Since there's no logout API, just clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("biometricRequired");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear storage even if there's an error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("biometricRequired");
    }
  },

  // Get current user from token
  getCurrentUser() {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        return {
          token,
          user: JSON.parse(user),
          biometricRequired: JSON.parse(
            localStorage.getItem("biometricRequired") || "false"
          ),
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      this.logout(); // Clear invalid data
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get auth headers for API requests
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  },

  // Check if token exists (basic validation)
  validateToken() {
    try {
      const token = localStorage.getItem("token");
      return !!token;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },
};

export default authAPI;
