import apiClient from "../lib/apiClient";

// Dashboard API endpoints
export const DASHBOARD_API = {
  getDashboardData: () => apiClient.get("/admin/dashboard"),
};
