"use client";

import { useState, useEffect } from "react";
import BiometricSettingsScreen from "./BiometricSettingsScreen";
import GDPRLegalScreen from "./GDPRLegalScreen";
import SecuritySettingsList from "./SecuritySettingsList";
import EditSecuritySettingsModal from "./EditSecuritySettingsModal";
import { useSecuritySettings } from "../../hooks/useSecuritySettings";

const TABS = [
  // { id: "biometric", label: "Biometric & Retry Settings", icon: "🔐" },
  { id: "gdpr", label: "GDPR & Legal Compliance", icon: "📋" },
];

export default function SecurityComplianceModule({ userData = [] }) {
  const [activeTab, setActiveTab] = useState("gdpr");
  const [notification, setNotification] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);

  // Use the security settings hook
  const {
    securitySettings,
    loading,
    error,
    createSecuritySettings,
    updateSecuritySettings,
    deleteSecuritySettings,
    testSDKConnection,
    stats,
    setError,
  } = useSecuritySettings();

  // Handle saving biometric settings using real API
  const handleSaveBiometricSettings = async (data) => {
    try {
      const result = await createSecuritySettings({
        name: data.name || `${data.userRole} Security Settings`,
        verificationMethod: data.verificationMethod?.toLowerCase() || "native",
        retryType: data.retryType?.toLowerCase() || "otp",
        retryLimit: data.retryLimit || 3,
        lockDuration: data.lockDuration || 10,
        userRole: data.userRole?.toLowerCase() || "player",
        status: "active",
      });

      if (result.success) {
        setNotification({
          type: "success",
          message: "Biometric settings saved successfully!",
        });
      } else {
        setNotification({
          type: "error",
          message:
            result.error ||
            "Failed to save biometric settings. Please try again.",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to save biometric settings. Please try again.",
      });
      throw error;
    }
  };

  const handleSaveGDPRSettings = async (data) => {
    try {
      // For GDPR settings, we'll create a special security setting entry
      const result = await createSecuritySettings({
        name: "GDPR Compliance Settings",
        verificationMethod: "native",
        retryType: "otp",
        retryLimit: 3,
        lockDuration: 10,
        userRole: "player",
        status: "active",
      });

      if (result.success) {
        setNotification({
          type: "success",
          message: "GDPR settings saved successfully!",
        });
      } else {
        setNotification({
          type: "error",
          message:
            result.error || "Failed to save GDPR settings. Please try again.",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to save GDPR settings. Please try again.",
      });
      throw error;
    }
  };

  // Handle editing security settings
  const handleEditSecuritySettings = async (updateData) => {
    if (!selectedSetting) return;

    try {
      const result = await updateSecuritySettings(
        selectedSetting.id,
        updateData
      );

      if (result.success) {
        setNotification({
          type: "success",
          message: "Security settings updated successfully!",
        });
        setEditModalOpen(false);
        setSelectedSetting(null);
      } else {
        setNotification({
          type: "error",
          message:
            result.error ||
            "Failed to update security settings. Please try again.",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to update security settings. Please try again.",
      });
      throw error;
    }
  };

  // Handle opening edit modal
  const handleOpenEditModal = (setting) => {
    setSelectedSetting(setting);
    setEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedSetting(null);
  };

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "biometric":
        return (
          <div className="space-y-6">
            <SecuritySettingsList
              securitySettings={securitySettings}
              onEdit={handleOpenEditModal}
              onDelete={deleteSecuritySettings}
              loading={loading}
            />
            <BiometricSettingsScreen
              onSave={handleSaveBiometricSettings}
              onTestConnection={testSDKConnection}
            />
          </div>
        );
      case "gdpr":
        return (
          <GDPRLegalScreen
            onSave={handleSaveGDPRSettings}
            userData={userData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Security, Consent & Compliance
        </h1>
        <p className="text-gray-600 mt-1">
          Manage GDPR compliance and legal disclosures
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`rounded-lg p-4 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === "success"
                      ? "text-green-500 hover:bg-green-100"
                      : "text-red-500 hover:bg-red-100"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
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
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading security settings...</div>
            </div>
          )}

          {!loading && error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <svg
                    className="h-4 w-4"
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
          )}

          {!loading && !error && renderTabContent()}
        </div>
      </div>

      {/* Edit Security Settings Modal */}
      <EditSecuritySettingsModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleEditSecuritySettings}
        securitySetting={selectedSetting}
        loading={loading}
      />
    </div>
  );
}
