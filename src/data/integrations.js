import apiClient from "../lib/apiClient";

// API endpoints for integrations
export const INTEGRATION_API = {
  // Get all integrations with pagination and filtering
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.category) queryParams.append("category", params.category);
    if (params.active !== undefined)
      queryParams.append("active", params.active);

    return apiClient.get(`/integration?${queryParams.toString()}`);
  },

  // Get integration by ID
  getById: (id) => apiClient.get(`/integration/${id}`),

  // Create new integration
  create: (data) => apiClient.post("/integration", data),

  // Update integration
  update: (id, data) => apiClient.put(`/integration/${id}`, data),

  // Delete integration
  delete: (id) => apiClient.delete(`/integration/${id}`),

  // Toggle integration status
  toggleStatus: (id) => apiClient.patch(`/integration/${id}/toggle`),

  // Test connection (this would be a custom endpoint if available)
  testConnection: (id) => apiClient.post(`/integration/${id}/test`),
};

// Mock data removed - using real API integration only

// Integration categories for filtering - core 4 integrations only
export const INTEGRATION_CATEGORIES = [
  "All Categories",
  "Survey Platform",
  "Rewards Platform",
  "Customer Support",
  "Analytics",
];

// Connection status options
export const CONNECTION_STATUSES = [
  "All Statuses",
  "Connected",
  "Disconnected",
  "Failed",
  "Untested",
];

// Available integrations that can be added (only the 4 specified)
export const AVAILABLE_INTEGRATIONS = [
  {
    name: "Bitlabs",
    description: "Survey platform integration",
    category: "Survey Platform",
    defaultEndpoint: "https://api.bitlabs.ai/v1",
  },
  {
    name: "Tremendous",
    description: "Digital reward platform",
    category: "Rewards Platform",
    defaultEndpoint: "https://api.tremendous.com/api/v3",
  },
  {
    name: "Intercom",
    description: "Customer messaging platform",
    category: "Customer Support",
    defaultEndpoint: "https://api.intercom.io",
  },
  {
    name: "Everflow",
    description: "Attribution and analytics platform",
    category: "Analytics",
    defaultEndpoint: "https://api.everflow.io/v1",
  },
];
