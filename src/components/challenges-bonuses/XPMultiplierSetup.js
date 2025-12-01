"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function XPMultiplierSetup({
  multipliers = [],
  onAddMultiplier,
  onUpdateMultiplier,
  onDeleteMultiplier,
  onToggleActive,
  loading = false,
}) {
  const XP_TIERS = [
    { value: "JUNIOR", label: "Junior" },
    { value: "MID", label: "Mid" },
    { value: "SENIOR", label: "Senior" },
  ];

  const [showModal, setShowModal] = useState(false);
  const [editingMultiplier, setEditingMultiplier] = useState(null);
  const [formData, setFormData] = useState({
    tier: "",
    multiplier: "",
    active: true,
  });
  const [errors, setErrors] = useState({});

  // Reset form
  const resetForm = () => {
    setFormData({
      tier: "",
      multiplier: "",
      active: true,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tier) {
      newErrors.tier = "XP Tier is required";
    }

    if (!formData.multiplier || formData.multiplier <= 0) {
      newErrors.multiplier = "Multiplier must be greater than 0";
    }

    // Check for duplicate tier configuration (excluding currently editing item)
    const existingForTier = multipliers.find(
      (m) => m.tier === formData.tier && m.id !== editingMultiplier?.id
    );
    if (existingForTier) {
      newErrors.tier = "A multiplier for this XP Tier already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const multiplierData = {
      multiplier: parseFloat(formData.multiplier),
      active: formData.active,
      tier: formData.tier,
    };

    // If creating and a config already exists for this tier, open it in edit mode instead
    if (!editingMultiplier) {
      const existingForTier = multipliers.find((m) => m.tier === formData.tier);
      if (existingForTier) {
        handleEdit(existingForTier);
        return;
      }
    }

    try {
      if (editingMultiplier) {
        await onUpdateMultiplier(editingMultiplier.id, multiplierData);
      } else {
        await onAddMultiplier(multiplierData);
      }
      resetForm();
      setEditingMultiplier(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving multiplier:", error);
    }
  };

  const handleEdit = (multiplier) => {
    setEditingMultiplier(multiplier);
    setFormData({
      tier: multiplier.tier || "",
      multiplier: multiplier.multiplier?.toString() || "",
      active: multiplier.active ?? true,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await onToggleActive(id, !currentActive);
    } catch (error) {
      console.error("Error toggling multiplier status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this multiplier? This action cannot be undone."
      )
    ) {
      try {
        await onDeleteMultiplier(id);
      } catch (error) {
        console.error("Error deleting multiplier:", error);
      }
    }
  };

  const handleAddForTier = (tierValue) => {
    const existingForTier = multipliers.find((m) => m.tier === tierValue);
    if (existingForTier) {
      // If a config already exists for this tier, open it in edit mode
      handleEdit(existingForTier);
      return;
    }

    setEditingMultiplier(null);
    setFormData({
      tier: tierValue,
      multiplier: "",
      active: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const formatMultiplier = (value) => {
    if (value == null || value === "") return "-";
    return `${value}x`;
  };

  const formatLastUpdated = (multiplier) => {
    const updatedAt = multiplier.lastUpdatedAt || multiplier.updatedAt;
    const updatedBy = multiplier.lastUpdatedBy || multiplier.updatedBy;

    if (!updatedAt && !updatedBy) return "-";

    const date = updatedAt ? new Date(updatedAt) : null;
    const dateStr = date ? date.toLocaleString() : "";

    if (updatedBy && dateStr) return `${updatedBy} • ${dateStr}`;
    if (updatedBy) return updatedBy;
    return dateStr || "-";
  };

  const multipliersByTier = XP_TIERS.reduce((acc, tier) => {
    acc[tier.value] = multipliers.find((m) => m.tier === tier.value) || null;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                XP Multiplier Setup (Tier-Based)
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Configure global XP multipliers for each XP Tier. These values
                apply wherever XP is granted in the system.
              </p>
            </div>
          </div>
        </div>
        {/* Multipliers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP Multiplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {XP_TIERS.map((tier) => {
                const multiplier = multipliersByTier[tier.value];
                const hasConfig = !!multiplier;

                return (
                  <tr key={tier.value} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{tier.label}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hasConfig ? (
                        <span
                          className="font-medium text-emerald-600 cursor-help"
                          title={`Users in the ${tier.label} tier will earn ${multiplier.multiplier}x XP when this multiplier is active.`}
                        >
                          {formatMultiplier(multiplier.multiplier)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not configured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasConfig ? (
                        <button
                          onClick={() =>
                            handleToggleActive(multiplier.id, multiplier.active)
                          }
                          disabled={loading}
                          className={`inline-flex items-center justify-center min-w-[80px] px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            multiplier.active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {multiplier.active ? "Active" : "Inactive"}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {hasConfig ? (
                        <span
                          className="block max-w-xs truncate"
                          title={formatLastUpdated(multiplier)}
                        >
                          {formatLastUpdated(multiplier)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2 justify-end">
                        {hasConfig ? (
                          <>
                            <button
                              onClick={() => handleEdit(multiplier)}
                              className="text-emerald-600 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-50"
                              title="Edit multiplier"
                              disabled={loading}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(multiplier.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Delete multiplier"
                              disabled={loading}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAddForTier(tier.value)}
                            className="inline-flex items-center px-3 py-1.5 border border-dashed border-emerald-400 text-xs font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            title="Add multiplier for this tier"
                            disabled={loading}
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Add
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {multipliers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total configured tiers: {multipliers.length} | Active:{" "}
                {multipliers.filter((m) => m.active).length}
              </span>
              <span className="text-xs">
                Multipliers are applied globally on top of base XP values across
                all XP-granting features.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingMultiplier
                    ? "Edit XP Multiplier"
                    : "Add XP Multiplier"}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Configure the multiplier value and status for the selected XP
                  Tier.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMultiplier(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* XP Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  XP Tier *
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tier: e.target.value,
                    }))
                  }
                  disabled={!!editingMultiplier}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.tier ? "border-red-300" : "border-gray-300"
                  } bg-white`}
                >
                  <option value="" disabled>
                    Select XP Tier
                  </option>
                  {XP_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
                {errors.tier && (
                  <p className="mt-1 text-sm text-red-600">{errors.tier}</p>
                )}
              </div>

              {/* Multiplier Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Multiplier Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.multiplier}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        multiplier: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 pr-8 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.multiplier ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g. 1.50"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">x</span>
                  </div>
                </div>
                {errors.multiplier && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.multiplier}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-xs text-gray-500">
                    When inactive, the system will use the base XP value with no
                    multiplier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      active: !prev.active,
                    }))
                  }
                  className={`inline-flex items-center justify-center min-w-[80px] px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    formData.active
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {formData.active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingMultiplier(null);
                  resetForm();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingMultiplier ? "Save Changes" : "Save Multiplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
