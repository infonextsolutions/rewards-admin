import apiClient from "../lib/apiClient";

// Security Settings API endpoints
export const SECURITY_API = {
  // Get all security settings with pagination and filtering
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.userRole) queryParams.append("userRole", params.userRole);
    if (params.status) queryParams.append("status", params.status);

    return apiClient.get(`/security-settings?${queryParams.toString()}`);
  },

  // Get security settings by ID
  getById: (id) => apiClient.get(`/security-settings/${id}`),

  // Create new security settings
  create: (data) => apiClient.post("/security-settings", data),

  // Update security settings
  update: (id, data) => apiClient.put(`/security-settings/${id}`, data),

  // Delete security settings
  delete: (id) => apiClient.delete(`/security-settings/${id}`),

  // Test SDK connection
  testConnection: (data) =>
    apiClient.post("/security-settings/test-connection", data),
};

// Security settings constants
export const VERIFICATION_METHODS = [
  { value: "native", label: "Native" },
  { value: "hybrid", label: "Hybrid" },
  { value: "third_party", label: "Third Party" },
];

export const RETRY_TYPES = [
  { value: "otp", label: "OTP" },
  { value: "biometric", label: "Biometric" },
  { value: "pin", label: "PIN" },
];

export const USER_ROLES = [
  { value: "player", label: "Player" },
  { value: "admin", label: "Admin" },
  { value: "vip", label: "VIP" },
  { value: "guest", label: "Guest" },
  { value: "premium", label: "Premium" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

// SDK Providers for third-party verification
export const SDK_PROVIDERS = [
  "FaceIO",
  "RecognitionIO",
  "BiometricAuth",
  "SecureVision",
];

// Default security settings
export const DEFAULT_SECURITY_SETTINGS = {
  name: "",
  verificationMethod: "native",
  retryType: "otp",
  retryLimit: 3,
  lockDuration: 10,
  userRole: "player",
  status: "active",
};
