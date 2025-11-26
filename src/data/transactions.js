import apiClient from "../lib/apiClient";

// Transaction & Wallet API endpoints
export const TRANSACTION_API = {
  // Transaction Log endpoints
  getAllTransactions: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.type) queryParams.append("type", params.type);
    if (params.status) queryParams.append("status", params.status);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    return apiClient.get(`/admin/transactions?${queryParams.toString()}`);
  },

  getTransactionById: (id) => apiClient.get(`/admin/transactions/${id}`),

  getTransactionStats: () =>
    apiClient.get("/admin/transactions/stats/overview"),

  // Redemption Queue endpoints
  getPendingRedemptions: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit);
    return apiClient.get(
      `/admin/transactions/redemptions/pending?${queryParams.toString()}`
    );
  },

  approveRedemption: (transactionId) =>
    apiClient.post(`/admin/transactions/redemptions/${transactionId}/approve`),

  rejectRedemption: (transactionId, reason) =>
    apiClient.post(`/admin/transactions/redemptions/${transactionId}/reject`, {
      reason,
    }),

  getUserSneakPeek: (userId) =>
    apiClient.get(`/admin/transactions/users/${userId}/sneak-peek`),

  // Wallet Adjustments endpoints
  adjustWallet: (data) =>
    apiClient.post("/admin/transactions/wallet/adjust", data),

  getUserWallet: (userId) =>
    apiClient.get(`/admin/transactions/wallet/${userId}`),

  // Conversion Settings endpoints
  getConversionSettings: () =>
    apiClient.get("/admin/transactions/conversion/settings"),

  updateConversionSettings: (data) =>
    apiClient.put("/admin/transactions/conversion/settings", data),

  // Audit Trails endpoints
  getAuditLogs: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.adminId) queryParams.append("adminId", params.adminId);
    if (params.userId) queryParams.append("userId", params.userId);
    if (params.action) queryParams.append("action", params.action);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    return apiClient.get(
      `/admin/transactions/audit/logs?${queryParams.toString()}`
    );
  },

  getAuditActions: () => apiClient.get("/admin/transactions/audit/actions"),

  getAuditFilterOptions: () =>
    apiClient.get("/admin/transactions/audit/filter-options"),

  // Master Data endpoints
  getTransactionTypes: () => apiClient.get("/admin/transactions/meta/types"),
  getStatusOptions: () => apiClient.get("/admin/transactions/meta/statuses"),
};

// Transaction types and statuses
export const TRANSACTION_TYPES = [
  { value: "earn", label: "Earn" },
  { value: "redeem", label: "Redeem" },
  { value: "adjustment", label: "Adjustment" },
  { value: "bonus", label: "Bonus" },
  { value: "penalty", label: "Penalty" },
];

export const TRANSACTION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const BALANCE_TYPES = [
  { value: "coins", label: "Coins" },
  { value: "xp", label: "XP" },
  { value: "points", label: "Points" },
];

export const ADJUSTMENT_TYPES = [
  { value: "add", label: "Add" },
  { value: "subtract", label: "Subtract" },
];

// Default transaction data structure
export const DEFAULT_TRANSACTION = {
  id: "",
  userId: "",
  userName: "",
  userEmail: "",
  type: "earn",
  status: "pending",
  amount: 0,
  balanceType: "coins",
  description: "",
  timestamp: new Date().toISOString(),
  adminId: "",
  adminName: "",
  metadata: {},
};
