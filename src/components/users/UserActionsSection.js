import React, { useState } from "react";
import userAPIs from "../../data/users/userAPI";
import toast from "react-hot-toast";
import { InputModal } from "./InputModal";

export const UserActionsSection = ({ user }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Clean avatar URL - remove leading "=" if present and fix protocol
  const getCleanedAvatar = (avatar) => {
    if (!avatar)
      return (
        "/api/proxy-image?url=" +
        encodeURIComponent("https://c.animaapp.com/6mo0E72h/img/avatar.svg")
      );
    let cleaned = avatar.trim();
    
    // Remove leading "=" if present
    if (cleaned.startsWith("=")) {
      cleaned = cleaned.substring(1);
    }
    
    // Fix malformed protocol (https:/ -> https://)
    if (cleaned.startsWith("https:/") && !cleaned.startsWith("https://")) {
      cleaned = cleaned.replace("https:/", "https://");
    }
    
    // Ensure it's a valid absolute URL
    if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
      // If it's a relative URL, return default
      return (
        "/api/proxy-image?url=" +
        encodeURIComponent("https://c.animaapp.com/6mo0E72h/img/avatar.svg")
      );
    }
    
    // Use proxy route for backend images to avoid CORS issues
    const finalUrl =
      cleaned || "https://c.animaapp.com/6mo0E72h/img/avatar.svg";
    return "/api/proxy-image?url=" + encodeURIComponent(finalUrl);
  };

  const handleOpenNotificationModal = () => {
    setShowNotificationModal(true);
  };

  const handleSendNotification = async (message) => {
    setLoading(true);
    try {
      const response = await userAPIs.sendNotification(
        user.id,
        message,
        "info"
      );

      if (response.success) {
        toast.success(response.message || "Notification sent successfully");
        setIsNotificationSent(true);
        setTimeout(() => setIsNotificationSent(false), 2000);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="flex flex-col items-start gap-6 relative -ml-2"
      role="region"
      aria-labelledby="user-profile"
    >
      {/* Use regular img tag to avoid CORS issues with external domains */}
      {imageError || !user?.avatar ? (
        <div className="relative w-[100px] h-[100px] rounded-full border-4 border-white shadow-sm bg-gray-200 flex items-center justify-center -ml-1">
          <span className="text-3xl font-semibold text-gray-500">
            {(user?.name || "U")[0].toUpperCase()}
          </span>
        </div>
      ) : (
        <img
          className="relative w-[100px] h-[100px] object-cover rounded-full border-4 border-white shadow-sm -ml-1"
        alt={`${user?.name || "User"}'s profile picture`}
        src={getCleanedAvatar(user?.avatar)}
          onError={() => setImageError(true)}
      />
      )}

      <div className="text-left">
        <div className="flex items-center gap-3 mb-6">
          <h2
            id="user-profile"
            className="relative font-semibold text-gray-900 text-2xl"
          >
            {user?.name || "Nick Johnson"}
          </h2>

          <div
            className="inline-flex h-[32px] items-center justify-center gap-2 px-4 py-1 bg-green-100 rounded-[20px]"
            role="status"
            aria-label="User status"
          >
            <span className="font-medium text-green-700 text-sm">
              {user?.status || "Active"}
            </span>
          </div>
        </div>

        <div>
          <button
            className="inline-flex h-[40px] items-center justify-center gap-2 px-6 py-2 bg-teal-600 rounded-full cursor-pointer transition-colors duration-200 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
            onClick={handleOpenNotificationModal}
            disabled={isNotificationSent || loading}
            aria-label={`Send notification to ${user?.name || "user"}`}
          >
            {loading
              ? "Sending..."
              : isNotificationSent
              ? "Sent!"
              : "Send Notification"}
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <InputModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSubmit={handleSendNotification}
        title="Send Notification"
        message={`Enter a custom notification message for ${
          user?.name || "this user"
        }:`}
        type="textarea"
        placeholder="Type your notification message here..."
        submitText="Send"
        cancelText="Cancel"
      />
    </section>
  );
};
