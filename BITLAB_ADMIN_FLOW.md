# BitLab Admin Flow Documentation

## Overview

This document explains the complete flow for admin users to view and manage BitLab non-gaming offers and surveys in the admin frontend.

---

## 📋 Complete Admin Flow

### 1. **Admin Access & Navigation**

```
Admin User → Login → Dashboard → Surveys & Non-Gaming Offers Page
```

**Entry Point:**

- Admin logs into the admin panel
- Navigates to "Surveys & Non-Gaming Offers" from the sidebar
- URL: `/surveys-offers`

---

### 2. **Tab Selection**

The admin sees 4 tabs:

1. **SDK Manager** - Configure survey SDKs
2. **Live Offers & Analytics** - View managed offers
3. **Non-Gaming Offers** ⭐ - View BitLab non-gaming offers
4. **BitLab Surveys** ⭐ - View BitLab surveys specifically

---

### 3. **Non-Gaming Offers Tab Flow**

#### Step 1: Component Initialization

```
NonGamingOffers Component → useEffect() → fetchOffers()
```

#### Step 2: API Call

```javascript
// Frontend: rewards-admin/src/components/surveys-offers/NonGamingOffers.js
surveyAPIs.getBitLabNonGameOffers({
  type: "all" | "survey" | "cashback" | "magic_receipt" | "shopping",
  devices: ["ios", "android"](optional),
});
```

#### Step 3: API Client Request

```javascript
// Frontend: rewards-admin/src/data/surveys/surveyAPI.js
GET /api/admin/game-offers/non-game-offers/by-sdk/bitlabs
Headers: {
  Authorization: Bearer <admin_token>
}
Query Params: {
  type: 'all',
  devices: ['ios', 'android'] (optional)
}
```

#### Step 4: Backend Route Handler

```javascript
// Backend: jackson-app-server/routes/admin-game-offers.js
router.get("/non-game-offers/by-sdk/:sdk", adminAuth, async (req, res) => {
  // 1. Verify admin authentication (adminAuth middleware)
  // 2. Extract params: sdk = 'bitlabs'
  // 3. Extract query: type, devices
});
```

#### Step 5: Backend Processing

```javascript
// Backend: jackson-app-server/utils/bitlabs-non-games.js
bitlabsNonGames.getNonGameOffers({
  userId: "admin-preview",
  userProfile: {},
  type: "all" | "survey" | "cashback" | "magic_receipt" | "shopping",
  category: "all",
});
```

#### Step 6: BitLab API Calls (Backend)

The backend makes multiple parallel calls to BitLab API:

**For Surveys:**

```
GET https://api.bitlabs.ai/v2/client/surveys
Headers: {
  X-Api-Token: <BITLABS_API_TOKEN>
  X-User-Id: 'admin-preview'
}
```

**For Cashback:**

```
GET https://api.bitlabs.ai/v1/client/cashback/offers
Headers: {
  X-Api-Token: <BITLABS_API_TOKEN>
  X-User-Id: 'admin-preview'
}
```

**For Other Offers (Magic Receipts, Shopping):**

```
GET https://api.bitlabs.ai/v2/client/offers?is_game=false
Headers: {
  X-Api-Token: <BITLABS_API_TOKEN>
  X-User-Id: 'admin-preview'
}
```

#### Step 7: Data Normalization

```javascript
// Backend normalizes BitLab response to standard format
{
  success: true,
  offers: [...],           // All combined offers
  categorized: {
    surveys: [...],
    magicReceipts: [...],
    cashback: [...],
    shopping: [...],
    other: [...]
  },
  breakdown: {...},
  totalOffers: 150,
  estimatedEarnings: 50000
}
```

#### Step 8: Backend Response

```json
{
  "success": true,
  "data": [...],              // All offers array
  "categorized": {
    "surveys": [...],
    "magicReceipts": [...],
    "cashback": [...],
    "shopping": [...]
  },
  "breakdown": {...},
  "total": 150,
  "estimatedEarnings": 50000
}
```

#### Step 9: Frontend Display

```javascript
// Frontend receives response and maps to UI format
const mappedOffers = response.data.map((offer) => ({
  id: offer.id,
  title: offer.title,
  type: offer.type,
  category: offer.category,
  reward: offer.reward,
  icon: offer.icon,
  // ... other fields
}));

// Display in table with:
// - Filters (Type, Category)
// - Analytics cards (Total Offers, Total Reward, Total XP)
// - Export to CSV functionality
```

---

### 4. **BitLab Surveys Tab Flow**

#### Step 1: Component Initialization

```
BitLabSurveys Component → useEffect() → fetchSurveys()
```

#### Step 2: API Call

```javascript
// Frontend: rewards-admin/src/components/surveys-offers/BitLabSurveys.js
surveyAPIs.getBitLabNonGameOffers({
  type: 'survey',
  devices: ['ios'] (optional, based on platform filter)
})
```

#### Step 3-8: Same as Non-Gaming Offers (uses same admin route)

#### Step 9: Frontend Display

```javascript
// Frontend extracts only surveys from categorized response
const mappedSurveys = response.categorized.surveys.map((survey) => ({
  id: survey.id,
  title: survey.title,
  reward: survey.reward,
  estimatedTime: survey.estimatedTime,
  // ... other fields
}));

// Display in table with:
// - Platform filter (iOS, Android, Mobile)
// - Analytics cards (Total Surveys, Available, Total Reward, Total XP, Avg Time)
// - Export to CSV functionality
```

---

## 🔐 Authentication Flow

### Admin Authentication

```
1. Admin logs in → Receives JWT token
2. Token stored in localStorage
3. apiClient automatically adds token to all requests:
   Authorization: Bearer <token>
4. Backend adminAuth middleware validates token
5. If valid → Process request
6. If invalid → Return 401/403 → Redirect to login
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Admin Frontend │
│  (Next.js)      │
└────────┬────────┘
         │
         │ GET /api/admin/game-offers/non-game-offers/by-sdk/bitlabs
         │ Headers: { Authorization: Bearer <token> }
         │ Query: { type: 'all', devices: [...] }
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express)      │
│  adminAuth      │
└────────┬────────┘
         │
         │ bitlabsNonGames.getNonGameOffers()
         │
         ▼
┌─────────────────┐
│  BitLab Service │
│  (bitlabs.service.js) │
└────────┬────────┘
         │
         │ Multiple parallel API calls:
         │ - GET /v2/client/surveys
         │ - GET /v1/client/cashback/offers
         │ - GET /v2/client/offers?is_game=false
         │
         ▼
┌─────────────────┐
│  BitLab API     │
│  (api.bitlabs.ai) │
└────────┬────────┘
         │
         │ Response: Raw BitLab offers
         │
         ▼
┌─────────────────┐
│  Normalization  │
│  (bitlabs-non-games.js) │
└────────┬────────┘
         │
         │ Normalized offers with standard format
         │
         ▼
┌─────────────────┐
│  Backend Response │
│  { success, data, categorized, breakdown } │
└────────┬────────┘
         │
         │ JSON Response
         │
         ▼
┌─────────────────┐
│  Frontend Display │
│  - Table with offers
│  - Filters
│  - Analytics
│  - Export CSV
└─────────────────┘
```

---

## 🎯 Key Features

### 1. **Type Filtering**

- **All**: Shows all non-gaming offers
- **Surveys**: Only survey offers
- **Cashback**: Only cashback offers
- **Magic Receipts**: Only magic receipt offers
- **Shopping**: Only shopping offers

### 2. **Platform Filtering** (BitLab Surveys tab)

- **All Platforms**: Shows all
- **iOS**: iPhone/iPad offers
- **Android**: Android offers
- **Mobile**: Both iOS and Android

### 3. **Analytics**

- Total offers/surveys count
- Total reward (coins)
- Total XP
- Average completion time (surveys)
- Breakdown by type

### 4. **Export Functionality**

- Export filtered offers to CSV
- Includes all offer details
- Downloadable file

### 5. **Health Check**

- Checks BitLab API connection status
- Shows green/red indicator
- Displays connection status message

---

## 🔧 Configuration

### Backend Configuration

```javascript
// config/config.js
BITLABS_BASE_URL: "https://api.bitlabs.ai";
BITLABS_API_TOKEN: "<your_token>";
BITLABS_SECRET_KEY: "<your_secret>";
```

### Frontend Configuration

```javascript
// .env.local or environment
NEXT_PUBLIC_API_BASE: "https://rewardsapi.hireagent.co/api";
```

---

## 📝 API Endpoints Summary

### Admin Endpoints (Used by Frontend)

- `GET /api/admin/game-offers/non-game-offers/by-sdk/bitlabs` - Get all non-gaming offers
- `GET /api/bitlabs/health` - Health check (public)

### Backend Internal Calls

- `GET https://api.bitlabs.ai/v2/client/surveys` - BitLab surveys
- `GET https://api.bitlabs.ai/v1/client/cashback/offers` - BitLab cashback
- `GET https://api.bitlabs.ai/v2/client/offers?is_game=false` - Other non-game offers

---

## 🐛 Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await surveyAPIs.getBitLabNonGameOffers(...);
  // Process response
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to load non-game offers');
  // Show error message to admin
}
```

### Backend Error Handling

```javascript
if (!result.success) {
  return res.status(500).json({
    success: false,
    message: result.error || "Failed to fetch non-game offers",
    data: [],
  });
}
```

---

## ✅ Testing the Flow

1. **Login as Admin**

   - Navigate to admin login page
   - Enter admin credentials
   - Verify JWT token is stored

2. **Navigate to Surveys & Non-Gaming Offers**

   - Click on "Surveys & Non-Gaming Offers" in sidebar
   - Verify page loads

3. **Test Non-Gaming Offers Tab**

   - Click "Non-Gaming Offers" tab
   - Verify offers load
   - Test type filters (All, Surveys, Cashback, etc.)
   - Verify analytics cards show correct data
   - Test export CSV functionality

4. **Test BitLab Surveys Tab**

   - Click "BitLab Surveys" tab
   - Verify surveys load
   - Test platform filter
   - Verify health status indicator

5. **Verify Health Check**
   - Check if green/red status indicator shows
   - Verify connection status message

---

## 📌 Notes

- Admin uses `userId: 'admin-preview'` for BitLab API calls (not a real user)
- All offers are fetched in real-time from BitLab API (no caching for admin view)
- Admin route requires `adminAuth` middleware (admin token)
- Regular user routes (`/api/non-game-offers`) use `protect` middleware (user token)
- Health check endpoint is public (no auth required)
