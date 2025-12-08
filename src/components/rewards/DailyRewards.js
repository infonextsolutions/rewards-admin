"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import apiClient from "../../lib/apiClient";

export default function DailyRewards({ onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMultiplierModal, setShowMultiplierModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Main configuration state - matching API V2 structure
  const [config, setConfig] = useState({
    version: 2,
    isActive: false,
    days: Array.from({ length: 7 }, (_, i) => ({
      dayNumber: i + 1,
      active: false,
      rewardType: "Coins", // Coins, XP, Both
      coinValue: 0,
      xpValue: 0,
      claimButtonLabel: "CLAIM NOW",
      claimableOnLoginOnly: false,
      timerLabel: "",
    })),
    bigReward: {
      enabled: false,
      rewardType: "Coins",
      coinValue: 0,
      xpValue: 0,
      downgradeOnMiss: true,
      awardBadge: false,
    },
    fallbackReward: {
      coins: 0,
      xp: 0,
    },
    weeklyMultiplier: {
      enabled: false,
      week2: 1.0,
      week3: 1.0,
      week4: 1.0,
      additionalWeeks: [],
      roundingRule: "Round Nearest", // Round Nearest, Round Down
    },
  });

  // Fetch existing configuration
  useEffect(() => {
    fetchConfiguration();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showMultiplierModal) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "unset";
      document.body.style.overflow = "unset";
    }
    return () => {
      document.documentElement.style.overflow = "unset";
      document.body.style.overflow = "unset";
    };
  }, [showMultiplierModal]);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/admin/daily-rewards-v2/config");
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Transform API response to match component state
        setConfig({
          version: data.version || 2,
          isActive: data.isActive !== undefined ? data.isActive : false,
          days: data.days || config.days,
          bigReward: data.bigReward || config.bigReward,
          fallbackReward: data.fallbackReward || config.fallbackReward,
          weeklyMultiplier: data.weeklyMultiplier || config.weeklyMultiplier,
        });
        // Set last updated timestamp
        if (data.updatedAt) {
          setLastUpdated(data.updatedAt);
        } else if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }
      }
    } catch (error) {
      console.error("Error fetching daily rewards configuration:", error);
      // Don't show error if endpoint doesn't exist yet (first time setup)
      if (error.response?.status !== 404) {
        toast.error("Failed to load daily rewards configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDayRewardChange = (dayIndex, field, value) => {
    setConfig((prev) => ({
      ...prev,
      days: prev.days.map((day, idx) =>
        idx === dayIndex ? { ...day, [field]: value } : day
      ),
    }));
  };

  const handleBigRewardChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      bigReward: { ...prev.bigReward, [field]: value },
    }));
  };

  const handleMultiplierChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      weeklyMultiplier: { ...prev.weeklyMultiplier, [field]: value },
    }));
  };

  const addAdditionalMultiplier = () => {
    setConfig((prev) => {
      const currentMaxWeek =
        prev.weeklyMultiplier.additionalWeeks.length > 0
          ? Math.max(
              ...prev.weeklyMultiplier.additionalWeeks.map((w) => w.weekNumber)
            )
          : 4;
      return {
        ...prev,
        weeklyMultiplier: {
          ...prev.weeklyMultiplier,
          additionalWeeks: [
            ...prev.weeklyMultiplier.additionalWeeks,
            { weekNumber: currentMaxWeek + 1, multiplier: 1.0 },
          ],
        },
      };
    });
  };

  const removeAdditionalMultiplier = (index) => {
    setConfig((prev) => ({
      ...prev,
      weeklyMultiplier: {
        ...prev.weeklyMultiplier,
        additionalWeeks: prev.weeklyMultiplier.additionalWeeks.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateAdditionalMultiplier = (index, field, value) => {
    setConfig((prev) => ({
      ...prev,
      weeklyMultiplier: {
        ...prev.weeklyMultiplier,
        additionalWeeks: prev.weeklyMultiplier.additionalWeeks.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const validateConfiguration = () => {
    const errors = [];

    // Validate Day 1 must be configured if active
    if (config.isActive && (!config.days[0] || !config.days[0].active)) {
      errors.push("Day 1 must be configured when Daily Rewards is active");
    }

    // Validate each day's reward values based on reward type
    config.days.forEach((day) => {
      if (day.active) {
        if (day.rewardType === "Coins" || day.rewardType === "Both") {
          if (
            day.coinValue === undefined ||
            day.coinValue === null ||
            parseFloat(day.coinValue) < 0
          ) {
            errors.push(
              `Day ${day.dayNumber}: Coin value is required and must be >= 0`
            );
          }
        }
        if (day.rewardType === "XP" || day.rewardType === "Both") {
          if (
            day.xpValue === undefined ||
            day.xpValue === null ||
            parseFloat(day.xpValue) < 0
          ) {
            errors.push(
              `Day ${day.dayNumber}: XP value is required and must be >= 0`
            );
          }
        }
      }
    });

    // Validate Big Reward
    if (config.bigReward.enabled) {
      if (
        config.bigReward.rewardType === "Coins" ||
        config.bigReward.rewardType === "Both"
      ) {
        if (
          config.bigReward.coinValue === undefined ||
          config.bigReward.coinValue === null ||
          parseFloat(config.bigReward.coinValue) < 0
        ) {
          errors.push("Big Reward: Coin value is required and must be >= 0");
        }
      }
      if (
        config.bigReward.rewardType === "XP" ||
        config.bigReward.rewardType === "Both"
      ) {
        if (
          config.bigReward.xpValue === undefined ||
          config.bigReward.xpValue === null ||
          parseFloat(config.bigReward.xpValue) < 0
        ) {
          errors.push("Big Reward: XP value is required and must be >= 0");
        }
      }
    }

    // Validate Weekly Multiplier
    if (config.weeklyMultiplier.enabled) {
      if (
        !config.weeklyMultiplier.week2 ||
        parseFloat(config.weeklyMultiplier.week2) < 1.0
      ) {
        errors.push("Week 2 Multiplier is required and must be >= 1.0");
      }
      if (
        config.weeklyMultiplier.week3 &&
        parseFloat(config.weeklyMultiplier.week3) < 1.0
      ) {
        errors.push("Week 3 Multiplier must be >= 1.0");
      }
      if (
        config.weeklyMultiplier.week4 &&
        parseFloat(config.weeklyMultiplier.week4) < 1.0
      ) {
        errors.push("Week 4 Multiplier must be >= 1.0");
      }
      config.weeklyMultiplier.additionalWeeks.forEach((item) => {
        if (item.multiplier && parseFloat(item.multiplier) < 1.0) {
          errors.push(`Week ${item.weekNumber} Multiplier must be >= 1.0`);
        }
      });
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateConfiguration();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setSaving(true);
    try {
      // Transform config to match API format
      const apiPayload = {
        version: config.version,
        isActive: config.isActive,
        days: config.days.map((day) => ({
          dayNumber: day.dayNumber,
          active: day.active,
          rewardType: day.rewardType,
          coinValue:
            day.rewardType === "Coins" || day.rewardType === "Both"
              ? parseFloat(day.coinValue) || 0
              : 0,
          xpValue:
            day.rewardType === "XP" || day.rewardType === "Both"
              ? parseFloat(day.xpValue) || 0
              : 0,
          claimButtonLabel: day.claimButtonLabel || "CLAIM NOW",
          timerLabel: day.timerLabel || "",
          claimableOnLoginOnly: day.claimableOnLoginOnly || false,
        })),
        bigReward: {
          enabled: config.bigReward.enabled,
          rewardType: config.bigReward.rewardType,
          coinValue:
            config.bigReward.rewardType === "Coins" ||
            config.bigReward.rewardType === "Both"
              ? parseFloat(config.bigReward.coinValue) || 0
              : 0,
          xpValue:
            config.bigReward.rewardType === "XP" ||
            config.bigReward.rewardType === "Both"
              ? parseFloat(config.bigReward.xpValue) || 0
              : 0,
          downgradeOnMiss: config.bigReward.downgradeOnMiss,
          awardBadge: config.bigReward.awardBadge || false,
        },
        fallbackReward: {
          coins: parseFloat(config.fallbackReward.coins) || 0,
          xp: parseFloat(config.fallbackReward.xp) || 0,
        },
        weeklyMultiplier: {
          enabled: config.weeklyMultiplier.enabled,
          week2: config.weeklyMultiplier.enabled
            ? parseFloat(config.weeklyMultiplier.week2) || 1.0
            : undefined,
          week3:
            config.weeklyMultiplier.enabled && config.weeklyMultiplier.week3
              ? parseFloat(config.weeklyMultiplier.week3)
              : undefined,
          week4:
            config.weeklyMultiplier.enabled && config.weeklyMultiplier.week4
              ? parseFloat(config.weeklyMultiplier.week4)
              : undefined,
          additionalWeeks: config.weeklyMultiplier.enabled
            ? config.weeklyMultiplier.additionalWeeks.map((w) => ({
                weekNumber: w.weekNumber,
                multiplier: parseFloat(w.multiplier) || 1.0,
              }))
            : [],
          roundingRule: config.weeklyMultiplier.roundingRule,
        },
      };

      const response = await apiClient.post(
        "/admin/daily-rewards-v2/config",
        apiPayload
      );
      if (response.data.success) {
        toast.success("Daily Rewards configuration saved successfully!");

        // Update state directly from response to preserve isActive value
        if (response.data.data) {
          const data = response.data.data;
          setConfig((prev) => ({
            ...prev,
            version: data.version || prev.version,
            isActive:
              data.isActive !== undefined ? data.isActive : prev.isActive,
            days: data.days || prev.days,
            bigReward: data.bigReward || prev.bigReward,
            fallbackReward: data.fallbackReward || prev.fallbackReward,
            weeklyMultiplier: data.weeklyMultiplier || prev.weeklyMultiplier,
          }));

          // Update last updated timestamp
          if (data.updatedAt) {
            setLastUpdated(data.updatedAt);
          } else {
            setLastUpdated(new Date().toISOString());
          }
        } else {
          // Fallback: update timestamp only
          setLastUpdated(new Date().toISOString());
        }

        if (onSave) onSave(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to save configuration");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      toast.error(errorMessage || "Failed to save daily rewards configuration");
    } finally {
      setSaving(false);
    }
  };

  const renderToggle = (value, onChange) => {
    return (
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span className="sr-only">Toggle</span>
        <span
          className={`inline-block w-3 h-3 transform transition-transform bg-white rounded-full ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">
          Loading Daily Rewards configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feature Toggle and Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Daily Reward Active
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Globally activate/deactivate Daily Reward feature
            </p>
          </div>
          {renderToggle(config.isActive, () =>
            setConfig((prev) => ({ ...prev, isActive: !prev.isActive }))
          )}
        </div>
        {lastUpdated && (
          <div className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      {/* Weekly Multiplier Status Label */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Weekly Multiplier:{" "}
            {config.weeklyMultiplier.enabled ? "Gradual (Active)" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={() => setShowMultiplierModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Weekly Multiplier
          </button>
        </div>
      </div>

      {/* Day 1-6 Configuration Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Reward Configuration (Day 1-6)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
          Set rewards for each day of the 7-day cycle. Day 7 supports Big Reward. Rewards unlock every 24 hours and can be claimed once the user logs in. Weekly multipliers apply after Day 7.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#ecf8f1]">
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-[#333333] text-sm">
                  Day
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">
                  Active
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">
                  Reward Type
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">
                  Coin Value
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">
                  XP Value
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">
                  Claimable On Login Only
                </th>
              </tr>
            </thead>
            <tbody>
              {config.days
                .filter((day) => day.dayNumber !== 7)
                .map((day, index) => {
                  // Find the original index in the full days array for proper state updates
                  const originalIndex = config.days.findIndex(
                    (d) => d.dayNumber === day.dayNumber
                  );
                  return (
                    <tr
                      key={day.dayNumber}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">
                          Day {day.dayNumber}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        {renderToggle(day.active, () =>
                          handleDayRewardChange(
                            originalIndex,
                            "active",
                            !day.active
                          )
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <select
                          value={day.rewardType}
                          onChange={(e) =>
                            handleDayRewardChange(
                              originalIndex,
                              "rewardType",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          disabled={!day.active}
                        >
                          <option value="Coins">Coins</option>
                          <option value="XP">XP</option>
                          <option value="Both">Both</option>
                        </select>
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="number"
                          value={day.coinValue}
                          onChange={(e) =>
                            handleDayRewardChange(
                              originalIndex,
                              "coinValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          disabled={
                            !day.active ||
                            (day.rewardType !== "Coins" &&
                              day.rewardType !== "Both")
                          }
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="number"
                          value={day.xpValue}
                          onChange={(e) =>
                            handleDayRewardChange(
                              originalIndex,
                              "xpValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          disabled={
                            !day.active ||
                            (day.rewardType !== "XP" &&
                              day.rewardType !== "Both")
                          }
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        {renderToggle(day.claimableOnLoginOnly, () =>
                          handleDayRewardChange(
                            originalIndex,
                            "claimableOnLoginOnly",
                            !day.claimableOnLoginOnly
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day-7 Big Reward Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Day-7 Big Reward Configuration
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure the special reward for completing Days 1-6
            </p>
          </div>
          {renderToggle(config.bigReward.enabled, () =>
            handleBigRewardChange("enabled", !config.bigReward.enabled)
          )}
        </div>

        {config.bigReward.enabled && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Big Reward Type
                </label>
                <select
                  value={config.bigReward.rewardType}
                  onChange={(e) =>
                    handleBigRewardChange("rewardType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Coins">Coins</option>
                  <option value="XP">XP</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Downgrade On Miss
                </label>
                <div className="flex items-center">
                  {renderToggle(config.bigReward.downgradeOnMiss, () =>
                    handleBigRewardChange(
                      "downgradeOnMiss",
                      !config.bigReward.downgradeOnMiss
                    )
                  )}
                  <span className="ml-2 text-sm text-gray-600">
                    {config.bigReward.downgradeOnMiss ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(config.bigReward.rewardType === "Coins" ||
                config.bigReward.rewardType === "Both") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Big Reward Coin Value
                  </label>
                  <input
                    type="number"
                    value={config.bigReward.coinValue}
                    onChange={(e) =>
                      handleBigRewardChange(
                        "coinValue",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              )}
              {(config.bigReward.rewardType === "XP" ||
                config.bigReward.rewardType === "Both") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Big Reward XP Value
                  </label>
                  <input
                    type="number"
                    value={config.bigReward.xpValue}
                    onChange={(e) =>
                      handleBigRewardChange(
                        "xpValue",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Multiplier Modal */}
      {showMultiplierModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Background overlay - separate element to ensure full coverage */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60"
            onClick={() => setShowMultiplierModal(false)}
            style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          />
          {/* Modal content */}
          <div
            className="relative bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{ zIndex: 10000 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Weekly Multiplier Settings
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMultiplierModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weekly Multiplier Enabled
                    </label>
                    <p className="text-xs text-gray-500">
                      Enable gradual multiplier system for Week 2+
                    </p>
                  </div>
                  {renderToggle(config.weeklyMultiplier.enabled, () =>
                    handleMultiplierChange(
                      "enabled",
                      !config.weeklyMultiplier.enabled
                    )
                  )}
                </div>

                {config.weeklyMultiplier.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Week 2 Multiplier (Days 8-14){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={config.weeklyMultiplier.week2}
                        onChange={(e) =>
                          handleMultiplierChange(
                            "week2",
                            parseFloat(e.target.value) || 1.0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1.0"
                        step="0.1"
                        placeholder="1.0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Week 3 Multiplier (Days 15-21)
                      </label>
                      <input
                        type="number"
                        value={config.weeklyMultiplier.week3}
                        onChange={(e) =>
                          handleMultiplierChange(
                            "week3",
                            parseFloat(e.target.value) || 1.0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1.0"
                        step="0.1"
                        placeholder="1.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Week 4 Multiplier (Days 22-28)
                      </label>
                      <input
                        type="number"
                        value={config.weeklyMultiplier.week4}
                        onChange={(e) =>
                          handleMultiplierChange(
                            "week4",
                            parseFloat(e.target.value) || 1.0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1.0"
                        step="0.1"
                        placeholder="1.0"
                      />
                    </div>
                    {config.weeklyMultiplier.additionalWeeks.map(
                      (item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Week {item.weekNumber} Multiplier
                            </label>
                            <input
                              type="number"
                              value={item.multiplier}
                              onChange={(e) =>
                                updateAdditionalMultiplier(
                                  index,
                                  "multiplier",
                                  parseFloat(e.target.value) || 1.0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              min="1.0"
                              step="0.1"
                              placeholder="1.0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAdditionalMultiplier(index)}
                            className="mt-6 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                    <button
                      type="button"
                      onClick={addAdditionalMultiplier}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 text-sm"
                    >
                      + Add Additional Week Multiplier
                    </button>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rounding Rule <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={config.weeklyMultiplier.roundingRule}
                        onChange={(e) =>
                          handleMultiplierChange("roundingRule", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      >
                        <option value="Round Nearest">Round Nearest</option>
                        <option value="Round Down">Round Down</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMultiplierModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
