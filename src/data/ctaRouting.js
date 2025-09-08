// Basic CTA routing configuration
export const CTA_ROUTING_CONFIG = {
  app_home: {
    label: 'Open App',
    deepLink: 'jackson://home',
    description: 'Opens the main app home screen'
  },
  offer_detail: {
    label: 'View Offer',
    deepLink: 'jackson://offers',
    description: 'Opens offer screen'
  },
  game_launch: {
    label: 'Play Game',
    deepLink: 'jackson://games',
    description: 'Opens games screen'
  }
};

// Basic CTA categories 
export const CTA_CATEGORIES = [
  {
    id: 'basic',
    label: 'Basic Actions',
    description: 'Basic navigation and actions'
  }
];

// Basic game configurations
export const GAME_CONFIGS = [
  {
    gameId: 'spin-wheel',
    name: 'Spin Wheel',
    isActive: true
  }
];

// Basic offer configurations
export const OFFER_CONFIGS = [
  {
    offerId: 'welcome-bonus',
    title: 'Welcome Bonus',
    isActive: true
  }
];