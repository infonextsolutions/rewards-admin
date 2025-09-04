export const MOCK_REMOTE_CONFIGS = [
  {
    configId: 'RC-001',
    title: 'Coin Visibility Toggle',
    segment: 'All Users',
    keyName: 'isCoinVisible',
    value: 'true',
    type: 'Toggle',
    status: 'Active',
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-01-20T14:45:00Z'
  },
  {
    configId: 'RC-002',
    title: 'XP Display Toggle',
    segment: 'Beta Group',
    keyName: 'showXP',
    value: 'false',
    type: 'Toggle',
    status: 'Active',
    createdAt: '2025-01-10T12:00:00Z',
    updatedAt: '2025-01-18T16:20:00Z'
  },
  {
    configId: 'RC-003',
    title: 'Premium Features Access',
    segment: 'Gold Tier',
    keyName: 'enablePremiumFeatures',
    value: 'true',
    type: 'Toggle',
    status: 'Active',
    createdAt: '2025-01-05T09:15:00Z',
    updatedAt: '2025-01-22T11:30:00Z'
  },
  {
    configId: 'RC-004',
    title: 'Daily Login Bonus',
    segment: 'Silver Tier',
    keyName: 'dailyBonusAmount',
    value: '50',
    type: 'Numeric',
    status: 'Active',
    createdAt: '2025-01-12T14:20:00Z',
    updatedAt: '2025-01-19T10:15:00Z'
  },
  {
    configId: 'RC-005',
    title: 'Maintenance Mode',
    segment: 'All Users',
    keyName: 'maintenanceMode',
    value: 'false',
    type: 'Toggle',
    status: 'Inactive',
    createdAt: '2025-01-08T16:45:00Z',
    updatedAt: '2025-01-21T13:10:00Z'
  },
  {
    configId: 'RC-006',
    title: 'Welcome Message',
    segment: 'New Users',
    keyName: 'welcomeMessage',
    value: 'Welcome to Jackson Platform!',
    type: 'Text',
    status: 'Active',
    createdAt: '2025-01-14T11:30:00Z',
    updatedAt: '2025-01-20T09:45:00Z'
  },
  {
    configId: 'RC-007',
    title: 'Game Speed Multiplier',
    segment: 'VIP Users',
    keyName: 'gameSpeedMultiplier',
    value: '1.5',
    type: 'Numeric',
    status: 'Active',
    createdAt: '2025-01-09T13:25:00Z',
    updatedAt: '2025-01-17T15:50:00Z'
  },
  {
    configId: 'RC-008',
    title: 'Social Features',
    segment: 'Beta Group',
    keyName: 'enableSocialFeatures',
    value: 'true',
    type: 'Toggle',
    status: 'Active',
    createdAt: '2025-01-11T10:10:00Z',
    updatedAt: '2025-01-23T12:35:00Z'
  },
  {
    configId: 'RC-009',
    title: 'Theme Selection',
    segment: 'All Users',
    keyName: 'appTheme',
    value: 'dark',
    type: 'Enum',
    status: 'Active',
    createdAt: '2025-01-12T14:20:00Z',
    updatedAt: '2025-01-24T10:15:00Z',
    enumOptions: ['light', 'dark', 'auto']
  },
  {
    configId: 'RC-010',
    title: 'Notification Priority',
    segment: 'VIP Users',
    keyName: 'notificationPriority',
    value: 'high',
    type: 'Enum',
    status: 'Active',
    createdAt: '2025-01-13T16:30:00Z',
    updatedAt: '2025-01-25T11:20:00Z',
    enumOptions: ['low', 'medium', 'high', 'critical']
  }
];

export const MOCK_PID_REWARDS = [
  {
    pidCampaignId: 'PID-123',
    segment: 'Gold Tier',
    rewardMultiplier: 1.5,
    userCount: 1250,
    status: 'Active',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-20T16:30:00Z'
  },
  {
    pidCampaignId: 'PID-124',
    segment: 'Silver Tier',
    rewardMultiplier: 1.2,
    userCount: 2340,
    status: 'Active',
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-18T14:20:00Z'
  },
  {
    pidCampaignId: 'PID-125',
    segment: 'Bronze Tier',
    rewardMultiplier: 1.0,
    userCount: 4560,
    status: 'Active',
    createdAt: '2025-01-08T11:45:00Z',
    updatedAt: '2025-01-22T13:10:00Z'
  },
  {
    pidCampaignId: 'PID-126',
    segment: 'VIP Users',
    rewardMultiplier: 2.0,
    userCount: 450,
    status: 'Active',
    createdAt: '2025-01-15T14:30:00Z',
    updatedAt: '2025-01-21T10:45:00Z'
  },
  {
    pidCampaignId: 'PID-127',
    segment: 'New Users',
    rewardMultiplier: 1.1,
    userCount: 890,
    status: 'Inactive',
    createdAt: '2025-01-05T16:20:00Z',
    updatedAt: '2025-01-19T12:55:00Z'
  }
];

export const SEGMENTS = [
  'All Users',
  'New Users',
  'Beta Group',
  'Gold Tier',
  'Silver Tier',
  'Bronze Tier',
  'VIP Users'
];

export const CONFIG_TYPES = [
  'Toggle',
  'Text',
  'Numeric',
  'Enum'
];

export const STATUS_OPTIONS = [
  'Active',
  'Inactive'
];