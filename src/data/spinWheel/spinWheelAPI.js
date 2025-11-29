import apiClient from "../../lib/apiClient";

const spinWheelAPIs = {
  // Get spin wheel rewards with pagination
  async getRewards({ page = 1, limit = 10 } = {}) {
    try {
      const params = {
        page,
        limit,
      };

      const response = await apiClient.get("/admin/spin-wheel/rewards", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Get spin wheel rewards error:", error);
      throw error.response?.data || error;
    }
  },

  // Create new reward
  async createReward(formData) {
    try {
      const response = await apiClient.post(
        "/admin/spin-wheel/rewards",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Create reward error:", error);
      throw error.response?.data || error;
    }
  },

  // Update reward
  async updateReward(rewardId, formData) {
    try {
      const response = await apiClient.put(
        `/admin/spin-wheel/rewards/${rewardId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update reward error:", error);
      throw error.response?.data || error;
    }
  },

  // Delete reward
  async deleteReward(rewardId) {
    try {
      const response = await apiClient.delete(
        `/admin/spin-wheel/rewards/${rewardId}`
      );
      return response.data;
    } catch (error) {
      console.error("Delete reward error:", error);
      throw error.response?.data || error;
    }
  },

  // Get spin wheel config/settings
  async getConfig() {
    try {
      const response = await apiClient.get("/admin/spin-wheel/config");
      return response.data;
    } catch (error) {
      console.error("Get spin wheel config error:", error);
      throw error.response?.data || error;
    }
  },

  // Save spin wheel config/settings
  async saveConfig(configData) {
    try {
      const response = await apiClient.post(
        "/admin/spin-wheel/config",
        configData
      );
      return response.data;
    } catch (error) {
      console.error("Save spin wheel config error:", error);
      throw error.response?.data || error;
    }
  },

  // Toggle reward status
  async toggleReward(rewardId) {
    try {
      const response = await apiClient.patch(
        `/admin/spin-wheel/rewards/${rewardId}/toggle`
      );
      return response.data;
    } catch (error) {
      console.error("Toggle reward error:", error);
      throw error.response?.data || error;
    }
  },

  // Upload reward icon
  async uploadIcon(rewardId, iconFile) {
    try {
      const formData = new FormData();
      formData.append("icon", iconFile);
      const response = await apiClient.post(
        `/admin/spin-wheel/rewards/${rewardId}/icon`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Upload icon error:", error);
      throw error.response?.data || error;
    }
  },

  // Get analytics overview
  async getAnalyticsOverview({ startDate, endDate } = {}) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get(
        "/admin/spin-wheel/analytics/overview",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Get analytics overview error:", error);
      throw error.response?.data || error;
    }
  },

  // Get spin logs
  async getSpinLogs({
    page = 1,
    limit = 20,
    userTier,
    rewardType,
    startDate,
    endDate,
  } = {}) {
    try {
      const params = { page, limit };
      if (userTier) params.userTier = userTier;
      if (rewardType) params.rewardType = rewardType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get(
        "/admin/spin-wheel/analytics/spins",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Get spin logs error:", error);
      throw error.response?.data || error;
    }
  },

  // Get reward types
  async getRewardTypes() {
    try {
      const response = await apiClient.get("/admin/spin-wheel/rewards/types");
      return response.data;
    } catch (error) {
      console.error("Get reward types error:", error);
      throw error.response?.data || error;
    }
  },

  // Get tiers
  async getTiers() {
    try {
      const response = await apiClient.get("/admin/spin-wheel/rewards/tiers");
      return response.data;
    } catch (error) {
      console.error("Get tiers error:", error);
      throw error.response?.data || error;
    }
  },

  // Check probability
  async checkProbability() {
    try {
      const response = await apiClient.get(
        "/admin/spin-wheel/probability/check"
      );
      return response.data;
    } catch (error) {
      console.error("Check probability error:", error);
      throw error.response?.data || error;
    }
  },
};

export default spinWheelAPIs;
