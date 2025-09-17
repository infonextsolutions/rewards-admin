// EXCLUDED: Notification settings with Slack configuration not supported per requirements
export const MOCK_NOTIFICATION_SETTINGS = {
  email: {
    enabled: true,
    recipients: ['admin@jackson.com'],
    events: ['cashout_failure']
  },
  // EXCLUDED: Slack configuration not supported per requirements
  // slack: {
  //   enabled: false,
  //   webhookUrl: '',
  //   events: ['system_error']
  // },
  // EXCLUDED: Firebase A/B testing not supported per requirements
  // firebase: {
  //   abTestingEnabled: true
  // }
};

// EXCLUDED: Notification types with Slack not supported per requirements
export const NOTIFICATION_TYPES = [
  { value: 'email', label: 'Email', icon: '📧' },
  // EXCLUDED: Slack notifications not supported per requirements
  // { value: 'slack', label: 'Slack', icon: '💬' }
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

// EXCLUDED: Notification roles/recipients configuration not supported per requirements
export const NOTIFICATION_ROLES = [
  // Notification recipient configuration disabled per requirements
  // {
  //   value: 'super_admin',
  //   label: 'Super Admin',
  //   description: 'Full access administrators',
  //   users: ['admin@jackson.com', 'cto@jackson.com']
  // },
  // {
  //   value: 'admin',
  //   label: 'Admin',
  //   description: 'Standard administrators',
  //   users: ['ops@jackson.com', 'manager@jackson.com']
  // },
  // {
  //   value: 'qa_tester',
  //   label: 'QA Tester',
  //   description: 'Quality assurance team',
  //   users: ['qa@jackson.com', 'test@jackson.com']
  // },
  // {
  //   value: 'analyst',
  //   label: 'Analyst',
  //   description: 'Data analysts and viewers',
  //   users: ['analyst@jackson.com', 'reports@jackson.com']
  // },
  // {
  //   value: 'support',
  //   label: 'Support Team',
  //   description: 'Customer support representatives',
  //   users: ['support@jackson.com', 'help@jackson.com']
  // }
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

// EXCLUDED: Firebase feature flags not supported per requirements
export const FIREBASE_FEATURES = [
  // Firebase A/B testing feature flags disabled per requirements
  // {
  //   key: 'ab_testing_enabled',
  //   label: 'A/B Testing',
  //   description: 'Enable Firebase A/B Testing experiments',
  //   enabled: true
  // }
];