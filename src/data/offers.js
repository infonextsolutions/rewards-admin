'use client';

import axios from 'axios';

const API_BASE =  'https://rewardsapi.hireagent.co';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const offersAPI = {
  /**
   * Create new offer
   */
  async createOffer(offerData) {
    try {
      // Transform frontend data to API format
      const apiPayload = {
        name: offerData.offerName,
        description: offerData.description || `Complete ${offerData.offerName} to earn rewards`,
        sdkProvider: offerData.sdkProvider || 'bitlabs',
        tierAccess: (offerData.tiers || []).map(tier => tier.toLowerCase()),
        countries: offerData.countries || offerData.segments?.country ? [offerData.segments.country] : [],
        expiryDate: offerData.endDate ? new Date(offerData.endDate).toISOString() : offerData.expiryDate,
        isAdSupported: offerData.adOffer === 'Ad-Based' || offerData.isAdSupported || false,
        xptrRule: offerData.xpTier || offerData.xptrRule || '',
        reward: {
          coins: offerData.rewardType === 'Coins' ? parseInt(offerData.rewardValue) || 0 : 0,
          xp: offerData.rewardType === 'XP' ? parseInt(offerData.rewardValue) || 0 : 0
        },
        metadata: {
          estimatedTimeMinutes: offerData.estimatedTime ? parseInt(offerData.estimatedTime) : 10,
          difficulty: offerData.difficulty ? offerData.difficulty.toLowerCase() : 'medium',
          category: offerData.category ? offerData.category.toLowerCase() : 'survey',
          imageUrl: offerData.imageUrl || '',
          deepLink: offerData.deepLink || ''
        }
      };

      const response = await apiClient.post('/api/admin/game-offers/offers', apiPayload);

      // Transform response back to frontend format
      const offer = response.data.data;
      const hasCoins = offer.reward?.coins > 0;
      const hasXP = offer.reward?.xp > 0;
      const rewardType = hasCoins ? 'Coins' : (hasXP ? 'XP' : 'Coins');
      const rewardValue = hasCoins ? offer.reward.coins : (hasXP ? offer.reward.xp : 0);

      return {
        id: offer._id,
        offerName: offer.name || 'Untitled Offer',
        sdkOffer: offer.sdkProvider || 'N/A',
        rewardType: rewardType,
        rewardValue: rewardValue,
        retentionRate: '0%',
        clickRate: '0%',
        installRate: '0%',
        roas: '0%',
        marketingChannel: 'N/A',
        campaign: 'N/A',
        status: offer.isActive ? 'Active' : 'Inactive',
        tiers: (offer.tierAccess || []).map(tier => tier.charAt(0).toUpperCase() + tier.slice(1)),
        expiryDate: offer.expiryDate || null,
        countries: offer.countries || [],
        sdkProvider: offer.sdkProvider || 'N/A',
        xpTier: offer.xptrRule || 'All',
        adOffer: offer.isAdSupported ? 'Ad-Based' : 'Non-Ad',
        // Preview modal compatible fields
        title: offer.name || 'Untitled Offer',
        description: offer.description || '',
        coinReward: offer.reward?.coins || 0,
        estimatedTime: offer.metadata?.estimatedTimeMinutes ? `${offer.metadata.estimatedTimeMinutes} min` : 'N/A',
        difficulty: offer.metadata?.difficulty ? offer.metadata.difficulty.charAt(0).toUpperCase() + offer.metadata.difficulty.slice(1) : 'Medium',
        category: offer.metadata?.category ? offer.metadata.category.charAt(0).toUpperCase() + offer.metadata.category.slice(1) : 'General',
        sdkSource: offer.sdkProvider || 'N/A'
      };
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  },

  /**
   * Update existing offer
   */
  async updateOffer(offerId, offerData) {
    try {
      // Transform frontend data to API format
      const apiPayload = {
        name: offerData.offerName,
        description: offerData.description || `Complete ${offerData.offerName} to earn rewards`,
        tierAccess: (offerData.tiers || []).map(tier => tier.toLowerCase()),
        countries: offerData.countries || offerData.segments?.country ? [offerData.segments.country] : [],
        expiryDate: offerData.endDate ? new Date(offerData.endDate).toISOString() : offerData.expiryDate,
        isActive: offerData.active !== undefined ? offerData.active : true,
        reward: {
          coins: offerData.rewardType === 'Coins' ? parseInt(offerData.rewardValue) || 0 : 0,
          xp: offerData.rewardType === 'XP' ? parseInt(offerData.rewardValue) || 0 : 0
        }
      };

      const response = await apiClient.put(`/api/admin/game-offers/offers/${offerId}`, apiPayload);

      // Transform response back to frontend format
      const offer = response.data.data;
      const hasCoins = offer.reward?.coins > 0;
      const hasXP = offer.reward?.xp > 0;
      const rewardType = hasCoins ? 'Coins' : (hasXP ? 'XP' : 'Coins');
      const rewardValue = hasCoins ? offer.reward.coins : (hasXP ? offer.reward.xp : 0);

      return {
        id: offer._id,
        offerName: offer.name || 'Untitled Offer',
        sdkOffer: offer.sdkProvider || 'N/A',
        rewardType: rewardType,
        rewardValue: rewardValue,
        retentionRate: '0%',
        clickRate: '0%',
        installRate: '0%',
        roas: '0%',
        marketingChannel: 'N/A',
        campaign: 'N/A',
        status: offer.isActive ? 'Active' : 'Inactive',
        tiers: (offer.tierAccess || []).map(tier => tier.charAt(0).toUpperCase() + tier.slice(1)),
        expiryDate: offer.expiryDate || null,
        countries: offer.countries || [],
        sdkProvider: offer.sdkProvider || 'N/A',
        xpTier: offer.xptrRule || 'All',
        adOffer: offer.isAdSupported ? 'Ad-Based' : 'Non-Ad',
        // Preview modal compatible fields
        title: offer.name || 'Untitled Offer',
        description: offer.description || '',
        coinReward: offer.reward?.coins || 0,
        estimatedTime: offer.metadata?.estimatedTimeMinutes ? `${offer.metadata.estimatedTimeMinutes} min` : 'N/A',
        difficulty: offer.metadata?.difficulty ? offer.metadata.difficulty.charAt(0).toUpperCase() + offer.metadata.difficulty.slice(1) : 'Medium',
        category: offer.metadata?.category ? offer.metadata.category.charAt(0).toUpperCase() + offer.metadata.category.slice(1) : 'General',
        sdkSource: offer.sdkProvider || 'N/A'
      };
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  },

  /**
   * Get single offer by ID
   */
  async getOfferById(offerId) {
    try {
      const response = await apiClient.get(`/api/admin/game-offers/offers/${offerId}`);

      // Transform response to frontend format
      const offer = response.data.data;
      const hasCoins = offer.reward?.coins > 0;
      const hasXP = offer.reward?.xp > 0;
      const rewardType = hasCoins ? 'Coins' : (hasXP ? 'XP' : 'Coins');
      const rewardValue = hasCoins ? offer.reward.coins : (hasXP ? offer.reward.xp : 0);

      return {
        id: offer._id,
        offerName: offer.name || 'Untitled Offer',
        sdkOffer: offer.sdkProvider || 'N/A',
        rewardType: rewardType,
        rewardValue: rewardValue,
        retentionRate: '0%',
        clickRate: '0%',
        installRate: '0%',
        roas: '0%',
        marketingChannel: 'N/A',
        campaign: 'N/A',
        status: offer.isActive ? 'Active' : 'Inactive',
        tiers: (offer.tierAccess || []).map(tier => tier.charAt(0).toUpperCase() + tier.slice(1)),
        expiryDate: offer.expiryDate || null,
        countries: offer.countries || [],
        sdkProvider: offer.sdkProvider || 'N/A',
        xpTier: offer.xptrRule || 'All',
        adOffer: offer.isAdSupported ? 'Ad-Based' : 'Non-Ad',
        // Preview modal compatible fields
        title: offer.name || 'Untitled Offer',
        description: offer.description || '',
        coinReward: offer.reward?.coins || 0,
        estimatedTime: offer.metadata?.estimatedTimeMinutes ? `${offer.metadata.estimatedTimeMinutes} min` : 'N/A',
        difficulty: offer.metadata?.difficulty ? offer.metadata.difficulty.charAt(0).toUpperCase() + offer.metadata.difficulty.slice(1) : 'Medium',
        category: offer.metadata?.category ? offer.metadata.category.charAt(0).toUpperCase() + offer.metadata.category.slice(1) : 'General',
        sdkSource: offer.sdkProvider || 'N/A',
        // Additional metadata for editing
        metadata: offer.metadata || {},
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        createdBy: offer.createdBy,
        updatedBy: offer.updatedBy
      };
    } catch (error) {
      console.error('Error fetching offer:', error);
      throw error;
    }
  },

  /**
   * Delete offer
   */
  async deleteOffer(offerId) {
    try {
      const response = await apiClient.delete(`/api/admin/game-offers/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  },

  /**
   * Get all offers with pagination and filters
   */
  async getOffers(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 10);

      // Add filter params - only add if they have actual values
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }
      if (params.country && params.country.trim() !== '') {
        queryParams.append('country', params.country);
      }
      if (params.sdkProvider && params.sdkProvider.trim() !== '') {
        queryParams.append('sdkProvider', params.sdkProvider);
      }
      if (params.xptr && params.xptr.trim() !== '') {
        queryParams.append('xptr', params.xptr);
      }
      if (params.adOffer && params.adOffer.trim() !== '') {
        queryParams.append('adOffer', params.adOffer);
      }
      if (params.status && params.status !== 'all' && params.status.trim() !== '') {
        queryParams.append('status', params.status);
      }

      const response = await apiClient.get(`/api/admin/game-offers/offers?${queryParams.toString()}`);

      // Transform API response to frontend format
      const transformedOffers = response.data.data.offers.map(offer => {
        // Determine reward type and value
        const hasCoins = offer.reward?.coins > 0;
        const hasXP = offer.reward?.xp > 0;
        const rewardType = hasCoins ? 'Coins' : (hasXP ? 'XP' : 'Coins');
        const rewardValue = hasCoins ? offer.reward.coins : (hasXP ? offer.reward.xp : 0);

        return {
          id: offer._id,
          offerName: offer.name || 'Untitled Offer',
          sdkOffer: offer.sdkProvider || 'N/A',
          rewardType: rewardType,
          rewardValue: rewardValue,
          retentionRate: '0%', // Not in API
          clickRate: '0%', // Not in API
          installRate: '0%', // Not in API
          roas: '0%', // Not in API
          marketingChannel: 'N/A', // Not in API
          campaign: 'N/A', // Not in API
          status: offer.isActive ? 'Active' : 'Inactive',
          tiers: (offer.tierAccess || []).map(tier => tier.charAt(0).toUpperCase() + tier.slice(1)),
          expiryDate: offer.expiryDate || null,
          countries: offer.countries || [],
          sdkProvider: offer.sdkProvider || 'N/A',
          xpTier: offer.xptrRule || 'All',
          adOffer: offer.isAdSupported ? 'Ad-Based' : 'Non-Ad',
          // Preview modal compatible fields
          title: offer.name || 'Untitled Offer',
          description: offer.description || '',
          coinReward: offer.reward?.coins || 0,
          estimatedTime: offer.metadata?.estimatedTimeMinutes ? `${offer.metadata.estimatedTimeMinutes} min` : 'N/A',
          difficulty: offer.metadata?.difficulty ? offer.metadata.difficulty.charAt(0).toUpperCase() + offer.metadata.difficulty.slice(1) : 'Medium',
          category: offer.metadata?.category ? offer.metadata.category.charAt(0).toUpperCase() + offer.metadata.category.slice(1) : 'General',
          sdkSource: offer.sdkProvider || 'N/A'
        };
      });

      return {
        offers: transformedOffers,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }
};
