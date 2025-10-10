'use client';

import axios from 'axios';

const API_BASE = 'https://rewardsapi.hireagent.co';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const welcomeBonusTimerAPI = {
  /**
   * Get welcome bonus timer configuration
   */
  async getWelcomeBonusTimerRules() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/welcome-bonus-timer');

      // Check if response is array or single object
      const data = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;

      if (!data) {
        return null;
      }

      // Transform API response to frontend format
      return {
        id: data._id,
        unlockTimeHours: data.unlockTimeHours || 24,
        completionDeadlineDays: data.completionDeadlineDays || 7,
        gameOverrides: data.gameOverrides || [],
        xpTierOverrides: data.xpTierOverrides || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        metadata: data.metadata || {},
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    } catch (error) {
      console.error('Error fetching welcome bonus timer rules:', error);
      throw error;
    }
  },

  /**
   * Update welcome bonus timer configuration
   */
  async updateWelcomeBonusTimerRules(configData) {
    try {
      // Transform frontend data to API format
      const apiPayload = {
        unlockTimeHours: configData.unlockTimeHours || 24,
        completionDeadlineDays: configData.completionDeadlineDays || 7,
        gameOverrides: configData.gameOverrides || [],
        xpTierOverrides: configData.xpTierOverrides || [],
        isActive: configData.isActive !== undefined ? configData.isActive : true,
        metadata: {
          description: configData.metadata?.description || 'Welcome bonus timer configuration',
          notes: configData.metadata?.notes || '',
          version: configData.metadata?.version || '1.0'
        }
      };

      const response = await apiClient.put(
        '/api/admin/game-offers/welcome-bonus-timer',
        apiPayload
      );

      // Transform response back to frontend format
      const data = response.data.data;

      return {
        id: data._id,
        unlockTimeHours: data.unlockTimeHours || 24,
        completionDeadlineDays: data.completionDeadlineDays || 7,
        gameOverrides: data.gameOverrides || [],
        xpTierOverrides: data.xpTierOverrides || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        metadata: data.metadata || {},
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    } catch (error) {
      console.error('Error updating welcome bonus timer rules:', error);
      throw error;
    }
  }
};
