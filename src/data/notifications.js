// Mock data for notification settings - basic as per requirements
export const MOCK_NOTIFICATION_SETTINGS = {
  email: {
    enabled: true,
    recipients: ['admin@jackson.com'],
    events: ['cashout_failure']
  },
  slack: {
    enabled: false,
    webhookUrl: '',
    events: ['system_error']
  },
  firebase: {
    abTestingEnabled: true
  }
};

// Notification types - only Email and Slack as per requirements
export const NOTIFICATION_TYPES = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'slack', label: 'Slack', icon: '💬' }
];

// Available trigger events - core events as per requirements
export const TRIGGER_EVENTS = [
  {
    value: 'cashout_failure',
    label: 'Cashout Failure', 
    description: 'When a user cashout request fails',
    category: 'System'
  },
  {
    value: 'system_error',
    label: 'System Error',
    description: 'Critical system errors',
    category: 'System'
  },
  {
    value: 'survey_completed',
    label: 'Survey Completed',
    description: 'When a user completes a survey',
    category: 'System'
  }
];

// User roles for notifications
export const NOTIFICATION_ROLES = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full access administrators',
    users: ['admin@jackson.com', 'cto@jackson.com']
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Standard administrators',
    users: ['ops@jackson.com', 'manager@jackson.com']
  },
  {
    value: 'qa_tester',
    label: 'QA Tester',
    description: 'Quality assurance team',
    users: ['qa@jackson.com', 'test@jackson.com']
  },
  {
    value: 'analyst',
    label: 'Analyst',
    description: 'Data analysts and viewers',
    users: ['analyst@jackson.com', 'reports@jackson.com']
  },
  {
    value: 'support',
    label: 'Support Team',
    description: 'Customer support representatives',
    users: ['support@jackson.com', 'help@jackson.com']
  }
];

// Event categories for grouping
export const EVENT_CATEGORIES = [
  'All Categories',
  'Payments',
  'System',
  'Security', 
  'Users',
  'Engagement',
  'Rewards'
];

// Firebase feature flags - only A/B testing as per requirements
export const FIREBASE_FEATURES = [
  {
    key: 'ab_testing_enabled',
    label: 'A/B Testing',
    description: 'Enable Firebase A/B Testing experiments',
    enabled: true
  }
];