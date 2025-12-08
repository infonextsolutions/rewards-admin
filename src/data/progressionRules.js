"use client";

import apiClient from "../lib/apiClient";

export const progressionRulesAPI = {
  /**
   * Get all progression rules
   */
  async getProgressionRules(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const response = await apiClient.get(
        `/admin/game-offers/progression-rules?${queryParams.toString()}`
      );

      // Transform API response to frontend format
      const transformedRules = (response.data.data || []).map((rule) => {
        // Format createdBy
        let createdByDisplay = "N/A";
        if (rule.createdBy) {
          if (typeof rule.createdBy === "object") {
            createdByDisplay =
              rule.createdBy.email ||
              `${rule.createdBy.firstName || ""} ${
                rule.createdBy.lastName || ""
              }`.trim() ||
              "N/A";
          } else {
            createdByDisplay = rule.createdBy;
          }
        }

        // Return rule with all fields from the new user-based format
        return {
          _id: rule._id,
          ruleName: rule.ruleName,
          userMilestones: rule.userMilestones || [],
          xpTier: rule.xpTier,
          membershipTier: rule.membershipTier,
          priority: rule.priority || 0,
          firstBatchSize: rule.firstBatchSize,
          nextBatchSize: rule.nextBatchSize,
          maxBatches: rule.maxBatches,
          isActive: rule.isActive,
          createdBy: createdByDisplay,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
          createdByUser: rule.createdBy,
          updatedByUser: rule.updatedBy,
          // Legacy fields for backward compatibility (if needed)
          id: rule._id,
          enabled: rule.isActive,
        };
      });

      return {
        rules: transformedRules,
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: transformedRules.length,
          pages: 1,
        },
      };
    } catch (error) {
      console.error("Error fetching progression rules:", error);
      throw error;
    }
  },

  /**
   * Create new progression rule for a game
   */
  async createProgressionRule(gameId, ruleData) {
    try {
      // Use ruleData directly - it should already be in the correct format
      // Backend expects: minimumEventThreshold, postThresholdTasks, isActive
      const apiPayload = {
        minimumEventThreshold: ruleData.minimumEventThreshold || 5,
        postThresholdTasks: ruleData.postThresholdTasks || [],
        isActive: ruleData.isActive !== undefined ? ruleData.isActive : true,
      };

      console.log("Creating progression rule - API call:", {
        url: `/admin/game-offers/progression-rules/game/${gameId}`,
        payload: apiPayload,
        gameId,
      });

      const response = await apiClient.post(
        `/admin/game-offers/progression-rules/game/${gameId}`,
        apiPayload
      );

      console.log("Progression rule created successfully:", response.data);

      // Transform response back to frontend format
      const rule = response.data.data;
      const taskCount = rule.postThresholdTasks?.length || 0;

      return {
        id: rule._id || rule.gameId,
        name:
          rule.gameTitle || `Progression Rule for ${rule.gameGameId || "Game"}`,
        description: `Threshold: ${rule.minimumEventThreshold} tasks, Post-threshold tasks: ${taskCount}`,
        gameId: rule.gameId,
        gameTitle: rule.gameTitle,
        gameGameId: rule.gameGameId,
        minimumEventThreshold: rule.minimumEventThreshold,
        minimumEventToUnlock: `${
          rule.minimumEventThreshold || 0
        } tasks required`,
        postThresholdTasks: rule.postThresholdTasks || [],
        taskCount: taskCount,
        enabled: rule.isActive,
        affectedUsers: 0,
        completionRate: "N/A",
        avgUnlockTime: "N/A",
        lastModified: (() => {
          try {
            if (rule.updatedAt) {
              const date = new Date(rule.updatedAt);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
              }
            }
          } catch (e) {
            console.warn("Invalid date for updatedAt:", rule.updatedAt);
          }
          return new Date().toISOString().split("T")[0];
        })(),
        createdBy: "N/A",
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
        isActive: rule.isActive,
      };
    } catch (error) {
      console.error("Error creating progression rule:", error);
      throw error;
    }
  },

  /**
   * Update existing progression rule for a game
   */
  async updateProgressionRule(gameId, ruleData) {
    try {
      // Use ruleData directly - it should already be in the correct format
      // Backend expects: minimumEventThreshold, postThresholdTasks, isActive
      const apiPayload = {
        minimumEventThreshold: ruleData.minimumEventThreshold || 5,
        postThresholdTasks: ruleData.postThresholdTasks || [],
        isActive: ruleData.isActive !== undefined ? ruleData.isActive : true,
      };

      const response = await apiClient.post(
        `/admin/game-offers/progression-rules/game/${gameId}`,
        apiPayload
      );

      // Transform response back to frontend format
      const rule = response.data.data;
      const taskCount = rule.postThresholdTasks?.length || 0;

      return {
        id: rule._id || rule.gameId,
        name:
          rule.gameTitle || `Progression Rule for ${rule.gameGameId || "Game"}`,
        description: `Threshold: ${rule.minimumEventThreshold} tasks, Post-threshold tasks: ${taskCount}`,
        gameId: rule.gameId,
        gameTitle: rule.gameTitle,
        gameGameId: rule.gameGameId,
        minimumEventThreshold: rule.minimumEventThreshold,
        minimumEventToUnlock: `${
          rule.minimumEventThreshold || 0
        } tasks required`,
        postThresholdTasks: rule.postThresholdTasks || [],
        taskCount: taskCount,
        enabled: rule.isActive,
        affectedUsers: 0,
        completionRate: "N/A",
        avgUnlockTime: "N/A",
        lastModified: (() => {
          try {
            if (rule.updatedAt) {
              const date = new Date(rule.updatedAt);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
              }
            }
          } catch (e) {
            console.warn("Invalid date for updatedAt:", rule.updatedAt);
          }
          return new Date().toISOString().split("T")[0];
        })(),
        createdBy: "N/A",
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
        isActive: rule.isActive,
      };
    } catch (error) {
      console.error("Error updating progression rule:", error);
      throw error;
    }
  },

  /**
   * Delete progression rule for a game
   */
  async deleteProgressionRule(gameId) {
    try {
      const response = await apiClient.delete(
        `/admin/game-offers/progression-rules/game/${gameId}?confirm=true`
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting progression rule:", error);
      throw error;
    }
  },
};
