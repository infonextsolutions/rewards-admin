// Mock data for push notification campaigns
export const MOCK_CAMPAIGNS = [
  {
    id: 'campaign-001',
    name: 'Summer Blast Promo',
    title: 'Win Big!',
    body: 'Log in to spin the wheel and win prizes!',
    targetSegment: ['Gold', 'India'],
    scheduleTime: null,
    frequencyRule: '1 per user/day',
    ctaAction: 'app_home',
    trackInFirebase: true,
    status: 'Sent',
    type: 'standard',
    createdBy: 'admin@jackson.com',
    createdAt: '2025-01-14T10:30:00Z',
    sentAt: '2025-01-14T14:00:00Z',
    stats: {
      sent: 1000,
      delivered: 950,
      opened: 300,
      clicked: 75,
      openRate: 30.0,
      ctr: 7.5
    }
  },
  {
    id: 'campaign-002',
    name: 'New User Welcome',
    title: 'Welcome to Jackson!',
    body: 'Complete your profile to start earning.',
    targetSegment: ['Silver'],
    scheduleTime: '2025-01-16T09:00:00Z',
    frequencyRule: '1 per user/week',
    ctaAction: 'app_home',
    trackInFirebase: true,
    status: 'Scheduled',
    type: 'standard',
    createdBy: 'admin@jackson.com',
    createdAt: '2025-01-15T08:45:00Z',
    sentAt: null,
    stats: null
  },
  {
    id: 'campaign-003',
    name: 'Weekend Bonus',
    title: 'Double Points Weekend!',
    body: 'Earn 2x points this weekend only.',
    targetSegment: ['Gold'],
    scheduleTime: null,
    frequencyRule: '1 per user/day',
    ctaAction: 'app_home',
    trackInFirebase: true,
    status: 'Failed',
    type: 'standard',
    createdBy: 'admin@jackson.com',
    createdAt: '2025-01-13T16:30:00Z',
    sentAt: '2025-01-14T08:00:00Z',
    error: 'Firebase authentication failed',
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      ctr: 0
    }
  }
];

// Mock A/B test campaigns
export const MOCK_AB_TESTS = [
  {
    id: 'abtest-001',
    name: 'Login Incentive Test',
    baseMessage: 'Login now to claim your rewards!',
    variants: {
      A: {
        title: 'Claim Your Daily Reward!',
        body: 'Login now to claim your daily reward.'
      },
      B: {
        title: 'Your Reward is Waiting!',
        body: 'Login to claim 2x your daily reward points!'
      }
    },
    targetSegment: ['Gold', 'Silver'],
    audienceSplit: 50,
    status: 'Running',
    launchedAt: '2025-01-14T10:00:00Z',
    createdBy: 'admin@jackson.com',
    stats: {
      variantA: {
        sent: 500,
        delivered: 490,
        opened: 150,
        clicked: 30,
        openRate: 30.0,
        ctr: 6.0
      },
      variantB: {
        sent: 500,
        delivered: 495,
        opened: 175,
        clicked: 40,
        openRate: 35.0,
        ctr: 8.0
      }
    },
    winner: null
  }
];

// Campaign status options
export const CAMPAIGN_STATUSES = [
  'All Statuses',
  'Draft',
  'Scheduled',
  'Sent',
  'Failed'
];

// Campaign types
export const CAMPAIGN_TYPES = [
  { value: 'standard', label: 'Standard Campaign', icon: '📢' },
  { value: 'ab_test', label: 'A/B Test Campaign', icon: '🧪' }
];

// Frequency rules for spam prevention
export const FREQUENCY_RULES = [
  { value: '1 per user/day', label: '1 per user/day', description: 'Maximum 1 notification per user per day' },
  { value: '2 per user/day', label: '2 per user/day', description: 'Maximum 2 notifications per user per day' },
  { value: '1 per user/week', label: '1 per user/week', description: 'Maximum 1 notification per user per week' },
  { value: '3 per user/week', label: '3 per user/week', description: 'Maximum 3 notifications per user per week' },
  { value: 'unlimited', label: 'No limit', description: 'No frequency restrictions (use with caution)' }
];

// CTA action types
export const CTA_ACTIONS = [
  {
    value: 'app_home',
    label: 'Open App',
    description: 'Opens the app home screen',
    deepLink: 'jackson://home'
  },
  {
    value: 'offer_detail',
    label: 'View Offer',
    description: 'Shows offer details',
    deepLink: 'jackson://offers'
  },
  {
    value: 'game_launch',
    label: 'Play Game',
    description: 'Opens game',
    deepLink: 'jackson://games'
  }
];

// User role permissions for RBAC
export const PUSH_NOTIFICATION_ROLES = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    permissions: {
      create: true,
      edit: true,
      delete: true,
      send: true,
      abTest: true,
      viewAnalytics: true
    }
  },
  {
    role: 'marketing_admin',
    label: 'Marketing Admin', 
    permissions: {
      create: true,
      edit: true,
      delete: false,
      send: false,
      abTest: true,
      viewAnalytics: true
    }
  },
  {
    role: 'analyst',
    label: 'Analyst',
    permissions: {
      create: false,
      edit: false,
      delete: false,
      send: false,
      abTest: false,
      viewAnalytics: true
    }
  }
];