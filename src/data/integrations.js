// Mock data for SDK integrations
export const MOCK_INTEGRATIONS = [
  {
    id: 'bitlabs-001',
    name: 'Bitlabs',
    description: 'Survey platform integration for user surveys and rewards',
    category: 'Survey Platform',
    apiKey: 'bl_live_sk_1234567890abcdef',
    endpointUrl: 'https://api.bitlabs.ai/v1',
    status: 'Connected',
    lastTested: '2025-01-15T10:30:00Z',
    lastUpdated: '2025-01-14T14:22:00Z',
    isActive: true,
    config: {}
  },
  {
    id: 'tremendous-002',
    name: 'Tremendous',
    description: 'Digital reward platform for vouchers and gift cards',
    category: 'Rewards Platform',
    apiKey: 'tr_live_abc123def456',
    endpointUrl: 'https://api.tremendous.com/api/v3',
    status: 'Connected',
    lastTested: '2025-01-15T09:15:00Z',
    lastUpdated: '2025-01-13T16:45:00Z',
    isActive: true,
    config: {}
  },
  {
    id: 'intercom-003',
    name: 'Intercom',
    description: 'Customer messaging and support platform',
    category: 'Customer Support',
    apiKey: 'dG9rZW46aW50ZXJjb21fYWNjZXNzX3Rva2Vu',
    endpointUrl: 'https://api.intercom.io',
    status: 'Failed',
    lastTested: '2025-01-15T08:45:00Z',
    lastUpdated: '2025-01-12T11:30:00Z',
    isActive: false,
    config: {},
    error: 'Authentication failed - Invalid API key'
  },
  {
    id: 'everflow-004',
    name: 'Everflow',
    description: 'Attribution and campaign analytics platform',
    category: 'Analytics',
    apiKey: 'ef_sk_9876543210',
    endpointUrl: 'https://api.everflow.io/v1',
    status: 'Connected',
    lastTested: '2025-01-15T11:00:00Z',
    lastUpdated: '2025-01-15T11:00:00Z',
    isActive: true,
    config: {}
  },
];

// Integration categories for filtering - core 4 integrations only
export const INTEGRATION_CATEGORIES = [
  'All Categories',
  'Survey Platform',
  'Rewards Platform', 
  'Customer Support',
  'Analytics'
];

// Connection status options
export const CONNECTION_STATUSES = [
  'All Statuses',
  'Connected',
  'Failed',
  'Untested'
];

// Available integrations that can be added (only the 4 specified)
export const AVAILABLE_INTEGRATIONS = [
  {
    name: 'Bitlabs',
    description: 'Survey platform integration',
    category: 'Survey Platform',
    defaultEndpoint: 'https://api.bitlabs.ai/v1'
  },
  {
    name: 'Tremendous',
    description: 'Digital reward platform',
    category: 'Rewards Platform', 
    defaultEndpoint: 'https://api.tremendous.com/api/v3'
  },
  {
    name: 'Intercom',
    description: 'Customer messaging platform',
    category: 'Customer Support',
    defaultEndpoint: 'https://api.intercom.io'
  },
  {
    name: 'Everflow',
    description: 'Attribution and analytics platform',
    category: 'Analytics',
    defaultEndpoint: 'https://api.everflow.io/v1'
  }
];