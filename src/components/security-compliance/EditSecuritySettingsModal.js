"use client";

import { useState, useEffect } from "react";

const VERIFICATION_METHODS = [
  { value: "native", label: "Native" },
  { value: "hybrid", label: "Hybrid" },
  { value: "third_party", label: "Third Party" },
];

const RETRY_TYPES = [
  { value: "otp", label: "OTP" },
  { value: "biometric", label: "Biometric" },
  { value: "pin", label: "PIN" },
];

const USER_ROLES = [
  { value: "player", label: "Player" },
  { value: "admin", label: "Admin" },
  { value: "vip", label: "VIP" },
  { value: "guest", label: "Guest" },
  { value: "premium", label: "Premium" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

export default function EditSecuritySettingsModal({
  isOpen,
  onClose,
  onSave,
  securitySetting,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    verificationMethod: "native",
    retryType: "otp",
    retryLimit: 3,
    lockDuration: 10,
    userRole: "player",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  // Update form data when securitySetting changes
  useEffect(() => {
    if (securitySetting) {
      setFormData({
        name: securitySetting.name || "",
        verificationMethod: securitySetting.verificationMethod || "native",
        retryType: securitySetting.retryType || "otp",
        retryLimit: securitySetting.retryLimit || 3,
        lockDuration: securitySetting.lockDuration || 10,
        userRole: securitySetting.userRole || "player",
        status: securitySetting.status || "active",
      });
    }
  }, [securitySetting]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.retryLimit < 1 || formData.retryLimit > 10) {
      newErrors.retryLimit = "Retry limit must be between 1 and 10";
    }

    if (formData.lockDuration < 1) {
      newErrors.lockDuration = "Lock duration must be at least 1 minute";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave?.(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update security settings:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Security Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter security settings name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Verification Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.verificationMethod}
              onChange={(e) =>
                handleInputChange("verificationMethod", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
            >
              {VERIFICATION_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Retry Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.retryType}
                onChange={(e) => handleInputChange("retryType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
              >
                {RETRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.retryLimit}
                onChange={(e) =>
                  handleInputChange("retryLimit", parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.retryLimit ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="3"
              />
              {errors.retryLimit && (
                <p className="mt-1 text-sm text-red-600">{errors.retryLimit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lock Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.lockDuration}
                onChange={(e) =>
                  handleInputChange("lockDuration", parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.lockDuration ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="10"
              />
              {errors.lockDuration && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lockDuration}
                </p>
              )}
            </div>
          </div>

          {/* User Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.userRole}
                onChange={(e) => handleInputChange("userRole", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
              >
                {USER_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center space-x-2"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <span>{loading ? "Updating..." : "Update Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
