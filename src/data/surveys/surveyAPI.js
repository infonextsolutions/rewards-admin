// Survey & Non-Gaming Offers API module
import apiClient from '../../lib/apiClient';

const surveyAPIs = {
  // Mock success response
  mockSuccess: () => Promise.resolve({ success: true }),

  // Mock delay for realistic behavior
  mockDelay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Get SDK list with pagination
  async getSDKList({ page = 1, limit = 10 } = {}) {
    try {
      const response = await apiClient.get('/admin/surveys/sdk/list', {
        params: {
          page,
          limit,
          search: '',
          status: 'all',
          category: 'all'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get SDK list error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new SDK
  async createSDK(sdkData) {
    try {
      const response = await apiClient.post('/admin/surveys/sdk', sdkData);
      return response.data;
    } catch (error) {
      console.error('Create SDK error:', error);
      throw error.response?.data || error;
    }
  },

  // Get SDK details by ID
  async getSDKDetails(sdkId) {
    try {
      const response = await apiClient.get(`/admin/surveys/sdk/${sdkId}`);
      return response.data;
    } catch (error) {
      console.error('Get SDK details error:', error);
      throw error.response?.data || error;
    }
  },

  // Update SDK configuration
  async updateSDKConfig(sdkId, configData) {
    try {
      const response = await apiClient.put(`/admin/surveys/sdk/${sdkId}/config`, configData);
      return response.data;
    } catch (error) {
      console.error('Update SDK config error:', error);
      throw error.response?.data || error;
    }
  },

  // Update SDK segment rules
  async updateSDKSegmentRules(sdkId, segmentRules) {
    try {
      const response = await apiClient.put(`/admin/surveys/sdk/${sdkId}/segments`, { segmentRules });
      return response.data;
    } catch (error) {
      console.error('Update SDK segment rules error:', error);
      throw error.response?.data || error;
    }
  },

  // Preview audience for segment rules
  async previewAudience(segmentRules) {
    try {
      const response = await apiClient.post('/admin/surveys/sdk/audience-preview', { segmentRules });
      return response.data;
    } catch (error) {
      console.error('Preview audience error:', error);
      throw error.response?.data || error;
    }
  },

  // Toggle SDK status (activate/deactivate)
  async toggleSDKStatus(sdkId) {
    try {
      const response = await apiClient.patch(`/admin/surveys/sdk/${sdkId}/status`);
      return response.data;
    } catch (error) {
      console.error('Toggle SDK status error:', error);
      throw error.response?.data || error;
    }
  },

  // Get live offers with pagination
  async getLiveOffers({ page = 1, limit = 20 } = {}) {
    try {
      const response = await apiClient.get('/admin/surveys/offers/live', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get live offers error:', error);
      throw error.response?.data || error;
    }
  },

  // Get offer details by ID
  async getOfferDetails(offerId) {
    try {
      const response = await apiClient.get(`/admin/surveys/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error('Get offer details error:', error);
      throw error.response?.data || error;
    }
  },

  // Update offer status
  async updateOfferStatus(offerId, status) {
    try {
      const response = await apiClient.patch(`/admin/surveys/offers/${offerId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update offer status error:', error);
      throw error.response?.data || error;
    }
  },

  // Update offer reward
  async updateOfferReward(offerId, coinReward) {
    try {
      const response = await apiClient.patch(`/admin/surveys/offers/${offerId}/reward`, { coinReward });
      return response.data;
    } catch (error) {
      console.error('Update offer reward error:', error);
      throw error.response?.data || error;
    }
  }
};

export default surveyAPIs;