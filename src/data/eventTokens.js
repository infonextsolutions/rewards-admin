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
      if (params.unique !== undefined && params.unique !== null) {
        queryParams.append("unique", params.unique.toString());
      }
      if (params.environment) queryParams.append("environment", params.environment);
      if (params.isRevenueEvent !== undefined && params.isRevenueEvent !== null) {
        queryParams.append("isRevenueEvent", params.isRevenueEvent.toString());
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

  /**
   * Update an event token
   * @param {string} id - Event token ID
   * @param {Object} eventData - Updated event token data
   */
  async updateEventToken(id, eventData) {
    try {
      const response = await apiClient.put(`/admin/adjust-events/${id}`, eventData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Event token updated successfully",
      };
    } catch (error) {
      console.error("Error updating event token:", error);
      throw error;
    }
  },

  /**
   * Delete an event token
   * @param {string} id - Event token ID
   */
  async deleteEventToken(id) {
    try {
      const response = await apiClient.delete(`/admin/adjust-events/${id}`);
      return {
        success: true,
        message: response.data.message || "Event token deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting event token:", error);
      throw error;
    }
  },

  /**
   * Get analytics for an event token
   * @param {string} token - Event token
   * @param {Object} params - Analytics parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string} params.type - Analytics type: 'complete', 'events', 'installs', 'revenue', 'devices'
   */
  async getTokenAnalytics(token, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.type) queryParams.append("type", params.type);

      const response = await apiClient.get(
        `/admin/adjust-events/${token}/analytics?${queryParams.toString()}`
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching token analytics:", error);
      throw error;
    }
  },
};

