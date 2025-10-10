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

export const tasksAPI = {
  /**
   * Get all tasks across all games
   */
  async getAllTasks(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 100);

      // Add search param if provided
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }

      const response = await apiClient.get(
        `/api/admin/game-offers/tasks?${queryParams.toString()}`
      );

      // Transform API response to frontend format
      const transformedTasks = response.data.data.tasks.map(task => {
        return {
          id: task._id,
          gameId: task.gameId,
          name: task.name,
          description: task.description,
          completionRule: task.completionRule,
          rewardType: task.rewardType,
          rewardValue: task.rewardValue,
          tierRestriction: task.tierRestriction,
          isOverride: task.isOverride,
          order: task.order,
          isActive: task.isActive,
          status: task.isActive ? 'Active' : 'Inactive',
          metadata: task.metadata || {},
          progression: task.progression || {},
          analytics: task.analytics || {},
          createdBy: task.createdBy,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          updatedBy: task.updatedBy
        };
      });

      return {
        tasks: transformedTasks,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }
  },

  /**
   * Get tasks for a specific game with pagination and search
   */
  async getTasksForGame(gameId, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 10);

      // Add search param if provided
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }

      const response = await apiClient.get(
        `/api/admin/game-offers/games/${gameId}/tasks?${queryParams.toString()}`
      );

      // Transform API response to frontend format
      const transformedTasks = response.data.data.tasks.map(task => {
        return {
          id: task._id,
          gameId: task.gameId,
          name: task.name,
          description: task.description,
          completionRule: task.completionRule,
          rewardType: task.rewardType,
          rewardValue: task.rewardValue,
          tierRestriction: task.tierRestriction,
          isOverride: task.isOverride,
          order: task.order,
          isActive: task.isActive,
          status: task.isActive ? 'Active' : 'Inactive',
          metadata: task.metadata || {},
          progression: task.progression || {},
          analytics: task.analytics || {},
          createdBy: task.createdBy,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          updatedBy: task.updatedBy
        };
      });

      return {
        tasks: transformedTasks,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Create new task for a game
   */
  async createTask(gameId, taskData) {
    try {
      // Map frontend tier restriction values to API enum values
      const mapTierRestriction = (tier) => {
        const tierMap = {
          'Bronze': 'bronze',
          'Gold': 'gold',
          'Platinum': 'platinum',
          'All Tiers': 'free'
        };
        return tierMap[tier] || tier.toLowerCase();
      };

      // Map frontend reward type to API enum values
      const mapRewardType = (type) => {
        const rewardMap = {
          'XP': 'xp',
          'Coins': 'coins',
          'XP + Coins': 'xp',
          'XP Boost': 'xp',
          'Coins + XP Boost': 'coins'
        };
        return rewardMap[type] || type.toLowerCase();
      };

      // Transform frontend data to API format
      const apiPayload = {
        name: taskData.name || taskData.taskName,
        description: taskData.description || '',
        completionRule: taskData.completionRule || taskData.milestoneLogic || '',
        rewardType: mapRewardType(taskData.rewardType) || 'xp',
        rewardValue: parseInt(taskData.rewardValue) || 0,
        tierRestriction: mapTierRestriction(taskData.tierRestriction) || 'free',
        isOverride: taskData.isOverride || false,
        order: parseInt(taskData.order) || 1,
        metadata: {
          estimatedTimeMinutes: parseInt(taskData.metadata?.estimatedTimeMinutes) || 0,
          difficulty: taskData.metadata?.difficulty || 'easy',
          category: taskData.metadata?.category || 'engagement',
          requirements: {
            minLevel: parseInt(taskData.metadata?.requirements?.minLevel) || 1,
            vipRequired: taskData.metadata?.requirements?.vipRequired || 'free',
            maxPerDay: taskData.metadata?.requirements?.maxPerDay || null
          },
          conditions: {
            minPlayTime: parseInt(taskData.metadata?.conditions?.minPlayTime) || 0,
            minScore: parseInt(taskData.metadata?.conditions?.minScore) || 0,
            minLevel: parseInt(taskData.metadata?.conditions?.minLevel) || 1
          }
        }
      };

      const response = await apiClient.post(
        `/api/admin/game-offers/games/${gameId}/tasks`,
        apiPayload
      );

      // Transform response back to frontend format
      const task = response.data.data;

      return {
        id: task._id,
        gameId: task.gameId,
        name: task.name,
        description: task.description,
        completionRule: task.completionRule,
        rewardType: task.rewardType,
        rewardValue: task.rewardValue,
        tierRestriction: task.tierRestriction,
        isOverride: task.isOverride,
        order: task.order,
        isActive: task.isActive,
        status: task.isActive ? 'Active' : 'Inactive',
        metadata: task.metadata || {},
        progression: task.progression || {},
        analytics: task.analytics || {},
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update existing task
   */
  async updateTask(taskId, taskData) {
    try {
      // Map frontend tier restriction values to API enum values
      const mapTierRestriction = (tier) => {
        const tierMap = {
          'Bronze': 'bronze',
          'Gold': 'gold',
          'Platinum': 'platinum',
          'All Tiers': 'free'
        };
        return tierMap[tier] || tier.toLowerCase();
      };

      // Map frontend reward type to API enum values
      const mapRewardType = (type) => {
        const rewardMap = {
          'XP': 'xp',
          'Coins': 'coins',
          'XP + Coins': 'xp',
          'XP Boost': 'xp',
          'Coins + XP Boost': 'coins'
        };
        return rewardMap[type] || type.toLowerCase();
      };

      // Transform frontend data to API format
      const apiPayload = {
        name: taskData.name || taskData.taskName,
        description: taskData.description || '',
        completionRule: taskData.completionRule || taskData.milestoneLogic || '',
        rewardType: mapRewardType(taskData.rewardType) || 'xp',
        rewardValue: parseInt(taskData.rewardValue) || 0,
        tierRestriction: mapTierRestriction(taskData.tierRestriction) || 'free',
        metadata: {
          estimatedTimeMinutes: parseInt(taskData.metadata?.estimatedTimeMinutes) || 0,
          difficulty: taskData.metadata?.difficulty || 'easy',
          category: taskData.metadata?.category || 'engagement',
          requirements: {
            minLevel: parseInt(taskData.metadata?.requirements?.minLevel) || 1,
            vipRequired: taskData.metadata?.requirements?.vipRequired || 'free',
            maxPerDay: taskData.metadata?.requirements?.maxPerDay || null
          },
          conditions: {
            minPlayTime: parseInt(taskData.metadata?.conditions?.minPlayTime) || 0,
            minScore: parseInt(taskData.metadata?.conditions?.minScore) || 0,
            minLevel: parseInt(taskData.metadata?.conditions?.minLevel) || 1
          }
        }
      };

      const response = await apiClient.put(
        `/api/admin/game-offers/tasks/${taskId}`,
        apiPayload
      );

      // Transform response back to frontend format
      const task = response.data.data;

      return {
        id: task._id,
        gameId: task.gameId,
        name: task.name,
        description: task.description,
        completionRule: task.completionRule,
        rewardType: task.rewardType,
        rewardValue: task.rewardValue,
        tierRestriction: task.tierRestriction,
        isOverride: task.isOverride,
        order: task.order,
        isActive: task.isActive,
        status: task.isActive ? 'Active' : 'Inactive',
        metadata: task.metadata || {},
        progression: task.progression || {},
        analytics: task.analytics || {},
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        updatedBy: task.updatedBy
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    try {
      const response = await apiClient.delete(
        `/api/admin/game-offers/tasks/${taskId}`
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};
