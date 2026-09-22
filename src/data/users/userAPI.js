import apiClient from '../../lib/apiClient';

const userAPIs = {
  // Get users with pagination and filters
  async getUsers({
    page = 1,
    limit = 10,
    search = '',
    id = '',
    tier = '',
    status = '',
    gender = '',
    ageRange = '',
    memberSince = '',
    location = '',
    marketingChannel = ''
  } = {}) {
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(id && { id }),
        ...(tier && { tier }),
        ...(status && { status }),
        ...(gender && { gender }),
        ...(ageRange && { ageRange }),
        ...(memberSince && { memberSince }),
        ...(location && { location }),
        ...(marketingChannel && { marketingChannel })
      };

      const response = await apiClient.get('/admin/users', { params });

      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error.response?.data || error;
    }
  },

  // Get user details by ID
  async getUserDetails(userId) {
    try {

      const response = await apiClient.get(`/admin/users/${userId}`);

      return response.data;
    } catch (error) {
      console.error('Get user details failed:', error.message);
      throw error.response?.data || error;
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error.response?.data || error;
    }
  },

  // Update user status (suspend/activate)
  async updateUserStatus(userId, status, reason = '') {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error.response?.data || error;
    }
  },

  // Send notification to user
  async sendNotification(userId, message, type = 'info') {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/notifications`, {
        message,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Send notification error:', error);
      throw error.response?.data || error;
    }
  },

  // Export users to CSV
  async exportUsers(format = 'csv', filters = {}) {
    try {
      const params = {
        format,
        ...(filters.search && { search: filters.search }),
        ...(filters.tier && { tier: filters.tier }),
        ...(filters.status && { status: filters.status }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.ageRange && { ageRange: filters.ageRange }),
        ...(filters.memberSince && { memberSince: filters.memberSince }),
        ...(filters.location && { location: filters.location }),
        ...(filters.marketingChannel && { marketingChannel: filters.marketingChannel })
      };

      const response = await apiClient.get('/admin/users/export', {
        params,
        responseType: 'blob' // Important for file download
      });

      // Create blob and download file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Users exported successfully' };
    } catch (error) {
      console.error('Export users error:', error);
      throw error.response?.data || error;
    }
  },

  // Get all unique locations
  async getUniqueLocations() {
    try {
      const response = await apiClient.get('/admin/users/locations');

      return response.data;
    } catch (error) {
      console.error('Get unique locations error:', error);
      throw error.response?.data || error;
    }
  },

  // Get all unique marketing channels
  async getUniqueMarketingChannels() {
    try {
      const response = await apiClient.get('/admin/users/marketing-channels');

      return response.data;
    } catch (error) {
      console.error('Get unique marketing channels error:', error);
      throw error.response?.data || error;
    }
  }
};

export default userAPIs;
