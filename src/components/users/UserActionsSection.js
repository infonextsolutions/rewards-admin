import React, { useState } from "react";
import Image from 'next/image';
import userAPIs from '../../data/users/userAPI';
import toast from 'react-hot-toast';
import { InputModal } from './InputModal';

export const UserActionsSection = ({ user }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenNotificationModal = () => {
    setShowNotificationModal(true);
  };

  const handleSendNotification = async (message) => {
    setLoading(true);
    try {
      const response = await userAPIs.sendNotification(
        user.id,
        message,
        'info'
      );

      if (response.success) {
        toast.success(response.message || 'Notification sent successfully');
        setIsNotificationSent(true);
        setTimeout(() => setIsNotificationSent(false), 2000);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="flex flex-col items-center gap-6 relative"
      role="region"
      aria-labelledby="user-profile"
    >
      <Image
        className="relative w-[130px] h-[130px] object-cover rounded-full border-4 border-white shadow-sm"
        alt={`${user?.name || 'User'}'s profile picture`}
        src={user?.avatar || "https://c.animaapp.com/6mo0E72h/img/avatar.svg"}
        width={130}
        height={130}
        unoptimized
      />

      <div className="text-center">
        <h2
          id="user-profile"
          className="relative font-semibold text-gray-900 text-2xl mb-4"
        >
          {user?.name || 'Nick Johnson'}
        </h2>

        <div
          className="inline-flex h-[32px] items-center justify-center gap-2 px-4 py-1 bg-green-100 rounded-[20px] mb-6"
          role="status"
          aria-label="User status"
        >
          <span className="font-medium text-green-700 text-sm">
            {user?.status || 'Active'}
          </span>
        </div>

        <div>
          <button
            className="inline-flex h-[40px] items-center justify-center gap-2 px-6 py-2 bg-teal-600 rounded-full cursor-pointer transition-colors duration-200 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
            onClick={handleOpenNotificationModal}
            disabled={isNotificationSent || loading}
            aria-label={`Send notification to ${user?.name || 'user'}`}
          >
            {loading ? "Sending..." : isNotificationSent ? "Sent!" : "Send Notification"}
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <InputModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSubmit={handleSendNotification}
        title="Send Notification"
        message={`Enter a custom notification message for ${user?.name || 'this user'}:`}
        type="textarea"
        placeholder="Type your notification message here..."
        submitText="Send"
        cancelText="Cancel"
      />
    </section>
  );
};