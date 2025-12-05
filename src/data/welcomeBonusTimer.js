'use client';

import apiClient from '../lib/apiClient';

export const welcomeBonusTimerAPI = {
  /**
   * Get welcome bonus timer configuration
   */
  async getWelcomeBonusTimerRules() {
    try {
      const response = await apiClient.get('/admin/game-offers/welcome-bonus-timer');

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
        '/admin/game-offers/welcome-bonus-timer',
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
  },

  /**
   * Save or update game bonus tasks configuration
   */
  async saveGameBonusTasks(gameId, configData) {
    try {
      const apiPayload = {
        minimumEventThreshold: configData.minimumEventThreshold,
        bonusTasks: configData.bonusTasks.map(bt => ({
          taskId: bt.taskId,
          order: bt.order,
          unlockCondition: bt.unlockCondition || "Unlock this Bonus Task after Minimum Event Threshold is met."
        }))
      };

      const response = await apiClient.post(
        `/admin/game-offers/welcome-bonus-timer/game/${gameId}/bonus-tasks`,
        apiPayload
      );

      return response.data.data;
    } catch (error) {
      console.error('Error saving game bonus tasks:', error);
      throw error;
    }
  },

  /**
   * Get game bonus tasks configuration
   */
  async getGameBonusTasks(gameId) {
    try {
      const response = await apiClient.get(
        `/admin/game-offers/welcome-bonus-timer/game/${gameId}`
      );

      return response.data.data;
    } catch (error) {
      // If 404 or no data, return null (no configuration exists)
      if (error.response?.status === 404 || !error.response?.data?.data) {
        return null;
      }
      console.error('Error fetching game bonus tasks:', error);
      throw error;
    }
  }
};
