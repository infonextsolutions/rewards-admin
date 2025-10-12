import apiClient from '../../lib/apiClient';

const spinWheelAPIs = {
  // Get spin wheel rewards with pagination
  async getRewards({
    page = 1,
    limit = 10
  } = {}) {
    try {
      const params = {
        page,
        limit
      };

      const response = await apiClient.get('/admin/spin-wheel/rewards', { params });
      return response.data;
    } catch (error) {
      console.error('Get spin wheel rewards error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new reward
  async createReward(formData) {
    try {
      const response = await apiClient.post('/admin/spin-wheel/rewards', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create reward error:', error);
      throw error.response?.data || error;
    }
  },

  // Update reward
  async updateReward(rewardId, formData) {
    try {
      const response = await apiClient.put(`/admin/spin-wheel/rewards/${rewardId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update reward error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete reward
  async deleteReward(rewardId) {
    try {
      const response = await apiClient.delete(`/admin/spin-wheel/rewards/${rewardId}`);
      return response.data;
    } catch (error) {
      console.error('Delete reward error:', error);
      throw error.response?.data || error;
    }
  },

  // Get spin wheel config/settings
  async getConfig() {
    try {
      const response = await apiClient.get('/admin/spin-wheel/config');
      return response.data;
    } catch (error) {
      console.error('Get spin wheel config error:', error);
      throw error.response?.data || error;
    }
  },

  // Save spin wheel config/settings
  async saveConfig(configData) {
    try {
      const response = await apiClient.post('/admin/spin-wheel/config', configData);
      return response.data;
    } catch (error) {
      console.error('Save spin wheel config error:', error);
      throw error.response?.data || error;
    }
  }
};

export default spinWheelAPIs;
