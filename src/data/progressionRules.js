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

export const progressionRulesAPI = {
  /**
   * Get all progression rules
   */
  async getProgressionRules() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/progression-rules');

      // Transform API response to frontend format
      const transformedRules = response.data.data.map(rule => {
        // Format lock type from API format (sequential) to display format (Sequential)
        const formatLockType = (type) => {
          if (!type) return 'Sequential';
          return type.charAt(0).toUpperCase() + type.slice(1);
        };

        return {
          id: rule._id,
          name: rule.metadata?.description || `Progression Rule for ${rule.taskId?.name || 'Task'}`,
          description: rule.metadata?.notes || 'Task progression rule',
          taskId: rule.taskId?._id || null,
          taskName: rule.taskId?.name || 'N/A',
          unlockCondition: rule.unlockCondition || 'N/A',
          lockType: formatLockType(rule.lockType),
          minimumEventToUnlock: `${rule.minimumEventsToUnlock || 0} events required`,
          rewardTriggerRule: rule.rewardTriggerRule || 'N/A',
          override: rule.gameOverride?.isEnabled || false,
          overrideByGameId: rule.gameOverride?.gameId || null,
          enabled: rule.isActive,
          conditions: rule.conditions || {},
          dependencies: rule.dependencies || [],
          gameId: rule.gameOverride?.gameId || null,
          gameName: rule.taskId?.name || 'N/A',
          affectedUsers: 0, // Not in API
          completionRate: 'N/A', // Not in API
          avgUnlockTime: 'N/A', // Not in API
          lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
          createdBy: new Date(rule.createdAt).toISOString(),
          // Additional fields for edit
          minimumEventsToUnlock: rule.minimumEventsToUnlock,
          metadata: rule.metadata || {},
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
          updatedBy: rule.updatedBy
        };
      });

      return transformedRules;
    } catch (error) {
      console.error('Error fetching progression rules:', error);
      throw error;
    }
  },

  /**
   * Create new progression rule
   */
  async createProgressionRule(ruleData) {
    try {
      // Transform frontend data to API format
      const apiPayload = {
        taskId: ruleData.taskId,
        unlockCondition: ruleData.unlockCondition || '',
        lockType: ruleData.lockType ? ruleData.lockType.toLowerCase() : 'sequential',
        minimumEventsToUnlock: ruleData.minimumEventsToUnlock || 0,
        rewardTriggerRule: ruleData.rewardTriggerRule || '',
        gameOverride: ruleData.gameOverride || {
          gameId: ruleData.gameId || null,
          isEnabled: ruleData.override || false
        },
        conditions: ruleData.conditions || {},
        dependencies: ruleData.dependencies || [],
        isActive: ruleData.enabled !== undefined ? ruleData.enabled : true,
        metadata: {
          description: ruleData.name || ruleData.metadata?.description || '',
          notes: ruleData.description || ruleData.metadata?.notes || '',
          priority: ruleData.metadata?.priority || 1
        }
      };

      const response = await apiClient.post('/api/admin/game-offers/progression-rules', apiPayload);

      // Transform response back to frontend format
      const rule = response.data.data;

      // Format lock type from API format (sequential) to display format (Sequential)
      const formatLockType = (type) => {
        if (!type) return 'Sequential';
        return type.charAt(0).toUpperCase() + type.slice(1);
      };

      return {
        id: rule._id,
        name: rule.metadata?.description || 'Progression Rule',
        description: rule.metadata?.notes || '',
        taskId: rule.taskId,
        taskName: 'N/A',
        unlockCondition: rule.unlockCondition || 'N/A',
        lockType: formatLockType(rule.lockType),
        minimumEventToUnlock: `${rule.minimumEventsToUnlock || 0} events required`,
        rewardTriggerRule: rule.rewardTriggerRule || 'N/A',
        override: rule.gameOverride?.isEnabled || false,
        overrideByGameId: rule.gameOverride?.gameId || null,
        enabled: rule.isActive,
        conditions: rule.conditions || {},
        dependencies: rule.dependencies || [],
        gameId: rule.gameOverride?.gameId || null,
        gameName: 'N/A',
        affectedUsers: 0,
        completionRate: 'N/A',
        avgUnlockTime: 'N/A',
        lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
        createdBy: new Date(rule.createdAt).toISOString(),
        minimumEventsToUnlock: rule.minimumEventsToUnlock,
        metadata: rule.metadata || {},
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt
      };
    } catch (error) {
      console.error('Error creating progression rule:', error);
      throw error;
    }
  },

  /**
   * Update existing progression rule
   */
  async updateProgressionRule(ruleId, ruleData) {
    try {
      // Transform frontend data to API format
      const apiPayload = {
        unlockCondition: ruleData.unlockCondition || '',
        lockType: ruleData.lockType ? ruleData.lockType.toLowerCase() : 'sequential',
        minimumEventsToUnlock: ruleData.minimumEventsToUnlock || ruleData.minimumEventToUnlock || 0,
        rewardTriggerRule: ruleData.rewardTriggerRule || '',
        conditions: ruleData.conditions || {},
        isActive: ruleData.enabled !== undefined ? ruleData.enabled : true,
        metadata: {
          description: ruleData.name || ruleData.metadata?.description || '',
          notes: ruleData.description || ruleData.metadata?.notes || '',
          priority: ruleData.metadata?.priority || 1
        }
      };

      const response = await apiClient.put(
        `/api/admin/game-offers/progression-rules/${ruleId}`,
        apiPayload
      );

      // Transform response back to frontend format
      const rule = response.data.data;

      // Format lock type from API format (sequential) to display format (Sequential)
      const formatLockType = (type) => {
        if (!type) return 'Sequential';
        return type.charAt(0).toUpperCase() + type.slice(1);
      };

      return {
        id: rule._id,
        name: rule.metadata?.description || 'Progression Rule',
        description: rule.metadata?.notes || '',
        taskId: rule.taskId,
        taskName: 'N/A',
        unlockCondition: rule.unlockCondition || 'N/A',
        lockType: formatLockType(rule.lockType),
        minimumEventToUnlock: `${rule.minimumEventsToUnlock || 0} events required`,
        rewardTriggerRule: rule.rewardTriggerRule || 'N/A',
        override: rule.gameOverride?.isEnabled || false,
        overrideByGameId: rule.gameOverride?.gameId || null,
        enabled: rule.isActive,
        conditions: rule.conditions || {},
        dependencies: rule.dependencies || [],
        gameId: rule.gameOverride?.gameId || null,
        gameName: 'N/A',
        affectedUsers: 0,
        completionRate: 'N/A',
        avgUnlockTime: 'N/A',
        lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
        createdBy: new Date(rule.createdAt).toISOString(),
        minimumEventsToUnlock: rule.minimumEventsToUnlock,
        metadata: rule.metadata || {},
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
        updatedBy: rule.updatedBy
      };
    } catch (error) {
      console.error('Error updating progression rule:', error);
      throw error;
    }
  }
};
