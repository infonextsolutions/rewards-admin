import apiClient from '../../lib/apiClient';

const userAPIs = {
  // Get users with pagination and filters
  async getUsers({
    page = 1,
    limit = 10,
    search = '',
    tier = '',
    status = '',
    gender = '',
    ageRange = '',
    memberSince = '',
    location = ''
  } = {}) {
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(tier && { tier }),
        ...(status && { status }),
        ...(gender && { gender }),
        ...(ageRange && { ageRange }),
        ...(memberSince && { memberSince }),
        ...(location && { location })
      };

      const response = await apiClient.get('/admin/users', { params });
      console.log('🔵 User API Route - Response from backend:', response.data);
      console.log('🔵 User API Route - Users data:', response.data?.data?.users);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error.response?.data || error;
    }
  },

  // Get user details by ID
  async getUserDetails(userId) {
    try {
      console.log('🔵 [UserAPI] Fetching user details for ID:', userId);
      const response = await apiClient.get(`/admin/users/${userId}`);
      
      // Debug: Log full response
      console.log('🔵 [UserAPI] Full API Response:', response.data);
      console.log('🔵 [UserAPI] Response Success:', response.data?.success);
      console.log('🔵 [UserAPI] User Data:', response.data?.data);
      
      // Debug: Log specific fields we care about
      const userData = response.data?.data;
      if (userData) {
        console.log('🔵 [UserAPI] Redemption Data:', {
          redemptionsMade: userData.redemptionsMade,
          redemptionBreakdown: userData.redemptionBreakdown,
          redemptionCount: userData.redemptionBreakdown?.count,
          totalCoins: userData.redemptionBreakdown?.totalCoins,
          lastRedeemed: userData.redemptionBreakdown?.lastRedeemed
        });
        
        console.log('🔵 [UserAPI] Spin Data:', {
          spinUsage: userData.spinUsage,
          spinCount: userData.spinCount,
          lastSpinAt: userData.lastSpinAt,
          userSpinCount: userData.user?.spinCount
        });
        
        console.log('🔵 [UserAPI] Wallet Data:', {
          wallet: userData.wallet,
          walletBalance: userData.wallet?.balance,
          walletTransactions: userData.wallet?.transactions?.length || 0
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [UserAPI] Get user details error:', error);
      console.error('❌ [UserAPI] Error response:', error.response?.data);
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
        ...(filters.location && { location: filters.location })
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
      console.log('🔵 User API - Unique locations from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get unique locations error:', error);
      throw error.response?.data || error;
    }
  }
};

export default userAPIs;
