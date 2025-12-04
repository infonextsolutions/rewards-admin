import apiClient from "../lib/apiClient";

// Analytics API endpoints
export const ANALYTICS_API = {
  getAttributionData: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.source) params.append("source", filters.source);
    if (filters.gameId) params.append("gameId", filters.gameId);
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.advertiser) params.append("advertiser", filters.advertiser);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    const url = queryString
      ? `/admin/dashboard?${queryString}`
      : "/admin/dashboard";

    return apiClient.get(url);
  },
};






