import apiClient from '../lib/apiClient';

export const ACCOUNT_OVERVIEW_API = {
  getConfig: () => apiClient.get('/admin/account-overview/config'),

  createConfig: (data) => apiClient.post('/admin/account-overview/config', data),

  updateConfig: (id, data) => apiClient.put(`/admin/account-overview/config/${id}`, data),

  getHistory: () => apiClient.get('/admin/account-overview/config/history'),

  getConfigById: (id) => apiClient.get(`/admin/account-overview/config/${id}`),
};
