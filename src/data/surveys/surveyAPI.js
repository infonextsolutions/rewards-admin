// Survey & Non-Gaming Offers API
// All survey/non-gaming routes call the new /api/non-gaming-survey backend
import apiClient from "../../lib/apiClient";

const BASE = "/non-gaming-survey";

const surveyAPIs = {
  // ── Fetch from SDK (admin preview — no DB write) ─────────────────────────

  // GET /api/non-gaming-survey/admin/non-gaming/fetch
  // sdk: "bitlabs" | "everflow" | "affise"
  // Returns: { success, data, categorized: { cashback, shopping, magicReceipts, surveys, other }, breakdown, total }
  async fetchNonGamingOffers({ sdk = "bitlabs", type = "all", country, devices, page = 1, limit = 20 } = {}) {
    try {
      const params = { sdk, type, page, limit };
      if (country) params.country = country;
      if (devices && devices.length > 0) params.devices = devices;
      const response = await apiClient.get(`${BASE}/admin/non-gaming/fetch`, {
        params,
        paramsSerializer: { indexes: null },
      });
      return response.data;
    } catch (error) {
      console.error("fetchNonGamingOffers error:", error);
      throw error.response?.data || error;
    }
  },

  // GET /api/non-gaming-survey/admin/surveys/fetch
  // sdk: "bitlabs" | "besitos"
  // Returns: { success, data: survey[], total }
  async fetchSurveys({ sdk = "bitlabs", country, devices, page = 1, limit = 20 } = {}) {
    try {
      const params = { sdk, page, limit };
      if (country) params.country = country;
      if (devices && devices.length > 0) params.devices = devices;
      const response = await apiClient.get(`${BASE}/admin/surveys/fetch`, {
        params,
        paramsSerializer: { indexes: null },
      });
      return response.data;
    } catch (error) {
      console.error("fetchSurveys error:", error);
      throw error.response?.data || error;
    }
  },

  // ── Sync (save) to DB ────────────────────────────────────────────────────

  // POST /api/non-gaming-survey/admin/non-gaming/sync
  // sdk: "bitlabs" | "everflow" | "affise"
  async syncNonGamingOffers({ sdk = "bitlabs", offerIds = [], autoActivate = true, devices, country, targetAudience } = {}) {
    try {
      const response = await apiClient.post(`${BASE}/admin/non-gaming/sync`, {
        sdk, offerIds, autoActivate, devices, country, targetAudience,
      });
      return response.data;
    } catch (error) {
      console.error("syncNonGamingOffers error:", error);
      throw error.response?.data || error;
    }
  },

  // POST /api/non-gaming-survey/admin/surveys/sync
  // sdk: "bitlabs" | "besitos"
  async syncSurveys({ sdk = "bitlabs", offerIds = [], autoActivate = true, devices, country, targetAudience } = {}) {
    try {
      const response = await apiClient.post(`${BASE}/admin/surveys/sync`, {
        sdk, offerIds, autoActivate, devices, country, targetAudience,
      });
      return response.data;
    } catch (error) {
      console.error("syncSurveys error:", error);
      throw error.response?.data || error;
    }
  },

  // ── Read / Delete configured offers from DB ──────────────────────────────

  // GET /api/non-gaming-survey/admin/configured
  // offerType: "all" | "survey" | "cashback" | "shopping" | "magic_receipt"
  // status: "all" | "live" | "paused"
  // sdk: "all" | "bitlabs" | "besitos" | "everflow" | "affise"
  async getConfiguredOffers({ offerType = "all", status = "all", sdk = "all" } = {}) {
    try {
      const response = await apiClient.get(`${BASE}/admin/configured`, {
        params: { offerType, status, sdk },
      });
      return response.data;
    } catch (error) {
      console.error("getConfiguredOffers error:", error);
      throw error.response?.data || error;
    }
  },

  // DELETE /api/non-gaming-survey/admin/configured/:id
  async deleteConfiguredOffer(offerId) {
    try {
      const response = await apiClient.delete(`${BASE}/admin/configured/${offerId}`);
      return response.data;
    } catch (error) {
      console.error("deleteConfiguredOffer error:", error);
      throw error.response?.data || error;
    }
  },

  // ── SDK Management (admin-surveys.js routes — unchanged) ─────────────────

  async getSDKList({ page = 1, limit = 10 } = {}) {
    try {
      const response = await apiClient.get("/admin/surveys/sdk/list", {
        params: { page, limit, search: "", status: "all", category: "all" },
      });
      return response.data;
    } catch (error) {
      console.error("getSDKList error:", error);
      throw error.response?.data || error;
    }
  },

  async createSDK(sdkData) {
    try {
      const response = await apiClient.post("/admin/surveys/sdk", sdkData);
      return response.data;
    } catch (error) {
      console.error("createSDK error:", error);
      throw error.response?.data || error;
    }
  },

  async getSDKDetails(sdkId) {
    try {
      const response = await apiClient.get(`/admin/surveys/sdk/${sdkId}`);
      return response.data;
    } catch (error) {
      console.error("getSDKDetails error:", error);
      throw error.response?.data || error;
    }
  },

  async updateSDKConfig(sdkId, configData) {
    try {
      const response = await apiClient.put(`/admin/surveys/sdk/${sdkId}/config`, configData);
      return response.data;
    } catch (error) {
      console.error("updateSDKConfig error:", error);
      throw error.response?.data || error;
    }
  },

  async updateSDKSegmentRules(sdkId, segmentRules) {
    try {
      const response = await apiClient.put(`/admin/surveys/sdk/${sdkId}/segments`, { segmentRules });
      return response.data;
    } catch (error) {
      console.error("updateSDKSegmentRules error:", error);
      throw error.response?.data || error;
    }
  },

  async previewAudience(segmentRules) {
    try {
      const response = await apiClient.post("/admin/surveys/sdk/audience-preview", { segmentRules });
      return response.data;
    } catch (error) {
      console.error("previewAudience error:", error);
      throw error.response?.data || error;
    }
  },

  async toggleSDKStatus(sdkId) {
    try {
      const response = await apiClient.patch(`/admin/surveys/sdk/${sdkId}/status`);
      return response.data;
    } catch (error) {
      console.error("toggleSDKStatus error:", error);
      throw error.response?.data || error;
    }
  },

  // ── Live Offers Analytics (admin-surveys.js routes — unchanged) ──────────

  async getLiveOffers({ page = 1, limit = 20 } = {}) {
    try {
      const response = await apiClient.get("/admin/surveys/offers/live", { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error("getLiveOffers error:", error);
      throw error.response?.data || error;
    }
  },

  async getOfferDetails(offerId) {
    try {
      const response = await apiClient.get(`/admin/surveys/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error("getOfferDetails error:", error);
      throw error.response?.data || error;
    }
  },

  async updateOfferStatus(offerId, status) {
    try {
      const response = await apiClient.patch(`/admin/surveys/offers/${offerId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("updateOfferStatus error:", error);
      throw error.response?.data || error;
    }
  },

  async updateOfferReward(offerId, coinReward) {
    try {
      const response = await apiClient.patch(`/admin/surveys/offers/${offerId}/reward`, { coinReward });
      return response.data;
    } catch (error) {
      console.error("updateOfferReward error:", error);
      throw error.response?.data || error;
    }
  },
};

export default surveyAPIs;
