import apiClient from '../../lib/apiClient';

const creativeAPIs = {
  // Get creatives with pagination and filters
  async getCreatives({
    page = 1,
    limit = 10
  } = {}) {
    try {
      const params = {
        page,
        limit
      };

      const response = await apiClient.get('/admin/creatives', { params });
      return response.data;
    } catch (error) {
      console.error('Get creatives error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new creative
  async createCreative(formData) {
    try {
      const response = await apiClient.post('/admin/creatives', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create creative error:', error);
      throw error.response?.data || error;
    }
  },

  // Get creative by ID
  async getCreativeById(creativeId) {
    try {
      const response = await apiClient.get(`/admin/creatives/${creativeId}`);
      return response.data;
    } catch (error) {
      console.error('Get creative by ID error:', error);
      throw error.response?.data || error;
    }
  },

  // Update creative
  async updateCreative(creativeId, formData) {
    try {
      const response = await apiClient.put(`/admin/creatives/${creativeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update creative error:', error);
      throw error.response?.data || error;
    }
  },

  // Toggle creative status (activate/deactivate)
  async toggleCreativeStatus(creativeId) {
    try {
      const response = await apiClient.patch(`/admin/creatives/${creativeId}/status`);
      return response.data;
    } catch (error) {
      console.error('Toggle creative status error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete creative
  async deleteCreative(creativeId) {
    try {
      const response = await apiClient.delete(`/admin/creatives/${creativeId}`);
      return response.data;
    } catch (error) {
      console.error('Delete creative error:', error);
      throw error.response?.data || error;
    }
  }
};

export default creativeAPIs;
