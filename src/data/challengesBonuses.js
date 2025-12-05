"use client";

import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://rewardsapi.hireagent.co/api";

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Helper to build a human-readable segment label from targetAudience
const buildSegmentLabel = (targetAudience) => {
  if (!targetAudience) return "All Users";

  const genders = Array.isArray(targetAudience.gender)
    ? targetAudience.gender
    : [];
  const countries = Array.isArray(targetAudience.countries)
    ? targetAudience.countries
    : [];
  const ageRange = targetAudience.ageRange || {};

  const parts = [];

  // Country
  if (countries.length > 0) {
    parts.push(countries.join(", "));
  }

  // Age
  if (typeof ageRange.min === "number" || typeof ageRange.max === "number") {
    const min = typeof ageRange.min === "number" ? ageRange.min : null;
    const max = typeof ageRange.max === "number" ? ageRange.max : null;
    if (min !== null && max !== null) {
      parts.push(`${min}-${max}`);
    } else if (min !== null) {
      parts.push(`${min}+`);
    } else if (max !== null) {
      parts.push(`<=${max}`);
    }
  }

  // Gender
  if (genders.length > 0) {
    const prettyGender = genders
      .map((g) => {
        const lower = String(g).toLowerCase();
        if (lower === "male") return "Male";
        if (lower === "female") return "Female";
        if (lower === "other") return "Other";
        return g;
      })
      .join("/");
    parts.push(prettyGender);
  }

  if (parts.length === 0) return "All Users";
  return parts.join(" · ");
};
const mockChallenges = [
  {
    id: "1",
    title: "Complete 3 Spins",
    type: "Spin",
    date: "2025-01-15",
    coinReward: 150,
    xpReward: 75,
    claimType: "Watch Ad",
    visibility: true,
    status: "Scheduled",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "2",
    title: "Play 2 SDK Games",
    type: "SDK Game",
    date: "2025-01-15",
    coinReward: 200,
    xpReward: 100,
    claimType: "Auto",
    visibility: true,
    status: "Scheduled",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "3",
    title: "Watch 5 Ads",
    type: "Watch Ad",
    date: "2025-01-14",
    coinReward: 100,
    xpReward: 50,
    claimType: "Auto",
    visibility: true,
    status: "Live",
    createdAt: "2025-01-09T10:00:00Z",
    updatedAt: "2025-01-14T10:00:00Z",
  },
  {
    id: "4",
    title: "Complete Survey",
    type: "Survey",
    date: "2025-01-13",
    coinReward: 300,
    xpReward: 150,
    claimType: "Watch Ad",
    visibility: false,
    status: "Expired",
    createdAt: "2025-01-08T10:00:00Z",
    updatedAt: "2025-01-13T10:00:00Z",
  },
  {
    id: "5",
    title: "Refer 1 Friend",
    type: "Referral",
    date: "2025-01-16",
    coinReward: 500,
    xpReward: 200,
    claimType: "Auto",
    visibility: true,
    status: "Scheduled",
    createdAt: "2025-01-11T10:00:00Z",
    updatedAt: "2025-01-11T10:00:00Z",
  },
];

// Mock data for XP multipliers
const mockMultipliers = [
  {
    id: "1",
    streakLength: 7,
    multiplier: 1.5,
    vipBonusApplied: true,
    active: true,
    notes: "Weekly streak bonus for consistent users",
    startDate: null,
    endDate: null,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "2",
    streakLength: 14,
    multiplier: 2.0,
    vipBonusApplied: true,
    active: true,
    notes: "Bi-weekly milestone with double XP",
    startDate: null,
    endDate: null,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "3",
    streakLength: 30,
    multiplier: 3.0,
    vipBonusApplied: true,
    active: true,
    notes: "Monthly achievement with triple XP",
    startDate: null,
    endDate: null,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "4",
    streakLength: 3,
    multiplier: 1.25,
    vipBonusApplied: false,
    active: false,
    notes: "Test multiplier for new users",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
];

// Mock data for bonus days
const mockBonusDays = [
  {
    id: "1",
    bonusDay: 7,
    rewardType: "Coins",
    rewardValue: 1000,
    resetRule: true,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "2",
    bonusDay: 30,
    rewardType: "XP",
    rewardValue: 2500,
    resetRule: true,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "3",
    bonusDay: 14,
    rewardType: "Giftcard",
    rewardValue: 5,
    resetRule: false,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
];

// Mock data for pause rules
const mockPauseRules = [
  {
    id: "1",
    ruleName: "Standard Pause Rule",
    actionOnMiss: "Pause Streak",
    graceDays: 1,
    impactOnXP: true,
    resetCoins: false,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "2",
    ruleName: "Strict Reset Rule",
    actionOnMiss: "Reset Streak",
    graceDays: 0,
    impactOnXP: true,
    resetCoins: true,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "3",
    ruleName: "Lenient Continue Rule",
    actionOnMiss: "Continue Streak",
    graceDays: 3,
    impactOnXP: false,
    resetCoins: false,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
  },
];

// Utility functions
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const challengesBonusesAPI = {
  // Challenge operations
  async getCalendarChallenges(year, month, filters = {}) {
    try {
      const { ageFilter = "", country = "", gender = "" } = filters;
      
      // Convert age filter string to minAge/maxAge for backend
      let minAge, maxAge;
      if (ageFilter && ageFilter !== "all") {
        if (ageFilter === "55+") {
          minAge = 55;
          // Don't set maxAge for 55+, backend will handle it
        } else {
          const [min, max] = ageFilter.split("-").map(Number);
          minAge = min;
          maxAge = max;
        }
      }

      const params = {
        year,
        month,
        ...(minAge !== undefined && { minAge }),
        ...(maxAge !== undefined && { maxAge }),
        ...(country && country !== "all" && { country }),
        ...(gender && gender !== "all" && { gender: gender.toLowerCase() }),
      };

      const response = await apiClient.get(
        "/admin/daily-challenges/challenges/calendar",
        { params }
      );

      const calendarData = response.data.data.calendarData || {};

      // Transform calendar data to frontend format
      const transformedData = {};
      Object.entries(calendarData).forEach(([date, challenges]) => {
        transformedData[date] = challenges.map((apiData) => ({
          id: apiData.id,
          title: apiData.title,
          type: apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1),
          date: apiData.challengeDate,
          coinReward: apiData.coinReward,
          xpReward: apiData.xpReward,
          claimType: apiData.claimType === "auto" ? "Auto" : "Watch Ad",
          visibility: apiData.isVisible,
          status:
            apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1),
        }));
      });

      return transformedData;
    } catch (error) {
      console.error("Get calendar challenges error:", error);
      throw error.response?.data || error;
    }
  },

  async getChallenges(params = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type = "", 
        status = "",
        ageFilter = "",
        country = "",
        gender = ""
      } = params;

      // Convert age filter string to minAge/maxAge for backend
      let minAge, maxAge;
      if (ageFilter && ageFilter !== "all") {
        if (ageFilter === "55+") {
          minAge = 55;
          // Don't set maxAge for 55+, backend will handle it
        } else {
          const [min, max] = ageFilter.split("-").map(Number);
          minAge = min;
          maxAge = max;
        }
      }

      const queryParams = {
        page,
        limit,
        ...(type && { type: type.toLowerCase() }),
        ...(status && { status: status.toLowerCase() }),
        ...(minAge !== undefined && { minAge }),
        ...(maxAge !== undefined && { maxAge }),
        ...(country && country !== "all" && { country }),
        ...(gender && gender !== "all" && { gender: gender.toLowerCase() }),
      };

      const response = await apiClient.get(
        "/admin/daily-challenges/challenges",
        { params: queryParams }
      );

      // Handle new response structure with pagination
      const responseData = response.data.data || response.data;
      const challengesArray = responseData.challenges || [];
      const pagination = responseData.pagination || {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
      };

      // Transform API response to frontend format
      const transformedChallenges = challengesArray.map((apiData) => ({
        id: apiData._id,
        title: apiData.title,
        description: apiData.description || "",
        type: apiData.type
          ? apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1)
          : "Spin",
        date: apiData.challengeDate,
        coinReward: apiData.coinReward || 0,
        xpReward: apiData.xpReward || 0,
        claimType:
          apiData.claimType === "auto" || apiData.claimType === "Auto"
            ? "Auto"
            : apiData.claimType === "manual"
            ? "Watch Ad"
            : "Watch Ad",
        visibility: apiData.isVisible !== false,
        status: apiData.status
          ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1)
          : "Scheduled",
        gameId: apiData.gameId || null,
        sdkProvider: apiData.sdkProvider || null,
        // Timer-based game configuration
        playTimeMinutes: apiData.requirements?.timeLimit || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        targetAudience: apiData.targetAudience || null,
        segmentLabel: buildSegmentLabel(apiData.targetAudience),
      }));

      // Return both challenges and pagination
      return {
        challenges: transformedChallenges,
        pagination,
      };
    } catch (error) {
      console.error("Get challenges error:", error);
      throw error.response?.data || error;
    }
  },

  async createChallenge(challengeData) {
    try {
      // Map frontend format to API structure (enhanced API format)
      // Format date to ISO string (e.g., "2025-10-21T00:00:00.000Z")
      let challengeDate;
      if (challengeData.date) {
        const dateObj = new Date(challengeData.date);
        // Set to start of day in UTC
        dateObj.setUTCHours(0, 0, 0, 0);
        challengeDate = dateObj.toISOString();
      } else {
        challengeDate = new Date().toISOString();
      }

      const apiPayload = {
        challengeDate: challengeDate,
        title: challengeData.title,
        description: challengeData.description || challengeData.title,
        type: challengeData.type.toLowerCase(),
        coinReward: challengeData.coinReward || 0,
        xpReward: challengeData.xpReward || 0,
        claimType:
          challengeData.claimType === "Auto"
            ? "auto"
            : challengeData.claimType === "Watch Ad"
            ? "manual"
            : challengeData.claimType.toLowerCase(),
        isVisible: challengeData.visibility !== false,
        status: challengeData.status
          ? challengeData.status.toLowerCase()
          : "scheduled",
        ...(challengeData.gameId && { gameId: challengeData.gameId }),
        ...(challengeData.sdkProvider && {
          sdkProvider: challengeData.sdkProvider,
        }),
        ...(challengeData.type === "Game" &&
          typeof challengeData.playTimeMinutes === "number" && {
            requirements: {
              timeLimit: challengeData.playTimeMinutes,
            },
          }),
        ...(challengeData.targetAudience && {
          targetAudience: challengeData.targetAudience,
        }),
      };

      const response = await apiClient.post(
        "/admin/daily-challenges/challenges",
        apiPayload
      );
      const apiData = response.data.data || response.data;

      // Return in frontend format
      return {
        id: apiData._id,
        title: apiData.title,
        description: apiData.description || apiData.title || '',
        type: apiData.type
          ? apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1)
          : "Spin",
        date: apiData.challengeDate,
        coinReward: apiData.coinReward || 0,
        xpReward: apiData.xpReward || 0,
        claimType:
          apiData.claimType === "auto" || apiData.claimType === "Auto"
            ? "Auto"
            : "Watch Ad",
        visibility: apiData.isVisible !== false,
        status: apiData.status
          ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1)
          : "Scheduled",
        gameId: apiData.gameId || null,
        sdkProvider: apiData.sdkProvider || null,
        // Timer-based game configuration: include requirements for playTimeMinutes
        playTimeMinutes: apiData.requirements?.timeLimit || null,
        requirements: apiData.requirements || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        targetAudience: apiData.targetAudience || null,
        segmentLabel: buildSegmentLabel(apiData.targetAudience),
      };
    } catch (error) {
      console.error("Create challenge error:", error);
      throw error.response?.data || error;
    }
  },

  async updateChallenge(id, challengeData) {
    try {
      // Map frontend format to API structure (same as POST)
      // Format date to ISO string if provided
      let challengeDate;
      if (challengeData.date) {
        const dateObj = new Date(challengeData.date);
        dateObj.setUTCHours(0, 0, 0, 0);
        challengeDate = dateObj.toISOString();
      }

      const apiPayload = {
        ...(challengeDate && { challengeDate: challengeDate }),
        ...(challengeData.title && { title: challengeData.title }),
        // Always include description - use provided value or fallback to title
        description: challengeData.description || challengeData.title || '',
        ...(challengeData.type && { type: challengeData.type.toLowerCase() }),
        ...(challengeData.coinReward !== undefined && {
          coinReward: challengeData.coinReward,
        }),
        ...(challengeData.xpReward !== undefined && {
          xpReward: challengeData.xpReward,
        }),
        ...(challengeData.claimType && {
          claimType:
            challengeData.claimType === "Auto"
              ? "auto"
              : challengeData.claimType === "Watch Ad"
              ? "manual"
              : challengeData.claimType.toLowerCase(),
        }),
        ...(challengeData.visibility !== undefined && {
          isVisible: challengeData.visibility !== false,
        }),
        ...(challengeData.status && {
          status: challengeData.status.toLowerCase(),
        }),
        ...(challengeData.gameId && { gameId: challengeData.gameId }),
        ...(challengeData.sdkProvider && {
          sdkProvider: challengeData.sdkProvider,
        }),
        ...(challengeData.type === "Game" &&
          typeof challengeData.playTimeMinutes === "number" && {
            requirements: {
              timeLimit: challengeData.playTimeMinutes,
            },
          }),
        ...(challengeData.targetAudience && {
          targetAudience: challengeData.targetAudience,
        }),
      };

      const response = await apiClient.put(
        `/admin/daily-challenges/challenges/${id}`,
        apiPayload
      );
      const apiData = response.data.data || response.data;

      // Return in frontend format
      return {
        id: apiData._id,
        title: apiData.title,
        description: apiData.description || apiData.title || '',
        type: apiData.type
          ? apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1)
          : "Spin",
        date: apiData.challengeDate,
        coinReward: apiData.coinReward || 0,
        xpReward: apiData.xpReward || 0,
        claimType:
          apiData.claimType === "auto" || apiData.claimType === "Auto"
            ? "Auto"
            : "Watch Ad",
        visibility: apiData.isVisible !== false,
        status: apiData.status
          ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1)
          : "Scheduled",
        gameId: apiData.gameId || null,
        sdkProvider: apiData.sdkProvider || null,
        // Timer-based game configuration: include requirements for playTimeMinutes
        playTimeMinutes: apiData.requirements?.timeLimit || null,
        requirements: apiData.requirements || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        targetAudience: apiData.targetAudience || null,
      };
    } catch (error) {
      console.error("Update challenge error:", error);
      throw error.response?.data || error;
    }
  },

  async deleteChallenge(id) {
    try {
      const response = await apiClient.delete(
        `/admin/daily-challenges/challenges/${id}`
      );
      return response.data.success;
    } catch (error) {
      console.error("Delete challenge error:", error);
      throw error.response?.data || error;
    }
  },

  async toggleChallengeVisibility(id, visibility) {
    try {
      const response = await apiClient.patch(
        `/admin/daily-challenges/challenges/${id}/visibility`
      );
      const apiData = response.data.data;

      // Return the updated visibility status
      return {
        visibility: apiData.isVisible,
      };
    } catch (error) {
      console.error("Toggle challenge visibility error:", error);
      throw error.response?.data || error;
    }
  },

  // Multiplier operations
  async getMultipliers() {
    try {
      const response = await apiClient.get(
        "/admin/daily-challenges/xp-multipliers"
      );
      const multipliersArray = response.data.data || [];

      // Transform API response to frontend format (tier-based)
      return multipliersArray.map((apiData) => ({
        id: apiData._id,
        tier: apiData.tier, // 'JUNIOR' | 'MID' | 'SENIOR'
        multiplier: apiData.multiplier,
        active: apiData.isActive,
        lastUpdatedAt: apiData.updatedAt,
        lastUpdatedBy: apiData.updatedBy?.name || null,
      }));
    } catch (error) {
      console.error("Get multipliers error:", error);
      throw error.response?.data || error;
    }
  },

  async createMultiplier(multiplierData) {
    try {
      // Map frontend format to API structure (tier-based)
      const apiPayload = {
        tier: multiplierData.tier, // 'JUNIOR' | 'MID' | 'SENIOR'
        multiplier: multiplierData.multiplier,
        isActive: multiplierData.active,
      };

      const response = await apiClient.post(
        "/admin/daily-challenges/xp-multipliers",
        apiPayload
      );
      const apiData = response.data.data;

      // Return in frontend format
      return {
        id: apiData._id,
        multiplier: apiData.multiplier,
        active: apiData.isActive,
        tier: apiData.tier,
        lastUpdatedAt: apiData.updatedAt,
        lastUpdatedBy: apiData.updatedBy?.name || null,
      };
    } catch (error) {
      console.error("Create multiplier error:", error);
      throw error.response?.data || error;
    }
  },

  async updateMultiplier(id, multiplierData) {
    try {
      // Map frontend format to API structure
      const apiPayload = {
        multiplier: multiplierData.multiplier,
      };

      const response = await apiClient.put(
        `/admin/daily-challenges/xp-multipliers/${id}`,
        apiPayload
      );
      const apiData = response.data.data;

      // Return in frontend format
      return {
        id: apiData._id,
        multiplier: apiData.multiplier,
        active: apiData.isActive,
        tier: apiData.tier,
        lastUpdatedAt: apiData.updatedAt,
        lastUpdatedBy: apiData.updatedBy?.name || null,
      };
    } catch (error) {
      console.error("Update multiplier error:", error);
      throw error.response?.data || error;
    }
  },

  async toggleMultiplierStatus(id) {
    try {
      const response = await apiClient.patch(
        `/admin/daily-challenges/xp-multipliers/${id}/status`
      );
      const apiData = response.data.data;

      // Return the updated active status
      return {
        isActive: apiData.isActive,
      };
    } catch (error) {
      console.error("Toggle multiplier status error:", error);
      throw error.response?.data || error;
    }
  },

  async deleteMultiplier(id) {
    await delay(400);
    const index = mockMultipliers.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Multiplier not found");
    mockMultipliers.splice(index, 1);
    return true;
  },

  // Bonus day operations
  async getBonusDays() {
    try {
      const response = await apiClient.get(
        "/admin/daily-challenges/bonus-days"
      );
      const bonusDaysArray = response.data.data || [];

      // Transform API response to frontend format
      return bonusDaysArray.map((apiData) => {
        // Extract coin and XP rewards
        const primaryType = apiData.primaryReward?.type?.toLowerCase() || '';
        const alternateType = apiData.alternateReward?.type?.toLowerCase() || '';
        
        let coinRewardType = null;
        let coinRewardValue = null;
        let xpRewardType = null;
        let xpRewardValue = null;
        
        // Map primary reward
        if (primaryType === 'coins') {
          coinRewardType = 'Coins';
          coinRewardValue = apiData.primaryReward.value;
        } else if (primaryType === 'xp') {
          xpRewardType = 'XP';
          xpRewardValue = apiData.primaryReward.value;
        }
        
        // Map alternate reward
        if (alternateType === 'coins') {
          coinRewardType = 'Coins';
          coinRewardValue = apiData.alternateReward.value;
        } else if (alternateType === 'xp') {
          xpRewardType = 'XP';
          xpRewardValue = apiData.alternateReward.value;
        }
        
        // Build rewards array
        const rewards = [];
        if (coinRewardValue) {
          rewards.push({ type: 'Coins', value: coinRewardValue });
        }
        if (xpRewardValue) {
          rewards.push({ type: 'XP', value: xpRewardValue });
        }
        
        // Legacy format support
        const rewardType = primaryType ? primaryType.charAt(0).toUpperCase() + primaryType.slice(1) : null;
        const rewardValue = apiData.primaryReward?.value || null;
        const alternateReward = apiData.alternateReward?.value || null;
        
        return {
          id: apiData._id,
          bonusDay: apiData.dayNumber,
          // Rewards array (new format)
          rewards: rewards.length > 0 ? rewards : null,
          // Individual rewards (for backward compatibility)
          coinRewardType,
          coinRewardValue,
          xpRewardType,
          xpRewardValue,
          // Legacy format (for backward compatibility)
          rewardType,
          rewardValue,
          alternateReward,
          resetRule: apiData.resetRule.onMiss,
          createdAt: apiData.createdAt,
          updatedAt: apiData.updatedAt,
        };
      });
    } catch (error) {
      console.error("Get bonus days error:", error);
      throw error.response?.data || error;
    }
  },

  async createBonusDay(bonusDayData) {
    try {
      // Determine primary and alternate rewards
      let primaryReward = null;
      let alternateReward = null;
      
      // Use rewards array format if available (new format)
      if (bonusDayData.rewards && Array.isArray(bonusDayData.rewards) && bonusDayData.rewards.length > 0) {
        const validRewards = bonusDayData.rewards.filter(r => r.value && r.value > 0);
        if (validRewards.length > 0) {
          primaryReward = {
            type: validRewards[0].type.toLowerCase(),
            value: validRewards[0].value,
            metadata: {},
          };
          if (validRewards.length > 1) {
            alternateReward = {
              type: validRewards[1].type.toLowerCase(),
              value: validRewards[1].value,
              metadata: {},
            };
          }
        }
      }
      
      // Fallback to individual reward format
      if (!primaryReward && bonusDayData.coinRewardValue && bonusDayData.coinRewardValue > 0) {
        primaryReward = {
          type: bonusDayData.coinRewardType?.toLowerCase() || 'coins',
          value: bonusDayData.coinRewardValue,
          metadata: {},
        };
      }
      
      if (!alternateReward && bonusDayData.xpRewardValue && bonusDayData.xpRewardValue > 0) {
        if (primaryReward) {
          alternateReward = {
            type: bonusDayData.xpRewardType?.toLowerCase() || 'xp',
            value: bonusDayData.xpRewardValue,
            metadata: {},
          };
        } else {
          primaryReward = {
            type: bonusDayData.xpRewardType?.toLowerCase() || 'xp',
            value: bonusDayData.xpRewardValue,
            metadata: {},
          };
        }
      }
      
      // Fallback to legacy format
      if (!primaryReward && bonusDayData.rewardType && bonusDayData.rewardValue) {
        primaryReward = {
          type: bonusDayData.rewardType.toLowerCase(),
          value: bonusDayData.rewardValue,
          metadata: {},
        };
        if (bonusDayData.alternateReward) {
          alternateReward = {
            type: bonusDayData.rewardType.toLowerCase() === 'coins' ? 'xp' : 'coins',
            value: bonusDayData.alternateReward,
            metadata: {},
          };
        }
      }
      
      // Map frontend fields to API structure
      const apiPayload = {
        title: `Day ${bonusDayData.bonusDay} Bonus Reward`,
        description: `Special bonus for ${bonusDayData.bonusDay}-day streak`,
        primaryReward: primaryReward || {
          type: 'coins',
          value: 0,
          metadata: {},
        },
        alternateReward: alternateReward || null,
        resetRule: {
          onMiss: bonusDayData.resetRule,
          gracePeriod: 1,
          fallbackAction: "reset_streak",
        },
        conditions: {
          minStreak: bonusDayData.bonusDay,
          requiresCompletion: true,
          userSegments: ["all"],
        },
        notification: {
          enabled: true,
          title: `${bonusDayData.bonusDay}-Day Streak Bonus!`,
          message: `You've earned a special bonus for your dedication!`,
          actionText: "Claim Reward",
          scheduledTime: "09:00",
        },
        banner: {
          enabled: true,
          title: "Streak Bonus Available",
          subtitle: `Claim your ${bonusDayData.bonusDay}-day reward`,
          backgroundColor: "#FFD700",
          textColor: "#000000",
          position: "top",
        },
        isActive: true,
      };

      const response = await apiClient.put(
        `/admin/daily-challenges/bonus-days/${bonusDayData.bonusDay}`,
        apiPayload
      );

      const apiData = response.data.data;

      // Transform response back to frontend format
      const primaryType = apiData.primaryReward?.type?.toLowerCase() || '';
      const alternateType = apiData.alternateReward?.type?.toLowerCase() || '';
      
      let coinRewardType = null;
      let coinRewardValue = null;
      let xpRewardType = null;
      let xpRewardValue = null;
      
      if (primaryType === 'coins') {
        coinRewardType = 'Coins';
        coinRewardValue = apiData.primaryReward.value;
      } else if (primaryType === 'xp') {
        xpRewardType = 'XP';
        xpRewardValue = apiData.primaryReward.value;
      }
      
      if (alternateType === 'coins') {
        coinRewardType = 'Coins';
        coinRewardValue = apiData.alternateReward.value;
      } else if (alternateType === 'xp') {
        xpRewardType = 'XP';
        xpRewardValue = apiData.alternateReward.value;
      }

      // Build rewards array
      const rewards = [];
      if (coinRewardValue) {
        rewards.push({ type: 'Coins', value: coinRewardValue });
      }
      if (xpRewardValue) {
        rewards.push({ type: 'XP', value: xpRewardValue });
      }

      // Return in frontend format
      return {
        id: apiData._id,
        bonusDay: apiData.dayNumber,
        // Rewards array (new format)
        rewards: rewards.length > 0 ? rewards : null,
        // Individual rewards (for backward compatibility)
        coinRewardType,
        coinRewardValue,
        xpRewardType,
        xpRewardValue,
        // Legacy format
        rewardType: primaryType ? primaryType.charAt(0).toUpperCase() + primaryType.slice(1) : null,
        rewardValue: apiData.primaryReward?.value || null,
        alternateReward: apiData.alternateReward?.value || null,
        resetRule: apiData.resetRule.onMiss,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
      };
    } catch (error) {
      console.error("Create bonus day error:", error);
      throw error.response?.data || error;
    }
  },

  async updateBonusDay(id, bonusDayData) {
    try {
      // Determine primary and alternate rewards
      let primaryReward = null;
      let alternateReward = null;
      
      // Use rewards array format if available (new format)
      if (bonusDayData.rewards && Array.isArray(bonusDayData.rewards) && bonusDayData.rewards.length > 0) {
        const validRewards = bonusDayData.rewards.filter(r => r.value && r.value > 0);
        if (validRewards.length > 0) {
          primaryReward = {
            type: validRewards[0].type.toLowerCase(),
            value: validRewards[0].value,
            metadata: {},
          };
          if (validRewards.length > 1) {
            alternateReward = {
              type: validRewards[1].type.toLowerCase(),
              value: validRewards[1].value,
              metadata: {},
            };
          }
        }
      }
      
      // Fallback to individual reward format
      if (!primaryReward && bonusDayData.coinRewardValue && bonusDayData.coinRewardValue > 0) {
        primaryReward = {
          type: bonusDayData.coinRewardType?.toLowerCase() || 'coins',
          value: bonusDayData.coinRewardValue,
          metadata: {},
        };
      }
      
      if (!alternateReward && bonusDayData.xpRewardValue && bonusDayData.xpRewardValue > 0) {
        if (primaryReward) {
          alternateReward = {
            type: bonusDayData.xpRewardType?.toLowerCase() || 'xp',
            value: bonusDayData.xpRewardValue,
            metadata: {},
          };
        } else {
          primaryReward = {
            type: bonusDayData.xpRewardType?.toLowerCase() || 'xp',
            value: bonusDayData.xpRewardValue,
            metadata: {},
          };
        }
      }
      
      // Fallback to legacy format
      if (!primaryReward && bonusDayData.rewardType && bonusDayData.rewardValue) {
        primaryReward = {
          type: bonusDayData.rewardType.toLowerCase(),
          value: bonusDayData.rewardValue,
          metadata: {},
        };
        if (bonusDayData.alternateReward) {
          alternateReward = {
            type: bonusDayData.rewardType.toLowerCase() === 'coins' ? 'xp' : 'coins',
            value: bonusDayData.alternateReward,
            metadata: {},
          };
        }
      }
      
      // Map frontend fields to API structure
      const apiPayload = {
        title: `Day ${bonusDayData.bonusDay} Bonus Reward`,
        description: `Special bonus for ${bonusDayData.bonusDay}-day streak`,
        primaryReward: primaryReward || {
          type: 'coins',
          value: 0,
          metadata: {},
        },
        alternateReward: alternateReward || null,
        resetRule: {
          onMiss: bonusDayData.resetRule,
          gracePeriod: 1,
          fallbackAction: "reset_streak",
        },
        conditions: {
          minStreak: bonusDayData.bonusDay,
          requiresCompletion: true,
          userSegments: ["all"],
        },
        notification: {
          enabled: true,
          title: `${bonusDayData.bonusDay}-Day Streak Bonus!`,
          message: `You've earned a special bonus for your dedication!`,
          actionText: "Claim Reward",
          scheduledTime: "09:00",
        },
        banner: {
          enabled: true,
          title: "Streak Bonus Available",
          subtitle: `Claim your ${bonusDayData.bonusDay}-day reward`,
          backgroundColor: "#FFD700",
          textColor: "#000000",
          position: "top",
        },
        isActive: true,
      };

      const response = await apiClient.put(
        `/admin/daily-challenges/bonus-days/${bonusDayData.bonusDay}`,
        apiPayload
      );

      const apiData = response.data.data;

      // Transform response back to frontend format
      const primaryType = apiData.primaryReward?.type?.toLowerCase() || '';
      const alternateType = apiData.alternateReward?.type?.toLowerCase() || '';
      
      let coinRewardType = null;
      let coinRewardValue = null;
      let xpRewardType = null;
      let xpRewardValue = null;
      
      if (primaryType === 'coins') {
        coinRewardType = 'Coins';
        coinRewardValue = apiData.primaryReward.value;
      } else if (primaryType === 'xp') {
        xpRewardType = 'XP';
        xpRewardValue = apiData.primaryReward.value;
      }
      
      if (alternateType === 'coins') {
        coinRewardType = 'Coins';
        coinRewardValue = apiData.alternateReward.value;
      } else if (alternateType === 'xp') {
        xpRewardType = 'XP';
        xpRewardValue = apiData.alternateReward.value;
      }

      // Build rewards array
      const rewards = [];
      if (coinRewardValue) {
        rewards.push({ type: 'Coins', value: coinRewardValue });
      }
      if (xpRewardValue) {
        rewards.push({ type: 'XP', value: xpRewardValue });
      }

      // Return in frontend format
      return {
        id: apiData._id,
        bonusDay: apiData.dayNumber,
        // Rewards array (new format)
        rewards: rewards.length > 0 ? rewards : null,
        // Individual rewards (for backward compatibility)
        coinRewardType,
        coinRewardValue,
        xpRewardType,
        xpRewardValue,
        // Legacy format
        rewardType: primaryType ? primaryType.charAt(0).toUpperCase() + primaryType.slice(1) : null,
        rewardValue: apiData.primaryReward?.value || null,
        alternateReward: apiData.alternateReward?.value || null,
        resetRule: apiData.resetRule.onMiss,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
      };
    } catch (error) {
      console.error("Update bonus day error:", error);
      throw error.response?.data || error;
    }
  },

  async deleteBonusDay(id) {
    try {
      const response = await apiClient.delete(
        `/admin/daily-challenges/bonus-days/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Delete bonus day error:", error);
      throw error.response?.data || error;
    }
  },

  // 30-Day Streak Bonus Configuration operations
  async getStreakBonusConfig() {
    try {
      const response = await apiClient.get(
        "/admin/daily-challenges/streak-bonus-config"
      );
      return response.data.data;
    } catch (error) {
      console.error("Get streak bonus config error:", error);
      throw error.response?.data || error;
    }
  },

  async updateStreakBonusConfig(configData) {
    try {
      const response = await apiClient.put(
        "/admin/daily-challenges/streak-bonus-config",
        configData
      );
      return response.data.data;
    } catch (error) {
      console.error("Update streak bonus config error:", error);
      throw error.response?.data || error;
    }
  },

  // Pause rule operations
  async getPauseRules() {
    await delay(400);
    return [...mockPauseRules];
  },

  async createPauseRule(pauseRuleData) {
    await delay(700);
    const newPauseRule = {
      ...pauseRuleData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPauseRules.push(newPauseRule);
    return newPauseRule;
  },

  async updatePauseRule(id, pauseRuleData) {
    await delay(500);
    const index = mockPauseRules.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Pause rule not found");

    const updatedPauseRule = {
      ...mockPauseRules[index],
      ...pauseRuleData,
      updatedAt: new Date().toISOString(),
    };
    mockPauseRules[index] = updatedPauseRule;
    return updatedPauseRule;
  },

  async deletePauseRule(id) {
    await delay(400);
    const index = mockPauseRules.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Pause rule not found");
    mockPauseRules.splice(index, 1);
    return true;
  },
};

// Export mock data for testing
export { mockChallenges, mockMultipliers, mockBonusDays, mockPauseRules };
