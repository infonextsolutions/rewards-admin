'use client';

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://rewardsapi.hireagent.co/api';

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Mock data for challenges
const mockChallenges = [
  {
    id: '1',
    title: 'Complete 3 Spins',
    type: 'Spin',
    date: '2025-01-15',
    coinReward: 150,
    xpReward: 75,
    claimType: 'Watch Ad',
    visibility: true,
    status: 'Scheduled',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Play 2 SDK Games',
    type: 'SDK Game',
    date: '2025-01-15',
    coinReward: 200,
    xpReward: 100,
    claimType: 'Auto',
    visibility: true,
    status: 'Scheduled',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: '3',
    title: 'Watch 5 Ads',
    type: 'Watch Ad',
    date: '2025-01-14',
    coinReward: 100,
    xpReward: 50,
    claimType: 'Auto',
    visibility: true,
    status: 'Live',
    createdAt: '2025-01-09T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z'
  },
  {
    id: '4',
    title: 'Complete Survey',
    type: 'Survey',
    date: '2025-01-13',
    coinReward: 300,
    xpReward: 150,
    claimType: 'Watch Ad',
    visibility: false,
    status: 'Expired',
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-13T10:00:00Z'
  },
  {
    id: '5',
    title: 'Refer 1 Friend',
    type: 'Referral',
    date: '2025-01-16',
    coinReward: 500,
    xpReward: 200,
    claimType: 'Auto',
    visibility: true,
    status: 'Scheduled',
    createdAt: '2025-01-11T10:00:00Z',
    updatedAt: '2025-01-11T10:00:00Z'
  }
];

// Mock data for XP multipliers
const mockMultipliers = [
  {
    id: '1',
    streakLength: 7,
    multiplier: 1.5,
    vipBonusApplied: true,
    active: true,
    notes: 'Weekly streak bonus for consistent users',
    startDate: null,
    endDate: null,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '2',
    streakLength: 14,
    multiplier: 2.0,
    vipBonusApplied: true,
    active: true,
    notes: 'Bi-weekly milestone with double XP',
    startDate: null,
    endDate: null,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '3',
    streakLength: 30,
    multiplier: 3.0,
    vipBonusApplied: true,
    active: true,
    notes: 'Monthly achievement with triple XP',
    startDate: null,
    endDate: null,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '4',
    streakLength: 3,
    multiplier: 1.25,
    vipBonusApplied: false,
    active: false,
    notes: 'Test multiplier for new users',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  }
];

// Mock data for bonus days
const mockBonusDays = [
  {
    id: '1',
    bonusDay: 7,
    rewardType: 'Coins',
    rewardValue: 1000,
    resetRule: true,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '2',
    bonusDay: 30,
    rewardType: 'XP',
    rewardValue: 2500,
    resetRule: true,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '3',
    bonusDay: 14,
    rewardType: 'Giftcard',
    rewardValue: 5,
    resetRule: false,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  }
];

// Mock data for pause rules
const mockPauseRules = [
  {
    id: '1',
    ruleName: 'Standard Pause Rule',
    actionOnMiss: 'Pause Streak',
    graceDays: 1,
    impactOnXP: true,
    resetCoins: false,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '2',
    ruleName: 'Strict Reset Rule',
    actionOnMiss: 'Reset Streak',
    graceDays: 0,
    impactOnXP: true,
    resetCoins: true,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: '3',
    ruleName: 'Lenient Continue Rule',
    actionOnMiss: 'Continue Streak',
    graceDays: 3,
    impactOnXP: false,
    resetCoins: false,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  }
];

// Utility functions
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const challengesBonusesAPI = {
  // Challenge operations
  async getCalendarChallenges(year, month) {
    try {
      const response = await apiClient.get('/admin/daily-challenges/challenges/calendar', {
        params: { year, month }
      });

      const calendarData = response.data.data.calendarData || {};

      // Transform calendar data to frontend format
      const transformedData = {};
      Object.entries(calendarData).forEach(([date, challenges]) => {
        transformedData[date] = challenges.map(apiData => ({
          id: apiData.id,
          title: apiData.title,
          type: apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1),
          date: apiData.challengeDate,
          coinReward: apiData.coinReward,
          xpReward: apiData.xpReward,
          claimType: apiData.claimType === 'auto' ? 'Auto' : 'Watch Ad',
          visibility: apiData.isVisible,
          status: apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1)
        }));
      });

      return transformedData;
    } catch (error) {
      console.error('Get calendar challenges error:', error);
      throw error.response?.data || error;
    }
  },

  async getChallenges(params = {}) {
    try {
      const { page = 1, limit = 10, type = '', status = '' } = params;

      const queryParams = {
        page,
        limit,
        ...(type && { type }),
        ...(status && { status })
      };

      const response = await apiClient.get('/admin/daily-challenges/challenges', { params: queryParams });
      
      // Handle new response structure with pagination
      const responseData = response.data.data || response.data;
      const challengesArray = responseData.challenges || [];
      const pagination = responseData.pagination || {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit
      };

      // Transform API response to frontend format
      const transformedChallenges = challengesArray.map(apiData => ({
        id: apiData._id,
        title: apiData.title,
        type: apiData.type ? apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1) : 'Spin',
        date: apiData.challengeDate,
        coinReward: apiData.coinReward || 0,
        xpReward: apiData.xpReward || 0,
        claimType: apiData.claimType === 'auto' || apiData.claimType === 'Auto' ? 'Auto' : (apiData.claimType === 'manual' ? 'Watch Ad' : 'Watch Ad'),
        visibility: apiData.isVisible !== false,
        status: apiData.status ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1) : 'Scheduled',
        gameId: apiData.gameId || null,
        sdkProvider: apiData.sdkProvider || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      }));

      // Return both challenges and pagination
      return {
        challenges: transformedChallenges,
        pagination
      };
    } catch (error) {
      console.error('Get challenges error:', error);
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
        claimType: challengeData.claimType === 'Auto' ? 'auto' : (challengeData.claimType === 'Watch Ad' ? 'manual' : challengeData.claimType.toLowerCase()),
        isVisible: challengeData.visibility !== false,
        status: challengeData.status ? challengeData.status.toLowerCase() : 'scheduled',
        ...(challengeData.gameId && { gameId: challengeData.gameId }),
        ...(challengeData.sdkProvider && { sdkProvider: challengeData.sdkProvider })
      };

      const response = await apiClient.post('/admin/daily-challenges/challenges', apiPayload);
      const apiData = response.data.data || response.data;

      // Return in frontend format
      return {
        id: apiData._id,
        title: apiData.title,
        type: apiData.type ? apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1) : 'Spin',
        date: apiData.challengeDate,
        coinReward: apiData.coinReward || 0,
        xpReward: apiData.xpReward || 0,
        claimType: apiData.claimType === 'auto' || apiData.claimType === 'Auto' ? 'Auto' : 'Watch Ad',
        visibility: apiData.isVisible !== false,
        status: apiData.status ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1) : 'Scheduled',
        gameId: apiData.gameId || null,
        sdkProvider: apiData.sdkProvider || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      };
    } catch (error) {
      console.error('Create challenge error:', error);
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
        ...(challengeData.description && { description: challengeData.description }),
        ...(challengeData.title && !challengeData.description && { description: challengeData.title }),
        ...(challengeData.type && { type: challengeData.type.toLowerCase() }),
        ...(challengeData.coinReward !== undefined && { coinReward: challengeData.coinReward }),
        ...(challengeData.xpReward !== undefined && { xpReward: challengeData.xpReward }),
        ...(challengeData.claimType && { claimType: challengeData.claimType === 'Auto' ? 'auto' : (challengeData.claimType === 'Watch Ad' ? 'manual' : challengeData.claimType.toLowerCase()) }),
        ...(challengeData.visibility !== undefined && { isVisible: challengeData.visibility !== false }),
        ...(challengeData.status && { status: challengeData.status.toLowerCase() }),
        ...(challengeData.gameId && { gameId: challengeData.gameId }),
        ...(challengeData.sdkProvider && { sdkProvider: challengeData.sdkProvider })
      };

      const response = await apiClient.put(`/admin/daily-challenges/challenges/${id}`, apiPayload);
      const apiData = response.data.data || response.data;

      // Return in frontend format
      return {
        id: apiData._id,
        title: apiData.title,
        type: apiData.type ? apiData.type.charAt(0).toUpperCase() + apiData.type.slice(1) : 'Spin',
        date: apiData.challengeDate,
        coinReward: apiData.coinReward || 0,
        xpReward: apiData.xpReward || 0,
        claimType: apiData.claimType === 'auto' || apiData.claimType === 'Auto' ? 'Auto' : 'Watch Ad',
        visibility: apiData.isVisible !== false,
        status: apiData.status ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1) : 'Scheduled',
        gameId: apiData.gameId || null,
        sdkProvider: apiData.sdkProvider || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      };
    } catch (error) {
      console.error('Update challenge error:', error);
      throw error.response?.data || error;
    }
  },

  async deleteChallenge(id) {
    try {
      const response = await apiClient.delete(`/admin/daily-challenges/challenges/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Delete challenge error:', error);
      throw error.response?.data || error;
    }
  },

  async toggleChallengeVisibility(id, visibility) {
    try {
      const response = await apiClient.patch(`/admin/daily-challenges/challenges/${id}/visibility`);
      const apiData = response.data.data;

      // Return the updated visibility status
      return {
        visibility: apiData.isVisible
      };
    } catch (error) {
      console.error('Toggle challenge visibility error:', error);
      throw error.response?.data || error;
    }
  },


  // Multiplier operations
  async getMultipliers() {
    try {
      const response = await apiClient.get('/admin/daily-challenges/xp-multipliers');
      const multipliersArray = response.data.data || [];

      // Transform API response to frontend format
      return multipliersArray.map(apiData => ({
        id: apiData._id,
        streakLength: apiData.streakLength,
        multiplier: apiData.multiplier,
        vipBonusApplied: apiData.vipBonusApplied,
        active: apiData.isActive,
        notes: apiData.metadata?.notes || '',
        startDate: apiData.scheduling?.startDate || null,
        endDate: apiData.scheduling?.endDate || null,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      }));
    } catch (error) {
      console.error('Get multipliers error:', error);
      throw error.response?.data || error;
    }
  },

  async createMultiplier(multiplierData) {
    try {
      // Map frontend format to API structure
      const apiPayload = {
        streakLength: multiplierData.streakLength,
        multiplier: multiplierData.multiplier,
        vipBonusApplied: multiplierData.vipBonusApplied,
        isActive: multiplierData.active,
        conditions: {
          userSegments: ['all'],
          minXP: 0,
          challengeTypes: ['spin', 'game', 'survey']
        },
        vipOverlay: {
          enabled: true,
          bonusMultiplier: 1.2,
          vipTiers: ['gold', 'platinum']
        },
        scheduling: {
          startDate: new Date().toISOString(),
          endDate: null,
          timezone: 'UTC',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
        },
        metadata: {
          priority: 10,
          tags: ['streak', 'xp_bonus'],
          notes: multiplierData.notes || ''
        }
      };

      const response = await apiClient.post('/admin/daily-challenges/xp-multipliers', apiPayload);
      const apiData = response.data.data;

      // Return in frontend format
      return {
        id: apiData._id,
        streakLength: apiData.streakLength,
        multiplier: apiData.multiplier,
        vipBonusApplied: apiData.vipBonusApplied,
        active: apiData.isActive,
        notes: apiData.metadata?.notes || '',
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      };
    } catch (error) {
      console.error('Create multiplier error:', error);
      throw error.response?.data || error;
    }
  },

  async updateMultiplier(id, multiplierData) {
    try {
      // Map frontend format to API structure
      const apiPayload = {
        multiplier: multiplierData.multiplier,
        vipBonusApplied: multiplierData.vipBonusApplied,
        vipOverlay: {
          enabled: true,
          bonusMultiplier: 1.5,
          vipTiers: ['platinum']
        },
        metadata: {
          notes: multiplierData.notes || ''
        }
      };

      const response = await apiClient.put(`/admin/daily-challenges/xp-multipliers/${id}`, apiPayload);
      const apiData = response.data.data;

      // Return in frontend format
      return {
        id: apiData._id,
        streakLength: apiData.streakLength,
        multiplier: apiData.multiplier,
        vipBonusApplied: apiData.vipBonusApplied,
        active: apiData.isActive,
        notes: apiData.metadata?.notes || '',
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      };
    } catch (error) {
      console.error('Update multiplier error:', error);
      throw error.response?.data || error;
    }
  },

  async toggleMultiplierStatus(id) {
    try {
      const response = await apiClient.patch(`/admin/daily-challenges/xp-multipliers/${id}/status`);
      const apiData = response.data.data;

      // Return the updated active status
      return {
        isActive: apiData.isActive
      };
    } catch (error) {
      console.error('Toggle multiplier status error:', error);
      throw error.response?.data || error;
    }
  },

  async deleteMultiplier(id) {
    await delay(400);
    const index = mockMultipliers.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Multiplier not found');
    mockMultipliers.splice(index, 1);
    return true;
  },

  // Bonus day operations
  async getBonusDays() {
    try {
      const response = await apiClient.get('/admin/daily-challenges/bonus-days');
      const bonusDaysArray = response.data.data || [];

      // Transform API response to frontend format
      return bonusDaysArray.map(apiData => ({
        id: apiData._id,
        bonusDay: apiData.dayNumber,
        rewardType: apiData.primaryReward.type.charAt(0).toUpperCase() + apiData.primaryReward.type.slice(1),
        rewardValue: apiData.primaryReward.value,
        alternateReward: apiData.alternateReward?.value || null,
        resetRule: apiData.resetRule.onMiss,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      }));
    } catch (error) {
      console.error('Get bonus days error:', error);
      throw error.response?.data || error;
    }
  },

  async createBonusDay(bonusDayData) {
    try {
      // Map frontend fields to API structure
      const apiPayload = {
        title: `Day ${bonusDayData.bonusDay} Bonus Reward`,
        description: `Special bonus for ${bonusDayData.bonusDay}-day streak`,
        primaryReward: {
          type: bonusDayData.rewardType.toLowerCase(),
          value: bonusDayData.rewardValue,
          metadata: {}
        },
        alternateReward: {
          type: 'xp',
          value: bonusDayData.alternateReward || Math.floor(bonusDayData.rewardValue / 2),
          metadata: {}
        },
        resetRule: {
          onMiss: bonusDayData.resetRule,
          gracePeriod: 1,
          fallbackAction: 'reset_streak'
        },
        conditions: {
          minStreak: bonusDayData.bonusDay,
          requiresCompletion: true,
          userSegments: ['all']
        },
        notification: {
          enabled: true,
          title: `${bonusDayData.bonusDay}-Day Streak Bonus!`,
          message: `You've earned a special bonus for your dedication!`,
          actionText: 'Claim Reward',
          scheduledTime: '09:00'
        },
        banner: {
          enabled: true,
          title: 'Streak Bonus Available',
          subtitle: `Claim your ${bonusDayData.bonusDay}-day reward`,
          backgroundColor: '#FFD700',
          textColor: '#000000',
          position: 'top'
        },
        isActive: true
      };

      const response = await apiClient.put(
        `/admin/daily-challenges/bonus-days/${bonusDayData.bonusDay}`,
        apiPayload
      );

      const apiData = response.data.data;

      // Return in frontend format
      return {
        id: apiData._id,
        bonusDay: apiData.dayNumber,
        rewardType: apiData.primaryReward.type.charAt(0).toUpperCase() + apiData.primaryReward.type.slice(1),
        rewardValue: apiData.primaryReward.value,
        alternateReward: apiData.alternateReward?.value || null,
        resetRule: apiData.resetRule.onMiss,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      };
    } catch (error) {
      console.error('Create bonus day error:', error);
      throw error.response?.data || error;
    }
  },

  async updateBonusDay(id, bonusDayData) {
    try {
      // Map frontend fields to API structure
      const apiPayload = {
        title: `Day ${bonusDayData.bonusDay} Bonus Reward`,
        description: `Special bonus for ${bonusDayData.bonusDay}-day streak`,
        primaryReward: {
          type: bonusDayData.rewardType.toLowerCase(),
          value: bonusDayData.rewardValue,
          metadata: {}
        },
        alternateReward: {
          type: 'xp',
          value: bonusDayData.alternateReward || Math.floor(bonusDayData.rewardValue / 2),
          metadata: {}
        },
        resetRule: {
          onMiss: bonusDayData.resetRule,
          gracePeriod: 1,
          fallbackAction: 'reset_streak'
        },
        conditions: {
          minStreak: bonusDayData.bonusDay,
          requiresCompletion: true,
          userSegments: ['all']
        },
        notification: {
          enabled: true,
          title: `${bonusDayData.bonusDay}-Day Streak Bonus!`,
          message: `You've earned a special bonus for your dedication!`,
          actionText: 'Claim Reward',
          scheduledTime: '09:00'
        },
        banner: {
          enabled: true,
          title: 'Streak Bonus Available',
          subtitle: `Claim your ${bonusDayData.bonusDay}-day reward`,
          backgroundColor: '#FFD700',
          textColor: '#000000',
          position: 'top'
        },
        isActive: true
      };

      const response = await apiClient.put(
        `/admin/daily-challenges/bonus-days/${bonusDayData.bonusDay}`,
        apiPayload
      );

      const apiData = response.data.data;

      // Return in frontend format
      return {
        id: apiData._id,
        bonusDay: apiData.dayNumber,
        rewardType: apiData.primaryReward.type.charAt(0).toUpperCase() + apiData.primaryReward.type.slice(1),
        rewardValue: apiData.primaryReward.value,
        alternateReward: apiData.alternateReward?.value || null,
        resetRule: apiData.resetRule.onMiss,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
      };
    } catch (error) {
      console.error('Update bonus day error:', error);
      throw error.response?.data || error;
    }
  },

  async deleteBonusDay(id) {
    await delay(400);
    const index = mockBonusDays.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Bonus day not found');
    mockBonusDays.splice(index, 1);
    return true;
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
      updatedAt: new Date().toISOString()
    };
    mockPauseRules.push(newPauseRule);
    return newPauseRule;
  },

  async updatePauseRule(id, pauseRuleData) {
    await delay(500);
    const index = mockPauseRules.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pause rule not found');

    const updatedPauseRule = {
      ...mockPauseRules[index],
      ...pauseRuleData,
      updatedAt: new Date().toISOString()
    };
    mockPauseRules[index] = updatedPauseRule;
    return updatedPauseRule;
  },

  async deletePauseRule(id) {
    await delay(400);
    const index = mockPauseRules.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pause rule not found');
    mockPauseRules.splice(index, 1);
    return true;
  },

};

// Export mock data for testing
export { mockChallenges, mockMultipliers, mockBonusDays, mockPauseRules };