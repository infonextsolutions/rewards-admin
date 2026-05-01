import apiClient from "../lib/apiClient";

// Helper function to build query string (NO source filter - only for non-attribution endpoints)
const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.gameId) params.append("gameId", filters.gameId);
  // NOTE: source filter is NOT included here - only for attribution endpoint
  if (filters.gender) params.append("gender", filters.gender);
  if (filters.age) params.append("age", filters.age);
  return params.toString();
};

// Helper function for attribution query string (INCLUDES source filter)
const buildAttributionQueryString = (filters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.source && filters.source !== "all") params.append("source", filters.source);
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

  // Get Top Played Game - NO source filter
  getTopGame: (filters = {}, signal = null) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.gameId) params.append("gameId", filters.gameId);
    // NOTE: source filter removed - only attribution endpoint uses it
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

  // Get Revenue by Game - with pagination - NO source filter
  getRevenue: (filters = {}, page = 1, limit = 50, signal = null) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.gameId) params.append("gameId", filters.gameId);
    // NOTE: source filter removed - only attribution endpoint uses it
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.age) params.append("age", filters.age);
    if (filters.retentionDay) params.append("retentionDay", filters.retentionDay);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `/admin/dashboard/revenue?${params.toString()}`;
    return apiClient.get(url, { signal });
  },

  // Get Attribution Performance - ONLY endpoint that uses source filter
  getAttribution: (filters = {}, signal = null) => {
    const queryString = buildAttributionQueryString(filters);
    const url = queryString
      ? `/admin/dashboard/attribution?${queryString}`
      : "/admin/dashboard/attribution";
    return apiClient.get(url, { signal });
  },

  // Get Alerts only - Fast endpoint for alerts panel
  getAlerts: (signal = null) => {
    return apiClient.get("/admin/dashboard/alerts", { signal });
  },

  // Get all attribution sources for filter dropdown
  getAttributionSources: (signal = null) => {
    return apiClient.get("/admin/dashboard/attribution/sources", { signal });
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
