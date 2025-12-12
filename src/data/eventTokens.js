"use client";

import apiClient from "../lib/apiClient";

export const eventTokensAPI = {
  /**
   * List all event tokens with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {boolean} params.isS2S - Filter S2S events
   * @param {boolean} params.isActive - Filter active events
   * @param {string} params.search - Search by name or token
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  async getEventTokens(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.category) queryParams.append("category", params.category);
      if (params.isS2S !== undefined && params.isS2S !== null) {
        queryParams.append("isS2S", params.isS2S.toString());
      }
      if (params.isActive !== undefined && params.isActive !== null) {
        queryParams.append("isActive", params.isActive.toString());
      }
      if (params.search) queryParams.append("search", params.search);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await apiClient.get(
        `/admin/adjust-events?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching event tokens:", error);
      throw error;
    }
  },

  /**
   * List S2S events only
   */
  async getS2SEvents() {
    try {
      const response = await apiClient.get("/admin/adjust-events/s2s/list");
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching S2S events:", error);
      throw error;
    }
  },

  /**
   * Get list of all categories with counts
   */
  async getCategories() {
    try {
      const response = await apiClient.get(
        "/admin/adjust-events/categories/list"
      );
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Create a new event token
   * @param {Object} eventData - Event token data
   * @param {string} eventData.token - Event token (required)
   * @param {string} eventData.name - Event name (required)
   * @param {boolean} eventData.unique - Unique flag (default: false)
   * @param {string} eventData.category - Event category (optional)
   * @param {boolean} eventData.isS2S - Is S2S event (optional)
   * @param {string} eventData.description - Description (optional)
   * @param {Object} eventData.metadata - Additional metadata (optional)
   */
  async createEventToken(eventData) {
    try {
      const response = await apiClient.post(
        "/admin/adjust-events",
        eventData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Event token created successfully",
      };
    } catch (error) {
      console.error("Error creating event token:", error);
      throw error;
    }
  },

  /**
   * Bulk import event tokens
   * @param {Array} events - Array of event objects [{token, name, unique}, ...]
   */
  async bulkImportEventTokens(events) {
    try {
      const response = await apiClient.post("/admin/adjust-events/bulk", {
        events,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Event tokens imported successfully",
      };
    } catch (error) {
      console.error("Error bulk importing event tokens:", error);
      throw error;
    }
  },
};

