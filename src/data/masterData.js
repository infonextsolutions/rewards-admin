'use client';

import axios from 'axios';

const API_BASE = 'https://rewardsapi.hireagent.co';

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

export const masterDataAPI = {
  /**
   * Get all SDK providers
   */
  async getSdkProviders() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/master-data/sdk-providers');
      return response.data.data; // Returns array of {id, name}
    } catch (error) {
      console.error('Error fetching SDK providers:', error);
      throw error;
    }
  },

  /**
   * Get all XPTR values
   */
  async getXptrValues() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/master-data/xptr-values');
      return response.data.data; // Returns array of strings
    } catch (error) {
      console.error('Error fetching XPTR values:', error);
      throw error;
    }
  },

  /**
   * Get all tier access levels
   */
  async getTierAccess() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/master-data/tier-access');
      return response.data.data; // Returns array of {id, name}
    } catch (error) {
      console.error('Error fetching tier access:', error);
      throw error;
    }
  },

  /**
   * Get all countries
   */
  async getCountries() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/master-data/countries');
      return response.data.data; // Returns array of {code, name}
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  /**
   * Fetch all master data at once
   */
  async getAllMasterData() {
    try {
      const [sdkProviders, xptrValues, tierAccess, countries] = await Promise.all([
        this.getSdkProviders(),
        this.getXptrValues(),
        this.getTierAccess(),
        this.getCountries()
      ]);

      return {
        sdkProviders,
        xptrValues,
        tierAccess,
        countries
      };
    } catch (error) {
      console.error('Error fetching all master data:', error);
      throw error;
    }
  }
};
