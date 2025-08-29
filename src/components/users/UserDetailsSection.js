import React, { useState } from "react";
import { BalanceTierSection } from "./BalanceTierSection";
import { ActivitySummarySection } from "./ActivitySummarySection";
import { ConfirmationModal } from "./ConfirmationModal";
import { InputModal } from "./InputModal";
import { showSuccessNotification, showErrorNotification, showInfoNotification } from "./NotificationSystem";

export const UserDetailsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, action: null, data: {} });
  const [inputModal, setInputModal] = useState({ isOpen: false, action: null, data: {} });

  const tabs = [
    { name: "Profile", active: true },
    { name: "Balance & Tier", active: false },
    { name: "Activity Summary", active: false },
  ];

  const userFields = [
    { label: "User ID", value: user?.userId || "USR-202589" },
    { label: "Full Name", value: user?.name || "Nick Johnson" },
    { label: "Email", value: user?.email || "nickjohson12@gmail.com", isEmail: true },
    { label: "Phone", value: user?.phone || "+33 6 45 32 19 87" },
    { label: "Registration Date", value: user?.registrationDate || "March 12, 2025" },
    { label: "Age Range", value: user?.age || "25–34" },
    { label: "Gender", value: user?.gender || "Male" },
    { label: "Country/Region", value: user?.country || "France" },
    { label: "Location", value: user?.location || "Lyon, France" },
    { label: "Device Type", value: user?.device || "Android – Samsung Galaxy M13" },
    { label: "App Version", value: user?.appVersion || "1.1.3.7" },
    { label: "Current State", value: user?.status || "Active" },
    { label: "Face Verification", value: user?.faceVerification || "Yes" },
    { label: "Last Active Date", value: user?.lastActive || "12:08 am on 23 May 2025" },
    { label: "IP Address", value: user?.ipAddress || "182.77.56.14 (Lyon, France)" },
    { label: "Member Since", value: user?.memberSince || "12 Jan 2025" },
  ];

  const actionButtons = [
    { text: "Reset Password", bgColor: "bg-blue-600 hover:bg-blue-700", action: "resetPassword" },
    { text: "Change Tier", bgColor: "bg-purple-600 hover:bg-purple-700", action: "changeTier" },
    { text: "Send Notification", bgColor: "bg-green-600 hover:bg-green-700", action: "sendNotification" },
    { text: "Suspend Account", bgColor: "bg-gray-600 hover:bg-gray-700", action: "suspend" },
    { text: "Delete User", bgColor: "bg-red-600 hover:bg-red-700", action: "delete" },
    { text: "Restore Account", bgColor: "bg-gray-400 hover:bg-gray-500", action: "restore" },
  ];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleActionClick = (action) => {
    switch (action) {
      case 'resetPassword':
        setConfirmationModal({
          isOpen: true,
          action: 'resetPassword',
          data: {
            title: 'Reset Password',
            message: `Send password reset email to ${user?.email || 'user email'}?`,
            type: 'info'
          }
        });
        break;
      case 'changeTier':
        setInputModal({
          isOpen: true,
          action: 'changeTier',
          data: {
            title: 'Change User Tier',
            message: 'Select the new tier for this user:',
            type: 'select',
            options: [
              { label: 'Bronze', value: 'Bronze' },
              { label: 'Silver', value: 'Silver' },
              { label: 'Gold', value: 'Gold' },
              { label: 'Premium', value: 'Premium' }
            ]
          }
        });
        break;
      case 'sendNotification':
        setInputModal({
          isOpen: true,
          action: 'sendNotification',
          data: {
            title: 'Send Notification',
            message: 'Enter the notification message to send to this user:',
            type: 'textarea',
            placeholder: 'Enter notification message...'
          }
        });
        break;
      case 'suspend':
        setConfirmationModal({
          isOpen: true,
          action: 'suspend',
          data: {
            title: 'Suspend User Account',
            message: `Are you sure you want to suspend ${user?.name || 'this user'}'s account? They will not be able to login until restored.`,
            type: 'warning'
          }
        });
        break;
      case 'delete':
        setConfirmationModal({
          isOpen: true,
          action: 'delete',
          data: {
            title: 'Delete User Account',
            message: `Are you sure you want to permanently delete ${user?.name || 'this user'}'s account? This action cannot be undone and will remove all user data.`,
            type: 'danger'
          }
        });
        break;
      case 'restore':
        setConfirmationModal({
          isOpen: true,
          action: 'restore',
          data: {
            title: 'Restore User Account',
            message: `Are you sure you want to restore ${user?.name || 'this user'}'s account? They will be able to login again.`,
            type: 'info'
          }
        });
        break;
      default:
        console.log(`${action} action clicked for user:`, user?.name);
    }
  };

  const handleConfirmAction = async (action) => {
    try {
      switch (action) {
        case 'resetPassword':
          console.log(`Sending password reset email to: ${user?.email || 'user email'}`);
          // TODO: API call to send password reset email
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          showSuccessNotification(`Password reset email sent to ${user?.email || 'user email'}`);
          break;
        case 'suspend':
          console.log(`Suspending user: ${user?.name || 'user'}`);
          // TODO: API call to suspend user
          await new Promise(resolve => setTimeout(resolve, 1000));
          showSuccessNotification(`User ${user?.name || 'account'} has been suspended`);
          break;
        case 'delete':
          console.log(`Deleting user: ${user?.name || 'user'}`);
          // TODO: API call to delete user
          await new Promise(resolve => setTimeout(resolve, 1000));
          showSuccessNotification(`User ${user?.name || 'account'} has been deleted`);
          break;
        case 'restore':
          console.log(`Restoring user: ${user?.name || 'user'}`);
          // TODO: API call to restore user
          await new Promise(resolve => setTimeout(resolve, 1000));
          showSuccessNotification(`User ${user?.name || 'account'} has been restored`);
          break;
        default:
          console.log(`Confirmed action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showErrorNotification(`Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}. Please try again.`);
    } finally {
      setConfirmationModal({ isOpen: false, action: null, data: {} });
    }
  };

  const handleInputAction = async (action, inputValue) => {
    try {
      switch (action) {
        case 'changeTier':
          console.log(`Changing user tier to: ${inputValue}`);
          // TODO: API call to update user tier
          await new Promise(resolve => setTimeout(resolve, 800));
          showSuccessNotification(`User tier changed to ${inputValue}`);
          break;
        case 'sendNotification':
          console.log(`Sending notification: ${inputValue}`);
          // TODO: API call to send push notification
          await new Promise(resolve => setTimeout(resolve, 500));
          showSuccessNotification(`Notification sent to ${user?.name || 'user'}`);
          showInfoNotification(`Message: "${inputValue}"`);
          break;
        default:
          console.log(`Input action: ${action}, value: ${inputValue}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showErrorNotification(`Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}. Please try again.`);
    } finally {
      setInputModal({ isOpen: false, action: null, data: {} });
    }
  };

  const renderTabContent = () => {
    if (activeTab === "Profile") {
      return (
        <div className="flex items-start gap-24 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-[30px] relative flex-1">
            {userFields.map((field, index) => (
              <div key={`label-${index}`} className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]">
                {field.label}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start gap-[30px] relative flex-1">
            {userFields.map((field, index) => (
              <div key={`value-${index}`} className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]">
                {field.isEmail ? (
                  <a
                    className="text-blue-600 hover:text-blue-800 underline"
                    href={`mailto:${field.value}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`Send email to ${field.value}`}
                  >
                    {field.value}
                  </a>
                ) : (
                  field.value
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (activeTab === "Balance & Tier") {
      return <BalanceTierSection user={user} />;
    } else if (activeTab === "Activity Summary") {
      return <ActivitySummarySection user={user} />;
    }
  };

  return (
    <section
      className="flex-1 space-y-8"
      role="main"
      aria-label="User Details"
    >
      {/* Tab Navigation */}
      <nav
        className="flex items-center gap-4"
        role="tablist"
        aria-label="User information tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab.name === activeTab
                ? "bg-yellow-100 border border-yellow-300 text-gray-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => handleTabClick(tab.name)}
            role="tab"
            aria-selected={tab.name === activeTab}
            aria-controls={`tabpanel-${tab.name.toLowerCase().replace(/\s+/g, "-")}`}
            tabIndex={tab.name === activeTab ? 0 : -1}
          >
            <span>{tab.name}</span>
            {tab.name === activeTab && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div
        className="min-h-[400px]"
        role="tabpanel"
        id={`tabpanel-${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
        aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {renderTabContent()}
      </div>

      {/* Action Buttons - Only show in Profile tab */}
      {activeTab === "Profile" && (
        <div
          className="flex items-center gap-4 pt-6 border-t border-gray-200"
          role="group"
          aria-label="User account actions"
        >
          {actionButtons.map((button) => (
            <button
              key={button.action}
              className={`px-6 py-2 rounded-full text-white text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-white ${button.bgColor}`}
              onClick={() => handleActionClick(button.action)}
              aria-label={`${button.text} for this user`}
            >
              {button.text}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, action: null, data: {} })}
        onConfirm={() => handleConfirmAction(confirmationModal.action)}
        title={confirmationModal.data.title}
        message={confirmationModal.data.message}
        type={confirmationModal.data.type}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ isOpen: false, action: null, data: {} })}
        onSubmit={(value) => handleInputAction(inputModal.action, value)}
        title={inputModal.data.title}
        message={inputModal.data.message}
        type={inputModal.data.type}
        options={inputModal.data.options}
        placeholder={inputModal.data.placeholder}
      />
    </section>
  );
};