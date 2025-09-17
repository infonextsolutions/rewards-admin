export const MOCK_XP_TIERS = [
  {
    id: 1,
    tierName: "Junior",
    tierColor: "#f68d2b",
    bgColor: "#ffefda",
    borderColor: "#c77023",
    iconSrc: "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--9@2x.png",
    xpMin: 0,
    xpMax: 999,
    xpRange: "0 - 999 XP",
    badge: "🥉",
    badgeFile: null,
    accessBenefits: "Entry-level access",
    status: true,
  },
  {
    id: 2,
    tierName: "Middle Level",
    tierColor: "#6f85a4",
    bgColor: "#f4f4f4",
    borderColor: "#9aa7b8",
    iconSrc: "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--1@2x.png",
    xpMin: 1000,
    xpMax: 2999,
    xpRange: "1000 - 2999 XP",
    badge: "🥈",
    badgeFile: null,
    accessBenefits: "Mid-tier access with bonuses",
    status: true,
  },
  {
    id: 3,
    tierName: "Senior",
    tierColor: "#c7a20f",
    bgColor: "#fffddf",
    borderColor: "#f0c92e",
    iconSrc: "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--5@2x.png",
    xpMin: 3000,
    xpMax: 9999,
    xpRange: "3000 - 9999 XP",
    badge: "🥇",
    badgeFile: null,
    accessBenefits: "Premium access with exclusive rewards",
    status: true,
  },
];

export const MOCK_XP_DECAY_SETTINGS = [
  {
    id: 1,
    tierName: "Junior",
    xpRange: "0 - 999 XP",
    decayRuleType: "Fixed",
    inactivityDuration: "7 Days",
    minimumXpLimit: 100,
    decayPercentage: "25%",
    // EXCLUDED: User-notification toggle for XP decay warnings not supported per requirements
    // notificationToggle: true,
    status: true,
  },
  {
    id: 2,
    tierName: "Middle Level", 
    xpRange: "1000 - 2999 XP",
    decayRuleType: "Stepwise",
    inactivityDuration: "10 Days",
    minimumXpLimit: 200,
    decayPercentage: "20%",
    // EXCLUDED: User-notification toggle for XP decay warnings not supported per requirements
    // notificationToggle: true,
    status: true,
  },
  {
    id: 3,
    tierName: "Senior",
    xpRange: "3000 - 9999 XP", 
    decayRuleType: "Fixed",
    inactivityDuration: "14 Days",
    minimumXpLimit: 500,
    decayPercentage: "15%",
    // EXCLUDED: User-notification toggle for XP decay warnings not supported per requirements
    // notificationToggle: false,
    status: true,
  },
];

// EXCLUDED: Tier-specific XP-to-currency conversion ratios and payout channel mapping not supported per requirements
export const MOCK_XP_CONVERSIONS = [
  // XP conversion functionality disabled per requirements
  // {
  //   id: 1,
  //   tierName: "Junior",
  //   xpRange: "0 - 999 XP",
  //   conversionRatio: "100 XP = 1 Point",
  //   enabled: true,
  //   redemptionChannels: ["Mobile App", "Web Portal"],
  //   status: true,
  // },
  // {
  //   id: 2,
  //   tierName: "Middle Level",
  //   xpRange: "1000 - 2999 XP",
  //   conversionRatio: "90 XP = 1 Point",
  //   enabled: true,
  //   redemptionChannels: ["Mobile App", "Web Portal", "Partner Stores"],
  //   status: true,
  // },
  // {
  //   id: 3,
  //   tierName: "Senior",
  //   xpRange: "3000 - 9999 XP",
  //   conversionRatio: "80 XP = 1 Point",
  //   enabled: true,
  //   redemptionChannels: ["Mobile App", "Web Portal", "Partner Stores", "VIP Support"],
  //   status: true,
  // },
];

export const MOCK_BONUS_LOGIC = [
  {
    id: 1,
    bonusType: "Login Streak",
    triggerCondition: "7 consecutive logins",
    rewardValue: "500 XP",
    active: true,
    status: true,
  },
  {
    id: 2,
    bonusType: "Referral",
    triggerCondition: "Successful friend referral", 
    rewardValue: "1000 XP",
    active: true,
    status: true,
  },
  {
    id: 3,
    bonusType: "Daily Task",
    triggerCondition: "Complete daily objectives",
    rewardValue: "200 XP",
    active: true,
    status: true,
  },
];

export const REWARDS_TABS = [
  { name: "XP Tiers" },
  { name: "XP Decay Settings" },
  { name: "XP Conversion" },
  { name: "Bonus Logic" },
];

export const REWARDS_FILTER_OPTIONS = {
  base: [
    {
      id: "dateRange",
      label: "Date Range",
      options: ["Date Range", "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year", "Custom Range"],
    },
    {
      id: "status", 
      label: "Status",
      options: ["Status", "All Status", "Active", "Inactive"],
    },
    {
      id: "sortBy",
      label: "Sort By",
      options: ["Sort By", "Name A-Z", "Name Z-A", "Created Date", "Last Modified", "XP Range"],
    },
  ],
  "XP Tiers": [
    {
      id: "type",
      label: "Tier Level",
      options: ["Tier Level", "All Tiers", "Junior", "Middle Level", "Senior"],
    },
    {
      id: "xpRange",
      label: "XP Range",
      options: ["XP Range", "0-999", "1000-2999", "3000-9999", "10000+"],
    },
  ],
  "XP Decay Settings": [
    {
      id: "type",
      label: "Decay Type",
      options: ["Decay Type", "All Types", "Fixed", "Stepwise", "Gradual"],
    },
    {
      id: "duration",
      label: "Duration",
      options: ["Duration", "7 Days", "10 Days", "14 Days", "30 Days"],
    },
    {
      id: "percentage",
      label: "Decay Rate",
      options: ["Decay Rate", "15%", "20%", "25%", "30%+"],
    },
  ],
  "XP Conversion": [
    {
      id: "type",
      label: "Tier Level",
      options: ["Tier Level", "All Tiers", "Junior", "Middle Level", "Senior"],
    },
    {
      id: "enabled",
      label: "Enabled Status",
      options: ["Enabled Status", "Enabled", "Disabled"],
    },
    {
      id: "channels",
      label: "Channels",
      options: ["Channels", "Mobile App", "Web Portal", "Partner Stores", "VIP Support"],
    },
  ],
  "Bonus Logic": [
    {
      id: "type",
      label: "Bonus Type", 
      options: ["Bonus Type", "All Types", "Login Streak", "Referral", "Daily Task", "Achievement", "Special Event"],
    },
    {
      id: "rewardType",
      label: "Reward Type",
      options: ["Reward Type", "XP", "Coins", "Currency", "Mixed"],
    },
    {
      id: "activeStatus",
      label: "Active Status",
      options: ["Active Status", "Active", "Inactive"],
    },
  ],
};