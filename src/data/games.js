"use client";

import axios from "axios";

const API_BASE = "https://rewardsapi.hireagent.co";

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

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
        "/api/admin/game-offers/games",
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
        countries: game.countries || [],
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
        `/api/admin/game-offers/games/${gameId}`,
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
        countries: game.countries || [],
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
        `/api/admin/game-offers/games/${gameId}`
      );

      // Transform response to frontend format
      const game = response.data.data;

      return {
        id: game._id,
        title: game.title || "Untitled Game",
        sdk: game.sdkProvider || "N/A",
        xptrRules: game.xptrRules || "No rules defined",
        taskCount: game.taskCount || 0,
        activeTasks: 0, // Not in API, placeholder
        countries: game.countries || [],
        status: game.isActive ? "Active" : "Inactive",
        rewardXP: 0, // Not in API
        rewardCoins: 0, // Not in API
        adSupported: game.isAdSupported || false,
        engagementTime: game.metadata?.estimatedPlayTime
          ? `${game.metadata.estimatedPlayTime} min`
          : "N/A",
        retentionRate: game.analytics?.retentionRate || 0,
        clickRate: 0, // Not in API
        installRate: 0, // Not in API
        marketingChannel: "N/A", // Not in API
        campaign: "N/A", // Not in API
        xpTier: xpTierNumberToString(game.xpTier),
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
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        createdBy: game.createdBy,
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
        params.xpTier.trim() !== ""
      ) {
        // Convert XP Tier string to number for backend
        const xpTierNum = xpTierStringToNumber(params.xpTier);
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

      const response = await apiClient.get(
        `/api/admin/game-offers/games?${queryParams.toString()}`
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
          taskCount: game.taskCount || 0,
          activeTasks: 0, // Not in API, placeholder
          countries: game.countries || [],
          status: game.isActive ? "Active" : "Inactive",
          rewardXP: 0, // Not in API
          rewardCoins: 0, // Not in API
          adSupported: game.isAdSupported || false,
          engagementTime: game.metadata?.estimatedPlayTime
            ? `${game.metadata.estimatedPlayTime} min`
            : "N/A",
          retentionRate: game.analytics?.retentionRate || 0,
          clickRate: 0, // Not in API
          installRate: 0, // Not in API
          marketingChannel: "N/A", // Not in API
          campaign: "N/A", // Not in API
          xpTier: xpTierNumberToString(game.xpTier),
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
        `/api/admin/game-offers/games/${gameId}`
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
        "/api/admin/game-offers/ui-sections"
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
        `/api/admin/game-offers/games/${gameId}`,
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
