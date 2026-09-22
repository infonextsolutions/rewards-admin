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
