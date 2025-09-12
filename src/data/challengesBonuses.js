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

};

// Export mock data for testing
export { mockChallenges, mockMultipliers };