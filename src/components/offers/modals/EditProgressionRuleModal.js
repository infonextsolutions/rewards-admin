"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { progressionRulesAPI } from "../../../data/progressionRules";
import apiClient from "../../../lib/apiClient";
import toast from "react-hot-toast";

const xpTierOptions = ["Junior", "Mid", "Senior"];
const membershipTierOptions = ["Bronze", "Gold", "Platinum", "Free"];

export default function EditProgressionRuleModal({
  isOpen,
  onClose,
  progressionRule,
  onSave,
}) {
  const [formData, setFormData] = useState({
    ruleName: "",
    xpTier: null,
    priority: 0,
    firstBatchSize: 5,
    nextBatchSize: 5,
    maxBatches: null,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when progressionRule changes
  useEffect(() => {
    if (progressionRule) {
      // Editing existing rule
      setFormData({
        ruleName: progressionRule.ruleName || "",
        xpTier: progressionRule.xpTier || null,
        membershipTier: progressionRule.membershipTier || null,
        priority: progressionRule.priority || 0,
        firstBatchSize: progressionRule.firstBatchSize || 5,
        nextBatchSize: progressionRule.nextBatchSize || 5,
        maxBatches: progressionRule.maxBatches || null,
        isActive:
          progressionRule.isActive !== undefined
            ? progressionRule.isActive
            : true,
      });
    } else {
      // Creating new rule
      setFormData({
        ruleName: "",
        xpTier: null,
        membershipTier: null,
        priority: 0,
        firstBatchSize: 5,
        nextBatchSize: 5,
        maxBatches: null,
        isActive: true,
      });
    }
    setErrors({});
  }, [progressionRule, isOpen]);

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

    if (!formData.ruleName.trim()) {
      newErrors.ruleName = "Rule name is required";
    }

    if (!formData.xpTier) {
      newErrors.xpTier = "XP tier is required";
    }

    if (formData.firstBatchSize < 1) {
      newErrors.firstBatchSize = "First batch size must be at least 1";
    }

    if (formData.nextBatchSize < 1) {
      newErrors.nextBatchSize = "Next batch size must be at least 1";
    }

    if (formData.maxBatches !== null && formData.maxBatches < 1) {
      newErrors.maxBatches = "Max batches must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Prepare rule data - auto-set userMilestones based on selected fields
    const userMilestones = [];
    if (formData.xpTier) {
      userMilestones.push("xp_tier");
    }
    if (formData.membershipTier) {
      userMilestones.push("membership_tier");
    }

    const ruleData = {
      ruleName: formData.ruleName.trim(),
      userMilestones: userMilestones.length > 0 ? userMilestones : ["xp_tier"], // Default to xp_tier if nothing selected
      xpTier: formData.xpTier?.toLowerCase() || null,
      membershipTier: formData.membershipTier?.toLowerCase() || null,
      priority: formData.priority || 0,
      firstBatchSize: formData.firstBatchSize,
      nextBatchSize: formData.nextBatchSize,
      maxBatches: formData.maxBatches || null,
      isActive: formData.isActive,
    };

    // Make API call
    try {
      if (progressionRule) {
        // Update existing rule
        await apiClient.put(
          `/admin/game-offers/progression-rules/${progressionRule._id}`,
          ruleData
        );
        toast.success("Progression rule updated successfully");
      } else {
        // Create new rule
        await apiClient.post("/admin/game-offers/progression-rules", ruleData);
        toast.success("Progression rule created successfully");
      }
      // Call onSave to refresh the list, then close modal
      await onSave();
      onClose();
    } catch (error) {
      console.error("Error saving progression rule:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save progression rule";
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {progressionRule
                ? "Edit Progression Rule"
                : "Create New Progression Rule"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Rule Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={formData.ruleName}
                  onChange={(e) =>
                    handleInputChange("ruleName", e.target.value)
                  }
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.ruleName
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g., New User Rule"
                />
                {errors.ruleName && (
                  <p className="mt-1 text-xs text-red-600">{errors.ruleName}</p>
                )}
              </div>

              {/* XP Tier Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  XP Tier *
                </label>
                <select
                  value={formData.xpTier || ""}
                  onChange={(e) =>
                    handleInputChange("xpTier", e.target.value || null)
                  }
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.xpTier
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Select XP tier...</option>
                  {xpTierOptions.map((tier) => (
                    <option key={tier.toLowerCase()} value={tier.toLowerCase()}>
                      {tier}
                    </option>
                  ))}
                </select>
                {errors.xpTier && (
                  <p className="mt-1 text-xs text-red-600">{errors.xpTier}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This rule will apply to users with the selected XP tier
                </p>
              </div>

              {/* Membership Tier Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membership Tier (Optional)
                </label>
                <select
                  value={formData.membershipTier || ""}
                  onChange={(e) =>
                    handleInputChange("membershipTier", e.target.value || null)
                  }
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.membershipTier
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Select membership tier (optional)...</option>
                  {membershipTierOptions.map((tier) => (
                    <option key={tier.toLowerCase()} value={tier.toLowerCase()}>
                      {tier}
                    </option>
                  ))}
                </select>
                {errors.membershipTier && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.membershipTier}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optionally filter by membership tier. Leave empty to apply to
                  all tiers.
                </p>
              </div>

              {/* Priority */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", parseInt(e.target.value) || 0)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Higher priority rules are applied first when multiple rules
                  match a user
                </p>
              </div>

              {/* Batch Configuration */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Batch Configuration
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Batch Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.firstBatchSize}
                      onChange={(e) =>
                        handleInputChange(
                          "firstBatchSize",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        errors.firstBatchSize
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="5"
                    />
                    {errors.firstBatchSize && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.firstBatchSize}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Number of tasks that unlock sequentially (e.g., first 5
                      tasks)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Batch Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.nextBatchSize}
                      onChange={(e) =>
                        handleInputChange(
                          "nextBatchSize",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        errors.nextBatchSize
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="5"
                    />
                    {errors.nextBatchSize && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.nextBatchSize}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Number of tasks in each subsequent batch (e.g., next 5,
                      then next 5, etc.)
                    </p>
                  </div>

                  {/* Max Batches field - commented out */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Batches (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxBatches || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "maxBatches",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        errors.maxBatches
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="Leave empty for unlimited"
                    />
                    {errors.maxBatches && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.maxBatches}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum number of batches (leave empty for unlimited)
                    </p>
                  </div> */}
                </div>

                <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                  <p className="text-xs text-gray-700">
                    <strong>How it works:</strong>
                    <br />• First {formData.firstBatchSize} tasks unlock
                    sequentially
                    <br />• After {formData.firstBatchSize} tasks, coins
                    accumulate in Coin Box
                    <br />• User transfers coins → Next {
                      formData.nextBatchSize
                    }{" "}
                    tasks unlock
                    <br />• Process repeats for each batch
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable this rule
                  </span>
                </label>
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                {progressionRule ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
