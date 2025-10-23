"use client";

import { useState, useCallback } from "react";

// Mock data for development
const mockRewards = [
  {
    id: 1,
    label: "100 Coins",
    type: "Coins",
    amount: 100,
    probability: 25,
    tierVisibility: ["All Tiers"],
    icon: null,
    active: true,
    order: 1,
  },
  {
    id: 2,
    label: "50 XP",
    type: "XP",
    amount: 50,
    probability: 30,
    tierVisibility: ["Bronze", "Platinum"],
    icon: null,
    active: true,
    order: 2,
  },
  {
    id: 3,
    label: "10% Discount Coupon",
    type: "Coupons",
    amount: 10,
    probability: 15,
    tierVisibility: ["Gold"],
    icon: null,
    active: true,
    order: 3,
  },
  {
    id: 4,
    label: "500 Coins Bonus",
    type: "Coins",
    amount: 500,
    probability: 5,
    tierVisibility: ["Gold"],
    icon: null,
    active: false,
    order: 4,
  },
];

const mockSettings = {
  spinMode: "free",
  cooldownPeriod: 6, // in hours
  maxSpinsPerDay: 3,
  eligibleTiers: ["All Tiers"],
  startDate: "",
  endDate: "",
};

export function useSpinWheel() {
  const [rewards, setRewards] = useState([]);
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate API delay
  const simulateDelay = (ms = 1000) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Fetch all rewards from API
  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Import the API dynamically
      const { default: spinWheelAPIs } = await import(
        "../data/spinWheel/spinWheelAPI"
      );
      const response = await spinWheelAPIs.getRewards({ page: 1, limit: 100 });

      if (response.success && response.data) {
        // Map API response to component format
        const mappedRewards = response.data.rewards.map((reward, index) => ({
          id: reward._id,
          label: reward.name,
          type: reward.type.charAt(0).toUpperCase() + reward.type.slice(1), // capitalize: coins -> Coins
          amount: reward.amount,
          probability: reward.probability,
          tierVisibility: reward.eligibleTiers || [],
          icon: reward.icon,
          active: reward.isActive,
          order: index + 1,
          color: reward.color,
          metadata: reward.metadata,
          stats: reward.stats,
        }));

        setRewards(mappedRewards);
      }
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError(err.message || "Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch spin settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Import the API dynamically
      const { default: spinWheelAPIs } = await import(
        "../data/spinWheel/spinWheelAPI"
      );
      const response = await spinWheelAPIs.getConfig();

      if (response.success && response.data) {
        // Map API response to component format
        const mappedSettings = {
          spinMode: response.data.spinMode,
          cooldownPeriod: response.data.cooldownPeriod,
          maxSpinsPerDay: response.data.maxSpinsPerDay,
          eligibleTiers: response.data.eligibleTiers || [],
          startDate: response.data.startDate
            ? new Date(response.data.startDate).toISOString().slice(0, 16)
            : "",
          endDate: response.data.endDate
            ? new Date(response.data.endDate).toISOString().slice(0, 16)
            : "",
        };

        setSettings(mappedSettings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new reward
  const addReward = useCallback(
    async (rewardData) => {
      try {
        setLoading(true);
        setError(null);

        // Prepare FormData
        const formData = new FormData();

        // Add static name field (modal doesn't have name field)
        formData.append("name", rewardData.label || "Reward");

        // Add other fields from modal
        formData.append("type", rewardData.type.toLowerCase()); // Convert "Coins" to "coins"
        formData.append("amount", rewardData.amount);
        formData.append("probability", rewardData.probability);

        // Handle tierVisibility - convert to eligibleTiers
        if (rewardData.tierVisibility && rewardData.tierVisibility.length > 0) {
          // If "All Tiers" is selected, send all tier values
          if (rewardData.tierVisibility.includes("All Tiers")) {
            const allTiers = ["Bronze", "Gold", "Platinum"];
            allTiers.forEach((tier) => {
              formData.append("tierVisibility[]", tier);
            });
          } else {
            rewardData.tierVisibility.forEach((tier) => {
              formData.append("tierVisibility[]", tier);
            });
          }
        }

        formData.append("active", rewardData.active ? "true" : "false");

        // Add icon file if provided
        if (rewardData.icon && rewardData.icon instanceof File) {
          formData.append("icon", rewardData.icon);
        }

        // Import API and create reward
        const { default: spinWheelAPIs } = await import(
          "../data/spinWheel/spinWheelAPI"
        );
        const response = await spinWheelAPIs.createReward(formData);

        if (response.success && response.data) {
          // Refresh rewards list
          await fetchRewards();
          return response.data.reward;
        }
      } catch (err) {
        console.error("Error adding reward:", err);
        setError(err.message || "Failed to add reward");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  // Update existing reward
  const updateReward = useCallback(
    async (id, rewardData) => {
      try {
        setLoading(true);
        setError(null);

        // Prepare FormData
        const formData = new FormData();

        // Add static name field (modal doesn't have name field)
        formData.append("name", rewardData.label || "Reward");

        // Add other fields from modal
        formData.append("type", rewardData.type.toLowerCase()); // Convert "Coins" to "coins"
        formData.append("amount", rewardData.amount);
        formData.append("probability", rewardData.probability);

        // Handle tierVisibility - convert to eligibleTiers
        if (rewardData.tierVisibility && rewardData.tierVisibility.length > 0) {
          // If "All Tiers" is selected, send all tier values
          if (rewardData.tierVisibility.includes("All Tiers")) {
            const allTiers = ["Bronze", "Gold", "Platinum"];
            allTiers.forEach((tier) => {
              formData.append("tierVisibility[]", tier);
            });
          } else {
            rewardData.tierVisibility.forEach((tier) => {
              formData.append("tierVisibility[]", tier);
            });
          }
        }

        formData.append("active", rewardData.active ? "true" : "false");

        // Add icon file if provided (optional for update)
        if (rewardData.icon && rewardData.icon instanceof File) {
          formData.append("icon", rewardData.icon);
        }

        // Import API and update reward
        const { default: spinWheelAPIs } = await import(
          "../data/spinWheel/spinWheelAPI"
        );
        const response = await spinWheelAPIs.updateReward(id, formData);

        if (response.success && response.data) {
          // Refresh rewards list
          await fetchRewards();
          return response.data.reward;
        }
      } catch (err) {
        console.error("Error updating reward:", err);
        setError(err.message || "Failed to update reward");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  // Delete reward
  const deleteReward = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        // Import API and delete reward
        const { default: spinWheelAPIs } = await import(
          "../data/spinWheel/spinWheelAPI"
        );
        const response = await spinWheelAPIs.deleteReward(id);

        if (response.success) {
          // Refresh rewards list
          await fetchRewards();
          return response;
        }
      } catch (err) {
        console.error("Error deleting reward:", err);
        setError(err.message || "Failed to delete reward");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  // Update spin settings
  const updateSettings = useCallback(
    async (settingsData) => {
      try {
        setLoading(true);
        setError(null);

        // Prepare API payload
        const payload = {
          name:
            settingsData.spinMode === "free"
              ? "Main Spin Wheel"
              : "Ad-Based Spin Wheel",
          spinMode: settingsData.spinMode,
          cooldownPeriod: settingsData.cooldownPeriod,
          maxSpinsPerDay: settingsData.maxSpinsPerDay,
          eligibleTiers: settingsData.eligibleTiers || [],
        };

        // Add dates if provided
        if (settingsData.startDate) {
          payload.startDate = settingsData.startDate;
        } else {
          payload.startDate = "";
        }

        if (settingsData.endDate) {
          payload.endDate = settingsData.endDate;
        } else {
          payload.endDate = "";
        }

        // Import API and save settings
        const { default: spinWheelAPIs } = await import(
          "../data/spinWheel/spinWheelAPI"
        );
        const response = await spinWheelAPIs.saveConfig(payload);

        if (response.success && response.data) {
          // Refresh settings
          await fetchSettings();
          return response.data;
        }
      } catch (err) {
        console.error("Error updating settings:", err);
        setError(err.message || "Failed to update settings");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSettings]
  );

  // Reorder rewards
  const reorderRewards = useCallback(
    async (startIndex, endIndex) => {
      try {
        setLoading(true);
        setError(null);
        await simulateDelay(300);

        const newRewards = Array.from(rewards);
        const [reorderedItem] = newRewards.splice(startIndex, 1);
        newRewards.splice(endIndex, 0, reorderedItem);

        // Update order property
        const updatedRewards = newRewards.map((reward, index) => ({
          ...reward,
          order: index + 1,
        }));

        setRewards(updatedRewards);
        return updatedRewards;
      } catch (err) {
        setError(err.message || "Failed to reorder rewards");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [rewards]
  );

  // Validate probability totals
  const validateProbabilities = useCallback(
    (rewardsToValidate = rewards) => {
      const totalProbability = rewardsToValidate
        .filter((reward) => reward.active)
        .reduce((sum, reward) => sum + (reward.probability || 0), 0);

      return {
        total: totalProbability,
        isValid: totalProbability <= 100,
        remaining: Math.max(0, 100 - totalProbability),
        exceeded: Math.max(0, totalProbability - 100),
      };
    },
    [rewards]
  );

  return {
    // State
    rewards,
    settings,
    loading,
    error,

    // Actions
    fetchRewards,
    fetchSettings,
    addReward,
    updateReward,
    deleteReward,
    updateSettings,
    reorderRewards,

    // Utilities
    validateProbabilities,

    // Computed values
    totalProbability: validateProbabilities().total,
    probabilityValid: validateProbabilities().isValid,
    remainingProbability: validateProbabilities().remaining,
    activeRewards: rewards.filter((r) => r.active),
    inactiveRewards: rewards.filter((r) => !r.active),
  };
}
