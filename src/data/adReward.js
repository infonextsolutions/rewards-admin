import apiClient from "../lib/apiClient";

export const AD_REWARD_API = {
  getConfig: () => apiClient.get("/admin/ad-reward/config"),

  createConfig: (data) => apiClient.post("/admin/ad-reward/config", data),

  updateConfig: (id, data) => apiClient.put(`/admin/ad-reward/config/${id}`, data),

  getHistory: () => apiClient.get("/admin/ad-reward/config/history"),
};
