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

export const gamesAPI = {
  /**
   * Create new game
   */
  async createGame(gameData) {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add all fields to FormData
      Object.keys(gameData).forEach(key => {
        const value = gameData[key];

        // Handle file uploads
        if (key === 'gameThumbnail' && value instanceof File) {
          formData.append(key, value);
        }
        // Handle arrays - stringify them
        else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        }
        // Handle null/undefined
        else if (value === null || value === undefined) {
          // Skip null/undefined values
        }
        // Handle other values
        else {
          formData.append(key, value);
        }
      });

      const response = await apiClient.post('/api/admin/game-offers/games', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Transform response back to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        title: game.title || 'Untitled Game',
        sdk: game.sdkProvider || 'N/A',
        xptrRules: game.xptrRules || 'No rules defined',
        taskCount: 0,
        activeTasks: 0,
        countries: game.countries || [],
        status: game.isActive ? 'Active' : 'Inactive',
        rewardXP: 0,
        rewardCoins: 0,
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime ? `${game.metadata.estimatedPlayTime} min` : 'N/A',
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0,
        installRate: 0,
        marketingChannel: 'N/A',
        campaign: 'N/A',
        xpTier: game.xptrRules || 'All',
        tier: game.tierRestrictions?.minTier ? game.tierRestrictions.minTier.charAt(0).toUpperCase() + game.tierRestrictions.minTier.slice(1) : 'All',
        // Additional fields for preview/edit
        description: game.description || '',
        tags: game.tags || [],
        metadata: game.metadata || {},
        tierRestrictions: game.tierRestrictions || {},
        displayRules: game.displayRules || {},
        analytics: game.analytics || {}
      };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  /**
   * Update game
   */
  async updateGame(gameId, gameData) {
    try {
      // Create FormData for file upload (same as create)
      const formData = new FormData();

      // Add all fields to FormData
      Object.keys(gameData).forEach(key => {
        const value = gameData[key];

        // Handle file uploads
        if (key === 'gameThumbnail' && value instanceof File) {
          formData.append(key, value);
        }
        // Handle arrays - stringify them
        else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        }
        // Handle null/undefined
        else if (value === null || value === undefined) {
          // Skip null/undefined values
        }
        // Handle other values
        else {
          formData.append(key, value);
        }
      });

      const response = await apiClient.put(`/api/admin/game-offers/games/${gameId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Transform response back to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        title: game.title || 'Untitled Game',
        sdk: game.sdkProvider || 'N/A',
        xptrRules: game.xptrRules || 'No rules defined',
        taskCount: game.taskCount || 0,
        activeTasks: 0,
        countries: game.countries || [],
        status: game.isActive ? 'Active' : 'Inactive',
        rewardXP: 0,
        rewardCoins: 0,
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime ? `${game.metadata.estimatedPlayTime} min` : 'N/A',
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0,
        installRate: 0,
        marketingChannel: 'N/A',
        campaign: 'N/A',
        xpTier: game.xptrRules || 'All',
        tier: game.tierRestrictions?.minTier ? game.tierRestrictions.minTier.charAt(0).toUpperCase() + game.tierRestrictions.minTier.slice(1) : 'All',
        // Additional fields for preview/edit
        description: game.description || '',
        tags: game.tags || [],
        metadata: game.metadata || {},
        tierRestrictions: game.tierRestrictions || {},
        displayRules: game.displayRules || {},
        analytics: game.analytics || {},
        active: game.isActive
      };
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  /**
   * Get single game by ID
   */
  async getGameById(gameId) {
    try {
      const response = await apiClient.get(`/api/admin/game-offers/games/${gameId}`);

      // Transform response to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        title: game.title || 'Untitled Game',
        sdk: game.sdkProvider || 'N/A',
        xptrRules: game.xptrRules || 'No rules defined',
        taskCount: game.taskCount || 0,
        activeTasks: 0, // Not in API, placeholder
        countries: game.countries || [],
        status: game.isActive ? 'Active' : 'Inactive',
        rewardXP: 0, // Not in API
        rewardCoins: 0, // Not in API
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime ? `${game.metadata.estimatedPlayTime} min` : 'N/A',
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0, // Not in API
        installRate: 0, // Not in API
        marketingChannel: 'N/A', // Not in API
        campaign: 'N/A', // Not in API
        xpTier: game.xptrRules || 'All',
        tier: game.tierRestrictions?.minTier ? game.tierRestrictions.minTier.charAt(0).toUpperCase() + game.tierRestrictions.minTier.slice(1) : 'All',
        // Additional fields for preview/edit
        description: game.description || '',
        tags: game.tags || [],
        metadata: game.metadata || {},
        tierRestrictions: game.tierRestrictions || {},
        displayRules: game.displayRules || {},
        analytics: game.analytics || {},
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        createdBy: game.createdBy
      };
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  /**
   * Get all games with pagination and filters
   */
  async getGames(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 10);

      // Add filter params - only add if they have actual values
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }
      if (params.country && params.country.trim() !== '') {
        queryParams.append('country', params.country);
      }
      if (params.sdkProvider && params.sdkProvider.trim() !== '') {
        queryParams.append('sdkProvider', params.sdkProvider);
      }
      if (params.xptr && params.xptr.trim() !== '') {
        queryParams.append('xptr', params.xptr);
      }
      if (params.adGame && params.adGame.trim() !== '') {
        queryParams.append('adGame', params.adGame);
      }
      if (params.status && params.status !== 'all' && params.status.trim() !== '') {
        queryParams.append('status', params.status);
      }

      const response = await apiClient.get(`/api/admin/game-offers/games?${queryParams.toString()}`);

      // Transform API response to frontend format
      const transformedGames = response.data.data.games.map(game => {
        return {
          id: game._id,
          name: game.title || 'Untitled Game', // For dropdowns and selectors
          title: game.title || 'Untitled Game',
          sdk: game.sdkProvider || 'N/A',
          xptrRules: game.xptrRules || 'No rules defined',
          taskCount: game.taskCount || 0,
          activeTasks: 0, // Not in API, placeholder
          countries: game.countries || [],
          status: game.isActive ? 'Active' : 'Inactive',
          rewardXP: 0, // Not in API
          rewardCoins: 0, // Not in API
          adSupported: game.isAdSupported || false,
          engagementTime: game.metadata?.estimatedPlayTime ? `${game.metadata.estimatedPlayTime} min` : 'N/A',
          retentionRate: game.analytics?.retentionRate || 0,
          clickRate: 0, // Not in API
          installRate: 0, // Not in API
          marketingChannel: 'N/A', // Not in API
          campaign: 'N/A', // Not in API
          xpTier: game.xptrRules || 'All',
          tier: game.tierRestrictions?.minTier ? game.tierRestrictions.minTier.charAt(0).toUpperCase() + game.tierRestrictions.minTier.slice(1) : 'All',
          // Additional fields for preview/edit
          description: game.description || '',
          tags: game.tags || [],
          metadata: game.metadata || {},
          tierRestrictions: game.tierRestrictions || {},
          displayRules: game.displayRules || {},
          analytics: game.analytics || {}
        };
      });

      return {
        games: transformedGames,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  /**
   * Delete game
   */
  async deleteGame(gameId) {
    try {
      const response = await apiClient.delete(`/api/admin/game-offers/games/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }
};
