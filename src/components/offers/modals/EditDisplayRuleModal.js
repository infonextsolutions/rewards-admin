"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const targetSegmentOptions = [
  "New Users",
  "Engaged Users",
  "New Users, Engaged Users",
];

export default function EditDisplayRuleModal({
  isOpen,
  onClose,
  rule,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxGames: 2,
    enabled: true,
    targetSegment: "New Users",
    gameCountLimits: {
      xpTierLimits: {
        junior: null,
        mid: null,
        senior: null,
      },
      membershipTierLimits: {
        bronze: null,
        gold: null,
        platinum: null,
        free: null,
      },
      newUsersLimit: null,
      engagedUsersLimit: null,
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || "",
        description: rule.description || "",
        maxGames:
          rule.maxGames === 999
            ? 999
            : (typeof rule.maxGames === "string" &&
              rule.maxGames.startsWith("+")
                ? parseInt(rule.maxGames.substring(1))
                : rule.maxGames) || 2,
        enabled: rule.enabled !== undefined ? rule.enabled : true,
        targetSegment: rule.targetSegment || "New Users",
        gameCountLimits: rule.gameCountLimits || {
          xpTierLimits: {
            junior: null,
            mid: null,
            senior: null,
          },
          membershipTierLimits: {
            bronze: null,
            gold: null,
            platinum: null,
            free: null,
          },
          newUsersLimit: null,
          engagedUsersLimit: null,
        },
      });
    } else {
      // Reset form for new rule
      setFormData({
        name: "",
        description: "",
        maxGames: 2,
        enabled: true,
        targetSegment: "New Users",
        gameCountLimits: {
          xpTierLimits: {
            junior: null,
            mid: null,
            senior: null,
          },
          membershipTierLimits: {
            bronze: null,
            gold: null,
            platinum: null,
            free: null,
          },
          newUsersLimit: null,
          engagedUsersLimit: null,
        },
      });
    }
    setErrors({});
  }, [rule, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Rule name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.maxGames < 1) {
      newErrors.maxGames = "Max games must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        id: rule?.id || `RULE${Date.now()}`,
        ...formData,
        appliedCount: rule?.appliedCount || 0,
        conversionRate: rule?.conversionRate || "0%",
        lastModified: new Date().toISOString().split("T")[0],
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {rule ? "Edit Display Rule" : "Create New Display Rule"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.name
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="Enter rule name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Segment *
                  </label>
                  <select
                    value={formData.targetSegment}
                    onChange={(e) =>
                      handleInputChange("targetSegment", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {targetSegmentOptions.map((segment) => (
                      <option key={segment} value={segment}>
                        {segment}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.description
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
                placeholder="Describe what this rule does and when it applies"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Max Games Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Game Visibility Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Maximum Games to Display *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={formData.maxGames}
                      onChange={(e) =>
                        handleInputChange(
                          "maxGames",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        errors.maxGames
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    />
                  </div>
                  {errors.maxGames && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.maxGames}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.maxGames === 999
                      ? "Unlimited games for this user segment"
                      : `Default: Show maximum ${formData.maxGames} games (used if tier-specific limits not set)`}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) =>
                      handleInputChange("enabled", e.target.checked)
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="enabled"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Enable this rule immediately
                  </label>
                </div>
              </div>

              {/* Game Count Limits by Tier */}
              <div className="border-t border-gray-200 pt-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-4">
                  Game Count Limits by Tier (Optional)
                </h5>
                <p className="text-xs text-gray-500 mb-4">
                  Set specific game count limits for different tiers. Leave
                  empty to use default value above.
                </p>

                {/* New Users Limit - Show when "New Users" or "New Users, Engaged Users" */}
                {(formData.targetSegment === "New Users" || formData.targetSegment === "New Users, Engaged Users") && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Users Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.gameCountLimits.newUsersLimit || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : parseInt(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        gameCountLimits: {
                          ...prev.gameCountLimits,
                          newUsersLimit: value,
                        },
                      }));
                    }}
                    placeholder="Use default"
                    className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Number of games to show for new users (first-time app open)
                  </p>
                </div>
                )}

                {/* Engaged Users Limit - Show when "Engaged Users" or "New Users, Engaged Users" */}
                {(formData.targetSegment === "Engaged Users" || formData.targetSegment === "New Users, Engaged Users") && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engaged Users Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.gameCountLimits.engagedUsersLimit || ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? null : parseInt(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          gameCountLimits: {
                            ...prev.gameCountLimits,
                            engagedUsersLimit: value,
                          },
                        }));
                      }}
                      placeholder="Use default"
                      className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Number of games to show for engaged users (returning users)
                    </p>
                  </div>
                )}

                {/* XP Tier Limits */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    XP Tier Limits
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["junior", "mid", "senior"].map((tier) => (
                      <div key={tier}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                          {tier} Tier
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={
                            formData.gameCountLimits.xpTierLimits[tier] || ""
                          }
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              gameCountLimits: {
                                ...prev.gameCountLimits,
                                xpTierLimits: {
                                  ...prev.gameCountLimits.xpTierLimits,
                                  [tier]: value,
                                },
                              },
                            }));
                          }}
                          placeholder="Use default"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Membership/VIP Tier Limits */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Membership/VIP Tier Limits
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {["bronze", "gold", "platinum", "free"].map((tier) => (
                      <div key={tier}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                          {tier === "free"
                            ? "Free"
                            : tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={
                            formData.gameCountLimits.membershipTierLimits[
                              tier
                            ] || ""
                          }
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              gameCountLimits: {
                                ...prev.gameCountLimits,
                                membershipTierLimits: {
                                  ...prev.gameCountLimits.membershipTierLimits,
                                  [tier]: value,
                                },
                              },
                            }));
                          }}
                          placeholder="Use default"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Rule Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rule:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.name || "Untitled Rule"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Segment:</span>
                  <span className="text-gray-900">
                    {formData.targetSegment || "New Users"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Default Max Games:</span>
                  <span className="text-gray-900">
                    {formData.maxGames === 999
                      ? "Unlimited"
                      : `${formData.maxGames} games`}
                  </span>
                </div>

                {/* Show tier-specific limits if set */}
                {(formData.gameCountLimits.newUsersLimit ||
                  formData.gameCountLimits.engagedUsersLimit ||
                  Object.values(formData.gameCountLimits.xpTierLimits).some(
                    (v) => v !== null
                  ) ||
                  Object.values(
                    formData.gameCountLimits.membershipTierLimits
                  ).some((v) => v !== null)) && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Tier-Specific Limits:
                    </p>
                    {formData.gameCountLimits.newUsersLimit && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">New Users:</span>
                        <span className="text-gray-900 font-medium">
                          {formData.gameCountLimits.newUsersLimit} games
                        </span>
                      </div>
                    )}
                    {formData.gameCountLimits.engagedUsersLimit && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Engaged Users:</span>
                        <span className="text-gray-900 font-medium">
                          {formData.gameCountLimits.engagedUsersLimit} games
                        </span>
                      </div>
                    )}
                    {Object.entries(formData.gameCountLimits.xpTierLimits).map(
                      ([tier, limit]) =>
                        limit !== null && (
                          <div
                            key={tier}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-600 capitalize">
                              {tier} Tier:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {limit} games
                            </span>
                          </div>
                        )
                    )}
                    {Object.entries(
                      formData.gameCountLimits.membershipTierLimits
                    ).map(
                      ([tier, limit]) =>
                        limit !== null && (
                          <div
                            key={tier}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-600 capitalize">
                              {tier === "free"
                                ? "Free"
                                : tier.charAt(0).toUpperCase() + tier.slice(1)}
                              :
                            </span>
                            <span className="text-gray-900 font-medium">
                              {limit} games
                            </span>
                          </div>
                        )
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      formData.enabled ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formData.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                {rule ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
