import React, { useState } from "react";
import { BalanceTierSection } from "./BalanceTierSection";
import { ActivitySummarySection } from "./ActivitySummarySection";
import { ConfirmationModal } from "./ConfirmationModal";
import { InputModal } from "./InputModal";
import SuspendUserModal from "./SuspendUserModal";
import { showSuccessNotification, showErrorNotification, showInfoNotification } from "./NotificationSystem";

export const UserDetailsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, action: null, data: {} });
  const [inputModal, setInputModal] = useState({ isOpen: false, action: null, data: {} });
  const [showSuspendModal, setShowSuspendModal] = useState(false);

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
    { label: "Country/Region (IP Signup)", value: user?.signupCountry || user?.country || "France" },
    { label: "Current Location", value: user?.location || "Lyon, France" },
    { label: "Device Type", value: user?.device || "Android – Samsung Galaxy M13" },
    { label: "App Version", value: user?.appVersion || "1.1.3.7" },
    { label: "Current Account Status", value: user?.accountStatus || user?.status || "Active", isBadge: true },
    { label: "Face Verification Status", value: user?.faceVerification || "Verified", isVerification: true },
    { label: "Last Active Timestamp", value: user?.lastActive || "12:08 AM on May 23, 2025" },
    { label: "Last Login IP Address", value: user?.lastLoginIp || user?.ipAddress || "182.77.56.14" },
    { label: "Last Login Location", value: user?.lastLoginLocation || "Lyon, France" },
    { label: "Member Since", value: user?.memberSince || "January 12, 2025" },
  ];

  // Filtered actions per requirements - exclude Ban/Restore/Delete
  const actionButtons = [
    { text: "Reset Password", bgColor: "bg-blue-600 hover:bg-blue-700", action: "resetPassword" },
    { text: "Change Tier", bgColor: "bg-purple-600 hover:bg-purple-700", action: "changeTier" },
    { text: "Send Notification", bgColor: "bg-green-600 hover:bg-green-700", action: "sendNotification" },
    { text: "Suspend Account", bgColor: "bg-red-600 hover:bg-red-700", action: "suspend" },
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
        setShowSuspendModal(true);
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
          // This case is now handled by the SuspendUserModal
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

  const handleConfirmSuspend = async (suspendData) => {
    try {
      // Here you would typically make an API call to suspend the user
      console.log('Suspending user from details section:', suspendData);
      
      // Show success message
      showSuccessNotification(`User ${user?.name || 'account'} has been suspended`);
      
      setShowSuspendModal(false);
      
      // In a real app, you might want to redirect or refresh the page
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error; // Re-throw to let the modal handle the error
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
                ) : field.isBadge ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    field.value === 'Active' ? 'bg-green-100 text-green-800' : 
                    field.value === 'Inactive' ? 'bg-red-100 text-red-800' :
                    field.value === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {field.value}
                  </span>
                ) : field.isVerification ? (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      field.value === 'Verified' || field.value === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {field.value === 'Verified' || field.value === 'Yes' ? (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {field.value}
                    </span>
                  </div>
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

      {/* Suspend User Modal */}
      <SuspendUserModal
        user={user}
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onSuspend={handleConfirmSuspend}
      />
    </section>
  );
};