"use client";

import apiClient from "../lib/apiClient";

// XP Tier mapping: Frontend strings to Backend numbers
const XP_TIER_MAP = {
  Junior: 1,
  Mid: 2,
  Senior: 3,
  All: null, // null means no tier restriction
};

// Reverse mapping: Backend numbers to Frontend strings
const XP_TIER_REVERSE_MAP = {
  1: "Junior",
  2: "Mid",
  3: "Senior",
  4: "Senior", // Fallback for higher numbers
  5: "Senior",
  6: "Senior",
  7: "Senior",
  8: "Senior",
  9: "Senior",
  10: "Senior",
};

// Helper function to convert XP Tier string to number
function xpTierStringToNumber(xpTierString) {
  if (!xpTierString || xpTierString === "All" || xpTierString === "") {
    return null;
  }
  return XP_TIER_MAP[xpTierString] || 1;
}

// Helper function to convert XP Tier number to string
function xpTierNumberToString(xpTierNumber) {
  if (xpTierNumber === null || xpTierNumber === undefined) {
    return "All";
  }
  return XP_TIER_REVERSE_MAP[xpTierNumber] || "Junior";
}

export const gamesAPI = {
  /**
   * Create new game
   */
  async createGame(gameData) {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add all fields to FormData
      Object.keys(gameData).forEach((key) => {
        const value = gameData[key];

        // Handle file uploads
        if (key === "gameThumbnail" && value instanceof File) {
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

      const response = await apiClient.post(
        "/admin/game-offers/games",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Transform response back to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        title: game.title || "Untitled Game",
        sdk: game.sdkProvider || "N/A",
        xptrRules: game.xptrRules || "No rules defined",
        taskCount: 0,
        activeTasks: 0,
        // Countries field removed from Game model
        status: game.isActive ? "Active" : "Inactive",
        rewardXP: 0,
        rewardCoins: 0,
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime
          ? `${game.metadata.estimatedPlayTime} min`
          : "N/A",
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0,
        installRate: 0,
        marketingChannel: "N/A",
        campaign: "N/A",
        xpTier: xpTierNumberToString(game.xpTier),
        xpTiers: game.xpTiers || [],
        baseXP: game.xpRewardConfig?.baseXP || 0,
        xpMultiplier: game.xpRewardConfig?.multiplier || 1.0,
        xpRewardConfig: game.xpRewardConfig || { baseXP: 0, multiplier: 1.0 },
        tier: game.tierRestrictions?.minTier
          ? game.tierRestrictions.minTier.charAt(0).toUpperCase() +
            game.tierRestrictions.minTier.slice(1)
          : "All",
        gameCategory: game.category || "N/A",
        uiSection: game.uiSection || "",
        // Additional fields for preview/edit
        description: game.description || "",
        tags: game.tags || [],
        metadata: game.metadata || {},
        tierRestrictions: game.tierRestrictions || {},
        displayRules: game.displayRules || {},
        analytics: game.analytics || {},
      };
    } catch (error) {
      console.error("Error creating game:", error);
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
      Object.keys(gameData).forEach((key) => {
        const value = gameData[key];

        // Handle file uploads
        if (key === "gameThumbnail" && value instanceof File) {
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

      const response = await apiClient.put(
        `/admin/game-offers/games/${gameId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Transform response back to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        title: game.title || "Untitled Game",
        sdk: game.sdkProvider || "N/A",
        xptrRules: game.xptrRules || "No rules defined",
        taskCount: game.taskCount || 0,
        activeTasks: 0,
        // Countries field removed from Game model
        status: game.isActive ? "Active" : "Inactive",
        rewardXP: 0,
        rewardCoins: 0,
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime
          ? `${game.metadata.estimatedPlayTime} min`
          : "N/A",
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0,
        installRate: 0,
        marketingChannel: "N/A",
        campaign: "N/A",
        xpTier: xpTierNumberToString(game.xpTier),
        xpTiers: game.xpTiers || [],
        baseXP: game.xpRewardConfig?.baseXP || 0,
        xpMultiplier: game.xpRewardConfig?.multiplier || 1.0,
        xpRewardConfig: game.xpRewardConfig || { baseXP: 0, multiplier: 1.0 },
        tier: game.tierRestrictions?.minTier
          ? game.tierRestrictions.minTier.charAt(0).toUpperCase() +
            game.tierRestrictions.minTier.slice(1)
          : "All",
        gameCategory: game.category || "N/A",
        uiSection: game.uiSection || "",
        // Additional fields for preview/edit
        description: game.description || "",
        tags: game.tags || [],
        metadata: game.metadata || {},
        tierRestrictions: game.tierRestrictions || {},
        displayRules: game.displayRules || {},
        analytics: game.analytics || {},
        active: game.isActive,
      };
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  },

  /**
   * Get single game by ID
   */
  async getGameById(gameId) {
    try {
      const response = await apiClient.get(
        `/admin/game-offers/games/${gameId}`
      );

      // Transform response to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        gameId: game.gameId,
        title: game.title || "Untitled Game",
        sdk: game.sdkProvider || "N/A",
        xptrRules: game.xptrRules || "No rules defined",
        taskCount: game.taskCount || 0,
        activeTasks: 0, // Not in API, placeholder
        // Countries field removed from Game model
        status: game.isActive ? "Active" : "Inactive",
        rewardXP: game.rewards?.xp || 0,
        rewardCoins: game.rewards?.coins || 0,
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime
          ? `${game.metadata.estimatedPlayTime} min`
          : "N/A",
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0, // Not in API
        installRate: 0, // Not in API
        marketingChannel: game.marketingChannel || "",
        campaign: game.campaignName || "",
        xpTier: xpTierNumberToString(game.xpTier),
        xpTiers: game.xpTiers || [],
        baseXP: game.xpRewardConfig?.baseXP || 0,
        xpMultiplier: game.xpRewardConfig?.multiplier || 1.0,
        xpRewardConfig: game.xpRewardConfig || { baseXP: 0, multiplier: 1.0 },
        tier: game.tierRestrictions?.minTier
          ? game.tierRestrictions.minTier.charAt(0).toUpperCase() +
            game.tierRestrictions.minTier.slice(1)
          : "All",
        gameCategory: game.category || "N/A",
        uiSection: game.uiSection || "",
        // Additional fields for preview/edit
        description: game.description || "",
        tags: game.tags || [],
        metadata: game.metadata || {},
        tierRestrictions: game.tierRestrictions || {},
        displayRules: game.displayRules || {},
        analytics: game.analytics || {},
        // Segments data for targeting
        segments: {
          ageGroups: game.ageGroups || [],
          gender: game.gender || "",
          country: game.country || "",
          city: game.city || "",
          marketingChannel: game.marketingChannel || "",
          campaignName: game.campaignName || "",
        },
        // Legacy fields for backward compatibility
        ageGroups: game.ageGroups || [],
        gender: game.gender || "",
        country: game.country || "",
        city: game.city || "",
        campaignName: game.campaignName || "",
        activeVisible: game.isActive !== undefined ? game.isActive : true,
        fallbackGame: game.isDefaultFallback || false,
        thumbnail: game.gameThumbnail || null,
        thumbnailWidth: game.thumbnailWidth || 300,
        thumbnailHeight: game.thumbnailHeight || 300,
        thumbnailAltText: game.thumbnailAltText || "",
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        createdBy: game.createdBy,
        thirdPartyGameData: game.thirdPartyGameData || game.besitosRawData || null,
      };
    } catch (error) {
      console.error("Error fetching game:", error);
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
      queryParams.append("page", params.page || 1);
      queryParams.append("limit", params.limit || 10);

      // Add filter params - only add if they have actual values
      if (params.search && params.search.trim() !== "") {
        queryParams.append("search", params.search);
      }
      if (
        params.country &&
        params.country !== "all" &&
        params.country.trim() !== ""
      ) {
        queryParams.append("country", params.country);
      }
      if (
        params.sdkProvider &&
        params.sdkProvider !== "all" &&
        params.sdkProvider.trim() !== ""
      ) {
        queryParams.append("sdkProvider", params.sdkProvider);
      }
      if (params.sdk && params.sdk !== "all" && params.sdk.trim() !== "") {
        queryParams.append("sdkProvider", params.sdk);
      }
      if (params.xptr && params.xptr.trim() !== "") {
        queryParams.append("xptr", params.xptr);
      }
      if (
        params.xpTier &&
        params.xpTier !== "all" &&
        params.xpTier !== "All" &&
        params.xpTier.trim() !== ""
      ) {
        // Convert XP Tier string to number for backend
        // Handle both string values (Junior, Mid, Senior) and numeric strings
        let xpTierNum = null;
        if (typeof params.xpTier === "string" && !isNaN(parseInt(params.xpTier))) {
          // If it's already a number string, use it directly
          xpTierNum = parseInt(params.xpTier);
        } else {
          // Convert string tier name to number
          xpTierNum = xpTierStringToNumber(params.xpTier);
        }
        if (xpTierNum !== null) {
          queryParams.append("xpTier", xpTierNum.toString());
        }
      }
      if (
        params.adGame &&
        params.adGame !== "all" &&
        params.adGame.trim() !== ""
      ) {
        const adGameValue =
          params.adGame === "yes"
            ? "true"
            : params.adGame === "no"
            ? "false"
            : params.adGame;
        queryParams.append("adGame", adGameValue);
      }
      if (
        params.status &&
        params.status !== "all" &&
        params.status.trim() !== ""
      ) {
        queryParams.append("status", params.status);
      }
      if (
        params.gender &&
        params.gender !== "all" &&
        params.gender.trim() !== ""
      ) {
        queryParams.append("gender", params.gender);
      }

      const response = await apiClient.get(
        `/admin/game-offers/games?${queryParams.toString()}`
      );

      // Transform API response to frontend format
      const transformedGames = response.data.data.games.map((game) => {
        return {
          id: game._id,
          gameId: game.gameId, // Include gameId from API
          name: game.title || "Untitled Game", // For dropdowns and selectors
          title: game.title || "Untitled Game",
          sdk: game.sdkProvider || "N/A",
          xptrRules: game.xptrRules || "No rules defined",
          taskCount: game.defaultTaskCount !== undefined ? game.defaultTaskCount : (game.taskCount || 0),
          defaultTasks: game.defaultTaskCount !== undefined ? game.defaultTaskCount : (game.taskCount || 0), // For display in table - prioritize defaultTaskCount from DB
          activeTasks: 0, // Not in API, placeholder
          // Countries field removed from Game model
          status: game.isActive ? "Active" : "Inactive",
          rewardXP: game.rewards?.xp || 0,
          rewardCoins: game.rewards?.coins || 0,
          rewardAmount: game.rewards?.coins ? parseFloat((game.rewards.coins / 50).toFixed(2)) : 0, // Convert coins to dollars (50 coins = 1 dollar)
          adSupported: game.isAdSupported || false,
          engagementTime: game.metadata?.estimatedPlayTime
            ? `${game.metadata.estimatedPlayTime} min`
            : "N/A",
          retentionRate: game.analytics?.retentionRate || 0,
          clickRate: 0, // Not in API
          installRate: 0, // Not in API
          marketingChannel: game.marketingChannel || "",
          campaign: game.campaignName || "",
          xpTier: xpTierNumberToString(game.xpTier),
          xpTiers: game.xpTiers || [],
          baseXP: game.xpRewardConfig?.baseXP || 0,
          xpMultiplier: game.xpRewardConfig?.multiplier || 1.0,
          xpRewardConfig: game.xpRewardConfig || { baseXP: 0, multiplier: 1.0 },
          tier: game.tierRestrictions?.minTier
            ? game.tierRestrictions.minTier.charAt(0).toUpperCase() +
              game.tierRestrictions.minTier.slice(1)
            : "All",
          gameCategory: game.category || "N/A",
          uiSection: game.uiSection || "",
          ageGroup: game.ageGroup || (game.ageGroups && game.ageGroups.length > 0 ? game.ageGroups[0] : "N/A"),
          gender: game.gender ? game.gender.charAt(0).toUpperCase() + game.gender.slice(1) : "N/A",
          difficulty: game.metadata?.difficulty ? game.metadata.difficulty.charAt(0).toUpperCase() + game.metadata.difficulty.slice(1) : "N/A",
          rating: game.metadata?.rating || "N/A",
          // Additional fields for preview/edit
          description: game.description || "",
          tags: game.tags || [],
          metadata: game.metadata || {},
          tierRestrictions: game.tierRestrictions || {},
          displayRules: game.displayRules || {},
          analytics: game.analytics || {},
          // Segments data for targeting
          segments: {
            ageGroups: game.ageGroups || [],
            gender: game.gender || "",
            country: game.country || "",
            city: game.city || "",
            marketingChannel: game.marketingChannel || "",
            campaignName: game.campaignName || "",
          },
          // Include raw data for CPI, amount, and other besitos data
          besitosRawData: game.besitosRawData || null,
          // Include rewards data
          rewards: game.rewards || { xp: 0, coins: 0 },
          // Include ageGroups array for ageGroup display
          ageGroups: game.ageGroups || [],
        };
      });

      return {
        games: transformedGames,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error;
    }
  },

  /**
   * Delete game
   */
  async deleteGame(gameId) {
    try {
      const response = await apiClient.delete(
        `/admin/game-offers/games/${gameId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  /**
   * Get available UI sections
   */
  async getUISections() {
    try {
      const response = await apiClient.get(
        "/admin/game-offers/ui-sections"
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching UI sections:", error);
      throw error;
    }
  },

  /**
   * Update game UI section
   */
  async updateGameUISection(gameId, uiSection) {
    try {
      const response = await apiClient.put(
        `/admin/game-offers/games/${gameId}`,
        {
          uiSection: uiSection,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating game UI section:", error);
      throw error;
    }
  },
};
