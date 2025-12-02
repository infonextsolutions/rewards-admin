import apiClient from "../lib/apiClient";

// Dashboard API endpoints
export const DASHBOARD_API = {
  getDashboardData: (filters = {}, signal = null) => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.gameId) params.append("gameId", filters.gameId);
    if (filters.source) params.append("source", filters.source);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.age) params.append("age", filters.age);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    const url = queryString
      ? `/admin/dashboard?${queryString}`
      : "/admin/dashboard";

    return apiClient.get(url, { signal });
  },
};
