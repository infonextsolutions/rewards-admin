export const SURVEY_SDKS = [
  {
    id: 'bitlabs-001',
    name: 'Bitlabs',
    displayName: 'Paid Surveys',
    description: 'Premium survey platform with high-paying opportunities',
    status: 'Active',
    apiKey: 'bl_live_sk_1234567890abcdef',
    endpointUrl: 'https://api.bitlabs.ai/v1',
    lastTested: '2025-01-15T10:30:00Z',
    lastUpdated: '2025-01-14T14:22:00Z',
    isActive: true,
    maxDailyUsers: 1000,
    segmentRules: {
      ageRange: { min: 18, max: 65 },
      countries: ['US', 'UK', 'CA', 'AU'],
      gender: 'all'
    },
    previewAudienceCount: 15420
  },
  {
    id: 'offertoro-002',
    name: 'Offertoro',
    displayName: 'Quick Surveys',
    description: 'Fast completion surveys with instant rewards',
    status: 'Active',
    apiKey: 'ot_live_abc123def456',
    endpointUrl: 'https://api.offertoro.com/v2',
    lastTested: '2025-01-15T09:15:00Z',
    lastUpdated: '2025-01-13T16:45:00Z',
    isActive: true,
    maxDailyUsers: 500,
    segmentRules: {
      ageRange: { min: 21, max: 55 },
      countries: ['US', 'CA'],
      gender: 'all'
    },
    previewAudienceCount: 8750
  },
  {
    id: 'cpx-research-003',
    name: 'CPX Research',
    displayName: 'Research Panels',
    description: 'Market research and consumer insights platform',
    status: 'Inactive',
    apiKey: 'cpx_sk_9876543210',
    endpointUrl: 'https://api.cpxresearch.com/v1',
    lastTested: '2025-01-10T14:20:00Z',
    lastUpdated: '2025-01-12T11:30:00Z',
    isActive: false,
    maxDailyUsers: 750,
    segmentRules: {
      ageRange: { min: 25, max: 50 },
      countries: ['US', 'UK', 'DE'],
      gender: 'all'
    },
    previewAudienceCount: 12100
  }
];

export const LIVE_OFFERS = [
  {
    id: 'LO001',
    title: 'Crypto Investment Survey',
    sdkSource: 'Bitlabs',
    category: 'Finance',
    coinReward: 250,
    status: 'Live',
    avgCompletionTime: '6m 12s',
    coinsIssued: 47500,
    engagementFunnel: {
      views: 450,
      starts: 380,
      completions: 190
    },
    description: 'Share your thoughts on cryptocurrency investments'
  },
  {
    id: 'LO002',
    title: 'Shopping Habits Study',
    sdkSource: 'Offertoro',
    category: 'Consumer',
    coinReward: 180,
    status: 'Live',
    avgCompletionTime: '4m 30s',
    coinsIssued: 32400,
    engagementFunnel: {
      views: 320,
      starts: 285,
      completions: 180
    },
    description: 'Tell us about your online shopping preferences'
  },
  {
    id: 'LO003',
    title: 'Health & Wellness Survey',
    sdkSource: 'Bitlabs',
    category: 'Health',
    coinReward: 300,
    status: 'Paused',
    avgCompletionTime: '8m 45s',
    coinsIssued: 21600,
    engagementFunnel: {
      views: 280,
      starts: 220,
      completions: 72
    },
    description: 'Your health and wellness routine insights'
  },
  {
    id: 'LO004',
    title: 'Mobile App Usage Study',
    sdkSource: 'CPX Research',
    category: 'Technology',
    coinReward: 150,
    status: 'Live',
    avgCompletionTime: '3m 20s',
    coinsIssued: 28500,
    engagementFunnel: {
      views: 520,
      starts: 460,
      completions: 190
    },
    description: 'How do you use mobile apps in daily life?'
  },
  {
    id: 'LO005',
    title: 'Travel Preferences Survey',
    sdkSource: 'Offertoro',
    category: 'Travel',
    coinReward: 220,
    status: 'Live',
    avgCompletionTime: '5m 55s',
    coinsIssued: 15840,
    engagementFunnel: {
      views: 210,
      starts: 180,
      completions: 72
    },
    description: 'Share your travel and vacation preferences'
  }
];

export const SEGMENT_OPTIONS = {
  ageRanges: [
    { label: '18-24', value: { min: 18, max: 24 } },
    { label: '25-34', value: { min: 25, max: 34 } },
    { label: '35-44', value: { min: 35, max: 44 } },
    { label: '45-54', value: { min: 45, max: 54 } },
    { label: '55-65', value: { min: 55, max: 65 } },
    { label: '18-65 (All)', value: { min: 18, max: 65 } }
  ],
  countries: [
    { label: 'United States', code: 'US' },
    { label: 'United Kingdom', code: 'UK' },
    { label: 'Canada', code: 'CA' },
    { label: 'Australia', code: 'AU' },
    { label: 'Germany', code: 'DE' },
    { label: 'France', code: 'FR' },
    { label: 'Japan', code: 'JP' }
  ],
  genderOptions: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ]
};

