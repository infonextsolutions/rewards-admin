// Survey & Non-Gaming Offers API module
import apiClient from "../../lib/apiClient";

const surveyAPIs = {
  // Mock success response
  mockSuccess: () => Promise.resolve({ success: true }),

  // Mock delay for realistic behavior
  mockDelay: (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Get SDK list with pagination
  async getSDKList({ page = 1, limit = 10 } = {}) {
    try {
      const response = await apiClient.get("/admin/surveys/sdk/list", {
        params: {
          page,
          limit,
          search: "",
          status: "all",
          category: "all",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get SDK list error:", error);
      throw error.response?.data || error;
    }
  },

  // Create new SDK
  async createSDK(sdkData) {
    try {
      const response = await apiClient.post("/admin/surveys/sdk", sdkData);
      return response.data;
    } catch (error) {
      console.error("Create SDK error:", error);
      throw error.response?.data || error;
    }
  },

  // Get SDK details by ID
  async getSDKDetails(sdkId) {
    try {
      const response = await apiClient.get(`/admin/surveys/sdk/${sdkId}`);
      return response.data;
    } catch (error) {
      console.error("Get SDK details error:", error);
      throw error.response?.data || error;
    }
  },

  // Update SDK configuration
  async updateSDKConfig(sdkId, configData) {
    try {
      const response = await apiClient.put(
        `/admin/surveys/sdk/${sdkId}/config`,
        configData
      );
      return response.data;
    } catch (error) {
      console.error("Update SDK config error:", error);
      throw error.response?.data || error;
    }
  },

  // Update SDK segment rules
  async updateSDKSegmentRules(sdkId, segmentRules) {
    try {
      const response = await apiClient.put(
        `/admin/surveys/sdk/${sdkId}/segments`,
        { segmentRules }
      );
      return response.data;
    } catch (error) {
      console.error("Update SDK segment rules error:", error);
      throw error.response?.data || error;
    }
  },

  // Preview audience for segment rules
  async previewAudience(segmentRules) {
    try {
      const response = await apiClient.post(
        "/admin/surveys/sdk/audience-preview",
        { segmentRules }
      );
      return response.data;
    } catch (error) {
      console.error("Preview audience error:", error);
      throw error.response?.data || error;
    }
  },

  // Toggle SDK status (activate/deactivate)
  async toggleSDKStatus(sdkId) {
    try {
      const response = await apiClient.patch(
        `/admin/surveys/sdk/${sdkId}/status`
      );
      return response.data;
    } catch (error) {
      console.error("Toggle SDK status error:", error);
      throw error.response?.data || error;
    }
  },

  // Get live offers with pagination
  async getLiveOffers({ page = 1, limit = 20 } = {}) {
    try {
      const response = await apiClient.get("/admin/surveys/offers/live", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Get live offers error:", error);
      throw error.response?.data || error;
    }
  },

  // Get offer details by ID
  async getOfferDetails(offerId) {
    try {
      const response = await apiClient.get(`/admin/surveys/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error("Get offer details error:", error);
      throw error.response?.data || error;
    }
  },

  // Update offer status
  async updateOfferStatus(offerId, status) {
    try {
      const response = await apiClient.patch(
        `/admin/surveys/offers/${offerId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Update offer status error:", error);
      throw error.response?.data || error;
    }
  },

  // Update offer reward
  async updateOfferReward(offerId, coinReward) {
    try {
      const response = await apiClient.patch(
        `/admin/surveys/offers/${offerId}/reward`,
        { coinReward }
      );
      return response.data;
    } catch (error) {
      console.error("Update offer reward error:", error);
      throw error.response?.data || error;
    }
  },

  // ========== BitLab API Functions ==========

  // Get BitLab surveys
  async getBitLabSurveys({ platform, country, page = 1, limit = 20 } = {}) {
    try {
      const response = await apiClient.get("/bitlabs/surveys", {
        params: {
          platform,
          country,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get BitLab surveys error:", error);
      throw error.response?.data || error;
    }
  },

  // Get BitLab non-game offers (Admin route)
  async getBitLabNonGameOffers({
    type = "all",
    category = "all",
    page = 1,
    limit = 20,
    devices,
  } = {}) {
    try {
      console.log("API Call: getBitLabNonGameOffers", {
        type,
        devices,
        page,
        limit,
        url: "/admin/game-offers/non-game-offers/by-sdk/bitlabs",
      });
      const response = await apiClient.get(
        "/admin/game-offers/non-game-offers/by-sdk/bitlabs",
        {
          params: {
            type,
            devices,
          },
        }
      );
      console.log("API Response: getBitLabNonGameOffers", response.data);
      return response.data;
    } catch (error) {
      console.error("Get BitLab non-game offers error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error.response?.data || error;
    }
  },

  // Get BitLab health check (public endpoint, no auth needed)
  async getBitLabHealth() {
    try {
      const response = await apiClient.get("/bitlabs/health");
      return response.data;
    } catch (error) {
      console.error("Get BitLab health error:", error);
      throw error.response?.data || error;
    }
  },

  // Sync BitLab non-gaming offers to database (admin configuration)
  async syncBitLabOffers({
    offerIds,
    offerType = "all",
    autoActivate = true,
    devices = undefined,
  } = {}) {
    try {
      console.log("API Call: syncBitLabOffers", {
        offerIds,
        offerType,
        autoActivate,
        devices,
        url: "/admin/game-offers/non-game-offers/sync/bitlabs",
      });
      const response = await apiClient.post(
        "/admin/game-offers/non-game-offers/sync/bitlabs",
        {
          offerIds,
          offerType,
          autoActivate,
          devices,
        }
      );
      console.log("API Response: syncBitLabOffers", response.data);
      return response.data;
    } catch (error) {
      console.error("Sync BitLab offers error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error.response?.data || error;
    }
  },

  // Get configured non-gaming offers from database
  async getConfiguredBitLabOffers({ offerType = "all", status = "all" } = {}) {
    try {
      const response = await apiClient.get(
        "/admin/game-offers/non-game-offers/configured/bitlabs",
        {
          params: {
            offerType,
            status,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Get configured offers error:", error);
      throw error.response?.data || error;
    }
  },

  // Sync single offer to database
  async syncSingleBitLabOffer(
    offerId,
    offerType = "survey",
    devices = undefined
  ) {
    try {
      const response = await apiClient.post(
        "/admin/game-offers/non-game-offers/sync/bitlabs",
        {
          offerIds: [offerId],
          offerType: offerType,
          autoActivate: true,
          devices: devices,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Sync single offer error:", error);
      throw error.response?.data || error;
    }
  },

  // Delete/Unsync a configured offer
  async deleteConfiguredOffer(offerId) {
    try {
      const response = await apiClient.delete(
        `/admin/game-offers/non-game-offers/configured/${offerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Delete offer error:", error);
      throw error.response?.data || error;
    }
  },
};

export default surveyAPIs;
