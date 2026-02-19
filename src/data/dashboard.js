import apiClient from "../lib/apiClient";

// Helper function to build query string
const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.gameId) params.append("gameId", filters.gameId);
  if (filters.source) params.append("source", filters.source);
  if (filters.gender) params.append("gender", filters.gender);
  if (filters.age) params.append("age", filters.age);
  return params.toString();
};

// Dashboard API endpoints - Split into separate APIs for faster loading
export const DASHBOARD_API = {
  // Get KPIs only - Fastest endpoint, loads first
  getKPIs: (filters = {}, signal = null) => {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `/admin/dashboard/kpis?${queryString}`
      : "/admin/dashboard/kpis";
    return apiClient.get(url, { signal });
  },

  // Get Retention data
  getRetention: (filters = {}, signal = null) => {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `/admin/dashboard/retention?${queryString}`
      : "/admin/dashboard/retention";
    return apiClient.get(url, { signal });
  },

  // Get Top Played Game
  getTopGame: (filters = {}, signal = null) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.gameId) params.append("gameId", filters.gameId);
    if (filters.source) params.append("source", filters.source);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.age) params.append("age", filters.age);
    if (filters.selectedGameId) params.append("selectedGameId", filters.selectedGameId);
    
    const queryString = params.toString();
    const url = queryString
      ? `/admin/dashboard/top-game?${queryString}`
      : "/admin/dashboard/top-game";
    return apiClient.get(url, { signal });
  },

  // Get all games list for dropdown
  getGamesList: (signal = null) => {
    return apiClient.get("/admin/dashboard/games-list", { signal });
  },

  // Get Revenue by Game - with pagination
  getRevenue: (filters = {}, page = 1, limit = 50, signal = null) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.gameId) params.append("gameId", filters.gameId);
    if (filters.source) params.append("source", filters.source);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.age) params.append("age", filters.age);
    if (filters.retentionDay) params.append("retentionDay", filters.retentionDay);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `/admin/dashboard/revenue?${params.toString()}`;
    return apiClient.get(url, { signal });
  },

  // Get Attribution Performance
  getAttribution: (filters = {}, signal = null) => {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `/admin/dashboard/attribution?${queryString}`
      : "/admin/dashboard/attribution";
    return apiClient.get(url, { signal });
  },

  // Get Alerts only - Fast endpoint for alerts panel
  getAlerts: (signal = null) => {
    return apiClient.get("/admin/dashboard/alerts", { signal });
  },

  // Legacy: Get all data in one call (for backward compatibility)
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
