// Mock data operations for Survey & Non-Gaming Offers module
// This file provides mock functionality without API calls

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://rewardsapi.hireagent.co/api';

const surveyAPIs = {
  // Mock success response
  mockSuccess: () => Promise.resolve({ success: true }),

  // Mock delay for realistic behavior
  mockDelay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Get SDK list with pagination
  async getSDKList({ page = 1, limit = 10 } = {}) {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: '',
        status: 'all',
        category: 'all'
      });

      const response = await fetch(`${API_BASE}/admin/surveys/sdk/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get SDK list error:', error);
      throw error;
    }
  },

  // Create new SDK
  async createSDK(sdkData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/surveys/sdk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sdkData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Create SDK error:', error);
      throw error;
    }
  },

  // Get SDK details by ID
  async getSDKDetails(sdkId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/surveys/sdk/${sdkId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get SDK details error:', error);
      throw error;
    }
  },

  // Update SDK configuration
  async updateSDKConfig(sdkId, configData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/surveys/sdk/${sdkId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configData)
      });

      const data = await response.json();

      // Return data even if response is not ok, let caller handle it
      return data;
    } catch (error) {
      console.error('Update SDK config error:', error);
      throw error;
    }
  },

  // Update SDK segment rules
  async updateSDKSegmentRules(sdkId, segmentRules) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/surveys/sdk/${sdkId}/segments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ segmentRules })
      });

      const data = await response.json();

      // Return data even if response is not ok, let caller handle it
      return data;
    } catch (error) {
      console.error('Update SDK segment rules error:', error);
      throw error;
    }
  },

  // Preview audience for segment rules
  async previewAudience(segmentRules) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/surveys/sdk/audience-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ segmentRules })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Preview audience error:', error);
      throw error;
    }
  }
};

export default surveyAPIs;