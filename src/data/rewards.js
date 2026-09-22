export const REWARDS_TABS = [
  { name: "XP Tiers" },
  { name: "XP Decay Settings" },
  // { name: "XP Conversion" },
  { name: "Daily Rewards" },
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
  "Daily Rewards": [
    {
      id: "status",
      label: "Status",
      options: ["Status", "All Status", "Active", "Inactive"],
    },
  ],
};