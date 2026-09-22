export const USER_FILTER_OPTIONS = [
  {
    id: "tierLevel",
    label: "Tier Level",
    options: ["Bronze", "Gold", "Platinum"],
  },
  {
    id: "location",
    label: "Location",
    options: [
      "New York, USA",
      "Lyon, France", 
      "London, UK",
      "Delhi, India",
      "Madrid, Spain",
      "Cairo, Egypt",
      "Los Angeles, USA",
      "Berlin, Germany",
      "Chicago, USA",
      "Miami, USA",
      "Sydney, Australia",
    ],
  },
  {
    id: "memberSince",
    label: "Member since",
    options: [
      "Last 30 days",
      "Last 3 months",
      "Last 6 months",
      "Last year",
      "More than a year",
    ],
  },
  {
    id: "status",
    label: "Status",
    options: ["Active", "Inactive"],
  },
  {
    id: "gender",
    label: "Gender",
    options: ["Male", "Female", "Other"],
  },
  {
    id: "ageRange",
    label: "Age Range",
    options: ["18-24", "25-34", "35-44", "45-54", "55+"],
  },
  {
    id: "marketingChannel",
    label: "Marketing Channel",
    options: [], // Will be populated dynamically from API
  },
];