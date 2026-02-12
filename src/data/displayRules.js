"use client";

import apiClient from "../lib/apiClient";

// Helper function to format milestone string (first_time_user -> First Time User)
const formatMilestone = (milestone) => {
  if (!milestone || typeof milestone !== "string") return "";
  return milestone
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to format milestones array
const formatMilestones = (milestones) => {
  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    return "All Users";
  }
  return milestones.map(formatMilestone).join(", ");
};

export const displayRulesAPI = {
  /**
   * Get all display rules
   */
  async getDisplayRules() {
    try {
      const response = await apiClient.get("/admin/game-offers/display-rules");

      // Transform API response to frontend format
      const transformedRules = response.data.data.map((rule) => {
        // Handle userMilestones as array (API returns plural)
        let userMilestones = [];
        if (rule.userMilestones && Array.isArray(rule.userMilestones)) {
          userMilestones = rule.userMilestones;
        } else if (rule.userMilestone) {
          userMilestones = [rule.userMilestone];
        }

        // Format milestones for display
        const formattedMilestones = formatMilestones(userMilestones);
        const firstMilestone =
          userMilestones.length > 0
            ? formatMilestone(userMilestones[0])
            : "All Users";

        // Use targetSegment from API if available, otherwise generate from milestones
        const targetSegment =
          rule.targetSegment || formattedMilestones || "All Users";

        return {
          id: rule._id,
          name:
            rule.metadata?.description ||
            rule.ruleName ||
            `${firstMilestone} Rule`,
          milestone: formattedMilestones,
          description:
            rule.metadata?.notes ||
            `Display rule for ${formattedMilestones.toLowerCase()} users`,
          maxGames: rule.maxGamesToShow,
          conditions: [
            ...(userMilestones.length > 0
              ? [`User milestones: ${formattedMilestones}`]
              : []),
            ...(rule.segmentOverrides?.map(
              (override) =>
                `${
                  override.type.charAt(0).toUpperCase() + override.type.slice(1)
                }: ${override.value} → ${override.maxGamesToShow} games`
            ) || []),
          ],
          enabled: rule.isEnabled,
          priority: rule.metadata?.priority || rule.order || 1,
          targetSegment: targetSegment,
          appliedCount: 0, // Not in API
          conversionRate: "N/A", // Not in API
          lastModified: new Date(rule.updatedAt).toISOString().split("T")[0],
          createdBy: rule.createdBy || "N/A",
          createdAt: rule.createdAt,
          // Additional fields for edit
          userMilestones: userMilestones,
          userMilestone: userMilestones[0] || null, // Keep for backward compatibility
          segmentOverrides: rule.segmentOverrides || [],
          metadata: rule.metadata || {},
          order: rule.order,
          xpTier: rule.xpTier || null,
          membershipTier: rule.membershipTier || null,
          gameCountLimits: rule.gameCountLimits || null,
        };
      });

      return transformedRules;
    } catch (error) {
      console.error("Error fetching display rules:", error);
      throw error;
    }
  },

  /**
   * Create new display rule
   */
  async createDisplayRule(ruleData) {
    try {
      // Transform frontend data to API format
      // Handle both userMilestones (array) and userMilestone (string) for backward compatibility
      let userMilestones = ruleData.userMilestones;
      if (!userMilestones && ruleData.userMilestone) {
        userMilestones = [ruleData.userMilestone];
      }
      if (!userMilestones || userMilestones.length === 0) {
        // Default to first_time_user if nothing provided
        userMilestones = ["first_time_user"];
      }

      const metadata = {
        description: ruleData.name || ruleData.metadata?.description || "",
        notes: ruleData.description || ruleData.metadata?.notes || "",
        priority: ruleData.priority || ruleData.metadata?.priority || 1,
      };
      if (ruleData.targetSegment) {
        metadata.targetSegment = ruleData.targetSegment;
      }
      const apiPayload = {
        ruleName: ruleData.ruleName || ruleData.name || `Rule ${Date.now()}`,
        userMilestones: userMilestones,
        maxGamesToShow: ruleData.maxGames || 5,
        segmentOverrides: ruleData.segmentOverrides || [],
        isEnabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
        order: ruleData.order || ruleData.priority || 1,
        xpTier: ruleData.xpTier || null,
        membershipTier: ruleData.membershipTier || null,
        gameCountLimits: ruleData.gameCountLimits || null,
        metadata,
      };
      if (ruleData.targetSegment) {
        apiPayload.targetSegment = ruleData.targetSegment;
      }

      const response = await apiClient.post(
        "/admin/game-offers/display-rules",
        apiPayload
      );

      // Transform response back to frontend format
      const rule = response.data.data;
      const userMilestonesArray =
        rule.userMilestones || (rule.userMilestone ? [rule.userMilestone] : []);
      const formattedMilestones = formatMilestones(userMilestonesArray);
      const targetSegment =
        rule.targetSegment || formattedMilestones || "All Users";

      return {
        id: rule._id,
        name:
          rule.metadata?.description ||
          rule.ruleName ||
          `${formattedMilestones} Rule`,
        milestone: formattedMilestones,
        description: rule.metadata?.notes || "",
        maxGames: rule.maxGamesToShow,
        conditions: [
          ...(userMilestonesArray.length > 0
            ? [`User milestones: ${formattedMilestones}`]
            : []),
          ...(rule.segmentOverrides?.map(
            (override) =>
              `${
                override.type.charAt(0).toUpperCase() + override.type.slice(1)
              }: ${override.value} → ${override.maxGamesToShow} games`
          ) || []),
        ],
        enabled: rule.isEnabled,
        priority: rule.metadata?.priority || rule.order || 1,
        targetSegment: targetSegment,
        appliedCount: 0,
        conversionRate: "N/A",
        lastModified: new Date(rule.updatedAt).toISOString().split("T")[0],
        createdBy: rule.createdBy || "N/A",
        createdAt: rule.createdAt,
        userMilestones: userMilestonesArray,
        userMilestone: userMilestonesArray[0] || null, // Keep for backward compatibility
        segmentOverrides: rule.segmentOverrides || [],
        metadata: rule.metadata || {},
        order: rule.order,
        xpTier: rule.xpTier || null,
        membershipTier: rule.membershipTier || null,
        gameCountLimits: rule.gameCountLimits || null,
      };
    } catch (error) {
      console.error("Error creating display rule:", error);
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

      if (ruleData.maxGames !== undefined)
        apiPayload.maxGamesToShow = ruleData.maxGames;
      if (ruleData.segmentOverrides !== undefined)
        apiPayload.segmentOverrides = ruleData.segmentOverrides;
      if (ruleData.enabled !== undefined)
        apiPayload.isEnabled = ruleData.enabled;

      // Handle userMilestones update
      if (ruleData.userMilestones !== undefined) {
        apiPayload.userMilestones = ruleData.userMilestones;
      } else if (ruleData.userMilestone !== undefined) {
        // Backward compatibility: convert single milestone to array
        apiPayload.userMilestones = [ruleData.userMilestone];
      }

      if (ruleData.xpTier !== undefined) apiPayload.xpTier = ruleData.xpTier;
      if (ruleData.membershipTier !== undefined)
        apiPayload.membershipTier = ruleData.membershipTier;
      if (ruleData.gameCountLimits !== undefined)
        apiPayload.gameCountLimits = ruleData.gameCountLimits;
      if (ruleData.order !== undefined) apiPayload.order = ruleData.order;
      if (ruleData.ruleName !== undefined)
        apiPayload.ruleName = ruleData.ruleName;

      // Update targetSegment if provided (New Users, Engaged Users, or both)
      if (ruleData.targetSegment !== undefined && ruleData.targetSegment !== null) {
        apiPayload.targetSegment = ruleData.targetSegment;
      }

      // Update metadata if provided
      if (
        ruleData.name ||
        ruleData.description ||
        ruleData.priority !== undefined ||
        ruleData.targetSegment !== undefined
      ) {
        apiPayload.metadata = apiPayload.metadata || {};
        if (ruleData.name) apiPayload.metadata.description = ruleData.name;
        if (ruleData.description)
          apiPayload.metadata.notes = ruleData.description;
        if (ruleData.priority !== undefined)
          apiPayload.metadata.priority = ruleData.priority;
        if (ruleData.targetSegment !== undefined && ruleData.targetSegment !== null)
          apiPayload.metadata.targetSegment = ruleData.targetSegment;
      }

      const response = await apiClient.put(
        `/admin/game-offers/display-rules/${ruleId}`,
        apiPayload
      );

      // Transform response back to frontend format
      const rule = response.data.data;
      const userMilestonesArray =
        rule.userMilestones || (rule.userMilestone ? [rule.userMilestone] : []);
      const formattedMilestones = formatMilestones(userMilestonesArray);
      const targetSegment =
        rule.targetSegment || formattedMilestones || "All Users";

      return {
        id: rule._id,
        name:
          rule.metadata?.description ||
          rule.ruleName ||
          `${formattedMilestones} Rule`,
        milestone: formattedMilestones,
        description: rule.metadata?.notes || "",
        maxGames: rule.maxGamesToShow,
        conditions: [
          ...(userMilestonesArray.length > 0
            ? [`User milestones: ${formattedMilestones}`]
            : []),
          ...(rule.segmentOverrides?.map(
            (override) =>
              `${
                override.type.charAt(0).toUpperCase() + override.type.slice(1)
              }: ${override.value} → ${override.maxGamesToShow} games`
          ) || []),
        ],
        enabled: rule.isEnabled,
        priority: rule.metadata?.priority || rule.order || 1,
        targetSegment: targetSegment,
        appliedCount: 0,
        conversionRate: "N/A",
        lastModified: new Date(rule.updatedAt).toISOString().split("T")[0],
        createdBy: rule.createdBy || "N/A",
        createdAt: rule.createdAt,
        userMilestones: userMilestonesArray,
        userMilestone: userMilestonesArray[0] || null, // Keep for backward compatibility
        segmentOverrides: rule.segmentOverrides || [],
        metadata: rule.metadata || {},
        order: rule.order,
        xpTier: rule.xpTier || null,
        membershipTier: rule.membershipTier || null,
        gameCountLimits: rule.gameCountLimits || null,
      };
    } catch (error) {
      console.error("Error updating display rule:", error);
      throw error;
    }
  },

  /**
   * Delete display rule
   */
  async deleteDisplayRule(ruleId) {
    try {
      const response = await apiClient.delete(
        `/admin/game-offers/display-rules/${ruleId}?confirm=true`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting display rule:", error);
      throw error;
    }
  },
};
