'use client';

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
  async getChallenges() {
    await delay(500); // Simulate network delay
    return [...mockChallenges];
  },

  async createChallenge(challengeData) {
    await delay(800);
    const newChallenge = {
      ...challengeData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockChallenges.push(newChallenge);
    return newChallenge;
  },

  async updateChallenge(id, challengeData) {
    await delay(600);
    const index = mockChallenges.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Challenge not found');
    
    const updatedChallenge = {
      ...mockChallenges[index],
      ...challengeData,
      updatedAt: new Date().toISOString()
    };
    mockChallenges[index] = updatedChallenge;
    return updatedChallenge;
  },

  async deleteChallenge(id) {
    await delay(400);
    const index = mockChallenges.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Challenge not found');
    mockChallenges.splice(index, 1);
    return true;
  },

  async toggleChallengeVisibility(id, visibility) {
    await delay(300);
    const index = mockChallenges.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Challenge not found');
    
    const updatedChallenge = {
      ...mockChallenges[index],
      visibility,
      updatedAt: new Date().toISOString()
    };
    mockChallenges[index] = updatedChallenge;
    return updatedChallenge;
  },


  // Multiplier operations
  async getMultipliers() {
    await delay(400);
    return [...mockMultipliers];
  },

  async createMultiplier(multiplierData) {
    await delay(700);
    const newMultiplier = {
      ...multiplierData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockMultipliers.push(newMultiplier);
    return newMultiplier;
  },

  async updateMultiplier(id, multiplierData) {
    await delay(500);
    const index = mockMultipliers.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Multiplier not found');

    const updatedMultiplier = {
      ...mockMultipliers[index],
      ...multiplierData,
      updatedAt: new Date().toISOString()
    };
    mockMultipliers[index] = updatedMultiplier;
    return updatedMultiplier;
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
    await delay(400);
    return [...mockBonusDays];
  },

  async createBonusDay(bonusDayData) {
    await delay(700);
    const newBonusDay = {
      ...bonusDayData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockBonusDays.push(newBonusDay);
    return newBonusDay;
  },

  async updateBonusDay(id, bonusDayData) {
    await delay(500);
    const index = mockBonusDays.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Bonus day not found');

    const updatedBonusDay = {
      ...mockBonusDays[index],
      ...bonusDayData,
      updatedAt: new Date().toISOString()
    };
    mockBonusDays[index] = updatedBonusDay;
    return updatedBonusDay;
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