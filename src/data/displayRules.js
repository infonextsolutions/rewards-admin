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

export const displayRulesAPI = {
  /**
   * Get all display rules
   */
  async getDisplayRules() {
    try {
      const response = await apiClient.get('/api/admin/game-offers/display-rules');

      // Transform API response to frontend format
      const transformedRules = response.data.data.map(rule => {
        // Format milestone from API format (first_game) to display format (First Game)
        const formattedMilestone = rule.userMilestone
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          id: rule._id,
          name: rule.metadata?.description || `${formattedMilestone} Rule`,
          milestone: formattedMilestone,
          description: rule.metadata?.notes || `Display rule for ${formattedMilestone.toLowerCase()} users`,
          maxGames: rule.maxGamesToShow,
          conditions: [
            `User milestone: ${formattedMilestone}`,
            ...(rule.segmentOverrides?.map(override =>
              `${override.type.charAt(0).toUpperCase() + override.type.slice(1)}: ${override.value} → ${override.maxGamesToShow} games`
            ) || [])
          ],
          enabled: rule.isEnabled,
          priority: rule.metadata?.priority || rule.order || 1,
          targetSegment: rule.segmentOverrides?.length > 0
            ? `${rule.segmentOverrides.length} segment override(s)`
            : 'All Users',
          appliedCount: 0, // Not in API
          conversionRate: 'N/A', // Not in API
          lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
          createdBy: rule.createdBy || 'N/A',
          createdAt: rule.createdAt,
          // Additional fields for edit
          userMilestone: rule.userMilestone,
          segmentOverrides: rule.segmentOverrides || [],
          metadata: rule.metadata || {},
          order: rule.order
        };
      });

      return transformedRules;
    } catch (error) {
      console.error('Error fetching display rules:', error);
      throw error;
    }
  },

  /**
   * Create new display rule
   */
  async createDisplayRule(ruleData) {
    try {
      // Transform frontend data to API format
      const apiPayload = {
        userMilestone: ruleData.userMilestone || ruleData.milestone?.toLowerCase().replace(/ /g, '_') || 'first_game',
        maxGamesToShow: ruleData.maxGames || 5,
        segmentOverrides: ruleData.segmentOverrides || [],
        isEnabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
        order: ruleData.order || ruleData.priority || 1,
        metadata: {
          description: ruleData.name || ruleData.metadata?.description || '',
          notes: ruleData.description || ruleData.metadata?.notes || '',
          priority: ruleData.priority || ruleData.metadata?.priority || 1
        }
      };

      const response = await apiClient.post('/api/admin/game-offers/display-rules', apiPayload);

      // Transform response back to frontend format
      const rule = response.data.data;
      const formattedMilestone = rule.userMilestone
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        id: rule._id,
        name: rule.metadata?.description || `${formattedMilestone} Rule`,
        milestone: formattedMilestone,
        description: rule.metadata?.notes || '',
        maxGames: rule.maxGamesToShow,
        conditions: [
          `User milestone: ${formattedMilestone}`,
          ...(rule.segmentOverrides?.map(override =>
            `${override.type.charAt(0).toUpperCase() + override.type.slice(1)}: ${override.value} → ${override.maxGamesToShow} games`
          ) || [])
        ],
        enabled: rule.isEnabled,
        priority: rule.metadata?.priority || rule.order || 1,
        targetSegment: rule.segmentOverrides?.length > 0
          ? `${rule.segmentOverrides.length} segment override(s)`
          : 'All Users',
        appliedCount: 0,
        conversionRate: 'N/A',
        lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
        createdBy: rule.createdBy || 'N/A',
        createdAt: rule.createdAt,
        userMilestone: rule.userMilestone,
        segmentOverrides: rule.segmentOverrides || [],
        metadata: rule.metadata || {},
        order: rule.order
      };
    } catch (error) {
      console.error('Error creating display rule:', error);
      throw error;
    }
  },

  /**
   * Update display rule
   */
  async updateDisplayRule(ruleId, ruleData) {
    try {
      // Transform frontend data to API format (only include updatable fields)
      const apiPayload = {};

      if (ruleData.maxGames !== undefined) apiPayload.maxGamesToShow = ruleData.maxGames;
      if (ruleData.segmentOverrides !== undefined) apiPayload.segmentOverrides = ruleData.segmentOverrides;
      if (ruleData.enabled !== undefined) apiPayload.isEnabled = ruleData.enabled;

      // Update metadata if provided
      if (ruleData.name || ruleData.description || ruleData.priority !== undefined) {
        apiPayload.metadata = {};
        if (ruleData.name) apiPayload.metadata.description = ruleData.name;
        if (ruleData.description) apiPayload.metadata.notes = ruleData.description;
        if (ruleData.priority !== undefined) apiPayload.metadata.priority = ruleData.priority;
      }

      const response = await apiClient.put(`/api/admin/game-offers/display-rules/${ruleId}`, apiPayload);

      // Transform response back to frontend format
      const rule = response.data.data;
      const formattedMilestone = rule.userMilestone
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        id: rule._id,
        name: rule.metadata?.description || `${formattedMilestone} Rule`,
        milestone: formattedMilestone,
        description: rule.metadata?.notes || '',
        maxGames: rule.maxGamesToShow,
        conditions: [
          `User milestone: ${formattedMilestone}`,
          ...(rule.segmentOverrides?.map(override =>
            `${override.type.charAt(0).toUpperCase() + override.type.slice(1)}: ${override.value} → ${override.maxGamesToShow} games`
          ) || [])
        ],
        enabled: rule.isEnabled,
        priority: rule.metadata?.priority || rule.order || 1,
        targetSegment: rule.segmentOverrides?.length > 0
          ? `${rule.segmentOverrides.length} segment override(s)`
          : 'All Users',
        appliedCount: 0,
        conversionRate: 'N/A',
        lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
        createdBy: rule.createdBy || 'N/A',
        createdAt: rule.createdAt,
        userMilestone: rule.userMilestone,
        segmentOverrides: rule.segmentOverrides || [],
        metadata: rule.metadata || {},
        order: rule.order
      };
    } catch (error) {
      console.error('Error updating display rule:', error);
      throw error;
    }
  }
};
