'use client';

import apiClient from '../lib/apiClient';

export const displayRulesAPI = {
  /**
   * Get all display rules
   */
  async getDisplayRules() {
    try {
      const response = await apiClient.get('/admin/game-offers/display-rules');

      // Transform API response to frontend format
      const transformedRules = (response.data.data || []).map(rule => {
        // Format milestones from API format (first_time_user) to display format (First Time User)
        const formatMilestone = (milestone) => {
          if (!milestone) return 'N/A';
          return milestone
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };

        // Handle userMilestones as array (new model) or userMilestone as string (old model)
        const milestones = rule.userMilestones || (rule.userMilestone ? [rule.userMilestone] : []);
        const formattedMilestones = milestones.map(formatMilestone);
        const formattedMilestone = formattedMilestones.join(', ') || 'N/A';

        // Build conditions array
        const conditions = [
          `User milestones: ${formattedMilestones.join(', ')}`,
          ...(rule.xpTier ? [`XP Tier: ${rule.xpTier?.tierName || rule.xpTier}`] : []),
          ...(rule.membershipTier ? [`Membership Tier: ${rule.membershipTier}`] : []),
          ...(rule.segmentOverrides?.map(override =>
            `${override.type.charAt(0).toUpperCase() + override.type.slice(1)}: ${override.value} → ${override.maxGamesToShow} games`
          ) || [])
        ];

        return {
          id: rule._id,
          name: rule.metadata?.description || rule.ruleName || `${formattedMilestones[0] || 'Display'} Rule`,
          milestone: formattedMilestone,
          milestones: formattedMilestones,
          description: rule.metadata?.notes || `Display rule for ${formattedMilestones.join(', ').toLowerCase()} users`,
          maxGames: rule.maxGamesToShow,
          conditions: conditions,
          enabled: rule.isEnabled,
          priority: rule.metadata?.priority || rule.order || 1,
          targetSegment: rule.targetSegment || rule.metadata?.targetSegment || (rule.segmentOverrides?.length > 0
            ? `${rule.segmentOverrides.length} segment override(s)`
            : 'All Users'),
          appliedCount: 0, // Not in API
          conversionRate: 'N/A', // Not in API
          lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
          // Handle populated user object or string/ObjectId
          createdBy: rule.createdBy && typeof rule.createdBy === 'object' 
            ? (rule.createdBy.email || `${rule.createdBy.firstName || ''} ${rule.createdBy.lastName || ''}`.trim() || rule.createdBy._id?.toString() || 'N/A')
            : (rule.createdBy || 'N/A'),
          createdAt: rule.createdAt,
          // Preserve populated user object if available
          createdByUser: rule.createdBy && typeof rule.createdBy === 'object' ? rule.createdBy : null,
          // Additional fields for edit
          userMilestones: rule.userMilestones || [],
          userMilestone: rule.userMilestone || (milestones.length > 0 ? milestones[0] : null), // For backward compatibility
          xpTier: rule.xpTier,
          membershipTier: rule.membershipTier,
          segmentOverrides: rule.segmentOverrides || [],
          gameCountLimits: rule.gameCountLimits || null,
          metadata: rule.metadata || {},
          order: rule.order,
          ruleName: rule.ruleName
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
      // Handle userMilestones as array (new format) or convert from old format
      let userMilestones = [];
      if (ruleData.userMilestones && Array.isArray(ruleData.userMilestones)) {
        userMilestones = ruleData.userMilestones;
      } else if (ruleData.userMilestone) {
        userMilestones = [ruleData.userMilestone];
      } else if (ruleData.milestone) {
        // Convert display format to API format
        const milestone = ruleData.milestone.toLowerCase().replace(/ /g, '_');
        userMilestones = [milestone];
      } else {
        // Default to first_time_user
        userMilestones = ['first_time_user'];
      }

      const apiPayload = {
        ruleName: ruleData.ruleName || ruleData.name || `Display Rule ${Date.now()}`,
        userMilestones: userMilestones,
        maxGamesToShow: ruleData.maxGames || ruleData.maxGamesToShow || 5,
        segmentOverrides: ruleData.segmentOverrides || [],
        isEnabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
        order: ruleData.order || ruleData.priority || ruleData.metadata?.priority || 1,
        xpTier: ruleData.xpTier || null,
        membershipTier: ruleData.membershipTier || null,
        // Send targetSegment as top-level field
        targetSegment: ruleData.targetSegment || ruleData.metadata?.targetSegment || null,
        // Include gameCountLimits if provided (send even if all values are null)
        gameCountLimits: ruleData.gameCountLimits || {
          xpTierLimits: {
            junior: null,
            mid: null,
            senior: null
          },
          membershipTierLimits: {
            bronze: null,
            gold: null,
            platinum: null,
            free: null
          },
          newUsersLimit: null
        },
        metadata: {
          description: ruleData.name || ruleData.metadata?.description || '',
          notes: ruleData.description || ruleData.metadata?.notes || '',
          priority: ruleData.priority || ruleData.metadata?.priority || ruleData.order || 1,
          // Also store targetSegment in metadata for backward compatibility
          targetSegment: ruleData.targetSegment || ruleData.metadata?.targetSegment || null
        }
      };

      const response = await apiClient.post('/admin/game-offers/display-rules', apiPayload);

      // Transform response back to frontend format
      const rule = response.data.data;
      
      // Format milestones
      const formatMilestone = (milestone) => {
        if (!milestone) return 'N/A';
        return milestone
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const milestones = rule.userMilestones || (rule.userMilestone ? [rule.userMilestone] : []);
      const formattedMilestones = milestones.map(formatMilestone);
      const formattedMilestone = formattedMilestones.join(', ') || 'N/A';

      const conditions = [
        `User milestones: ${formattedMilestones.join(', ')}`,
        ...(rule.xpTier ? [`XP Tier: ${rule.xpTier?.tierName || rule.xpTier}`] : []),
        ...(rule.membershipTier ? [`Membership Tier: ${rule.membershipTier}`] : []),
        ...(rule.segmentOverrides?.map(override =>
          `${override.type.charAt(0).toUpperCase() + override.type.slice(1)}: ${override.value} → ${override.maxGamesToShow} games`
        ) || [])
      ];

      return {
        id: rule._id,
        name: rule.metadata?.description || rule.ruleName || `${formattedMilestones[0] || 'Display'} Rule`,
        milestone: formattedMilestone,
        milestones: formattedMilestones,
        description: rule.metadata?.notes || '',
        maxGames: rule.maxGamesToShow,
        conditions: conditions,
        enabled: rule.isEnabled,
        priority: rule.metadata?.priority || rule.order || 1,
        targetSegment: rule.targetSegment || rule.metadata?.targetSegment || (rule.segmentOverrides?.length > 0
            ? `${rule.segmentOverrides.length} segment override(s)`
            : 'All Users'),
        appliedCount: 0,
        conversionRate: 'N/A',
        lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
        createdBy: rule.createdBy || 'N/A',
        createdAt: rule.createdAt,
        userMilestones: rule.userMilestones || [],
        userMilestone: rule.userMilestone || (milestones.length > 0 ? milestones[0] : null),
        xpTier: rule.xpTier,
        membershipTier: rule.membershipTier,
        segmentOverrides: rule.segmentOverrides || [],
        metadata: rule.metadata || {},
        order: rule.order,
        ruleName: rule.ruleName
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

      if (ruleData.ruleName !== undefined) apiPayload.ruleName = ruleData.ruleName;
      if (ruleData.maxGames !== undefined) apiPayload.maxGamesToShow = ruleData.maxGames;
      if (ruleData.segmentOverrides !== undefined) apiPayload.segmentOverrides = ruleData.segmentOverrides;
      if (ruleData.enabled !== undefined) apiPayload.isEnabled = ruleData.enabled;
      if (ruleData.xpTier !== undefined) apiPayload.xpTier = ruleData.xpTier;
      if (ruleData.membershipTier !== undefined) apiPayload.membershipTier = ruleData.membershipTier;
      // Update targetSegment as top-level field
      if (ruleData.targetSegment !== undefined) apiPayload.targetSegment = ruleData.targetSegment;
      // Include gameCountLimits if provided (always send it, even if all values are null)
      if (ruleData.gameCountLimits !== undefined) {
        apiPayload.gameCountLimits = ruleData.gameCountLimits;
      }
      
      // Handle userMilestones update
      if (ruleData.userMilestones !== undefined) {
        apiPayload.userMilestones = ruleData.userMilestones;
      } else if (ruleData.userMilestone !== undefined) {
        apiPayload.userMilestones = [ruleData.userMilestone];
      }

      // Update order/priority if provided
      if (ruleData.order !== undefined) apiPayload.order = ruleData.order;
      if (ruleData.priority !== undefined) {
        apiPayload.order = ruleData.priority;
      }

      // Update metadata if provided
      if (ruleData.name || ruleData.description || ruleData.priority !== undefined || ruleData.targetSegment !== undefined) {
        apiPayload.metadata = {};
        if (ruleData.name) apiPayload.metadata.description = ruleData.name;
        if (ruleData.description) apiPayload.metadata.notes = ruleData.description;
        if (ruleData.priority !== undefined) {
          apiPayload.metadata.priority = ruleData.priority;
          apiPayload.order = ruleData.priority; // Also update order
        }
        if (ruleData.targetSegment !== undefined) apiPayload.metadata.targetSegment = ruleData.targetSegment;
      }

      const response = await apiClient.put(`/admin/game-offers/display-rules/${ruleId}`, apiPayload);

      // Transform response back to frontend format
      const rule = response.data.data;
      
      // Format milestones
      const formatMilestone = (milestone) => {
        if (!milestone) return 'N/A';
        return milestone
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const milestones = rule.userMilestones || (rule.userMilestone ? [rule.userMilestone] : []);
      const formattedMilestones = milestones.map(formatMilestone);
      const formattedMilestone = formattedMilestones.join(', ') || 'N/A';

      const conditions = [
        `User milestones: ${formattedMilestones.join(', ')}`,
        ...(rule.xpTier ? [`XP Tier: ${rule.xpTier?.tierName || rule.xpTier}`] : []),
        ...(rule.membershipTier ? [`Membership Tier: ${rule.membershipTier}`] : []),
        ...(rule.segmentOverrides?.map(override =>
          `${override.type.charAt(0).toUpperCase() + override.type.slice(1)}: ${override.value} → ${override.maxGamesToShow} games`
        ) || [])
      ];

      return {
        id: rule._id,
        name: rule.metadata?.description || rule.ruleName || `${formattedMilestones[0] || 'Display'} Rule`,
        milestone: formattedMilestone,
        milestones: formattedMilestones,
        description: rule.metadata?.notes || '',
        maxGames: rule.maxGamesToShow,
        conditions: conditions,
        enabled: rule.isEnabled,
        priority: rule.metadata?.priority || rule.order || 1,
        targetSegment: rule.targetSegment || rule.metadata?.targetSegment || (rule.segmentOverrides?.length > 0
            ? `${rule.segmentOverrides.length} segment override(s)`
            : 'All Users'),
        appliedCount: 0,
        conversionRate: 'N/A',
        lastModified: new Date(rule.updatedAt).toISOString().split('T')[0],
        createdBy: rule.createdBy || 'N/A',
        createdAt: rule.createdAt,
        userMilestones: rule.userMilestones || [],
        userMilestone: rule.userMilestone || (milestones.length > 0 ? milestones[0] : null),
        xpTier: rule.xpTier,
        membershipTier: rule.membershipTier,
        segmentOverrides: rule.segmentOverrides || [],
        gameCountLimits: rule.gameCountLimits || null,
        metadata: rule.metadata || {},
        order: rule.order,
        ruleName: rule.ruleName
      };
    } catch (error) {
      console.error('Error updating display rule:', error);
      throw error;
    }
  },

  /**
   * Delete display rule
   */
  async deleteDisplayRule(ruleId) {
    try {
      const response = await apiClient.delete(`/admin/game-offers/display-rules/${ruleId}?confirm=true`);
      return response.data;
    } catch (error) {
      console.error('Error deleting display rule:', error);
      throw error;
    }
  }
};
