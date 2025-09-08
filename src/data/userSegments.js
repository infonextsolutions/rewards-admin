// Mock data for user segmentation
export const USER_SEGMENTS = [
  // Tier-based segments
  {
    id: 'gold',
    name: 'Gold',
    category: 'Tier',
    description: 'Users with Gold tier status',
    userCount: 4350,
    criteria: { tier: 'gold' }
  },
  {
    id: 'silver',
    name: 'Silver',
    category: 'Tier',
    description: 'Users with Silver tier status',
    userCount: 8920,
    criteria: { tier: 'silver' }
  },
  {
    id: 'bronze',
    name: 'Bronze',
    category: 'Tier',
    description: 'Users with Bronze tier status',
    userCount: 15420,
    criteria: { tier: 'bronze' }
  },

  // Geographic segments
  {
    id: 'india',
    name: 'India',
    category: 'Geography',
    description: 'Users located in India',
    userCount: 12580,
    criteria: { country: 'IN' }
  },
  {
    id: 'usa',
    name: 'USA',
    category: 'Geography', 
    description: 'Users located in United States',
    userCount: 8740,
    criteria: { country: 'US' }
  }
];

// Segment categories for filtering
export const SEGMENT_CATEGORIES = [
  'All Categories',
  'Tier',
  'Geography'
];

// Segment size warnings
export const SEGMENT_SIZE_LIMITS = {
  minimum: 100, // Minimum for performance analysis
  maximum: 50000, // Maximum for single campaign
  abTestMinimum: 200, // Minimum for A/B testing (100 per variant)
  testOnly: 500 // Maximum for test campaigns
};