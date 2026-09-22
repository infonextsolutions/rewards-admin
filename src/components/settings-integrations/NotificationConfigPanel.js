'use client';

import { useState, useEffect } from 'react';
import { NOTIFICATION_TYPES, EVENT_CATEGORIES } from '../../data/notifications';
import NotificationTypeSelector from './components/NotificationTypeSelector';

export default function NotificationConfigPanel({
  notificationSettings,
  firebaseFeatures,
  triggerEvents,
  notificationRoles,
  loading,
  onUpdateSettings,
  onToggleFirebaseFeature,
  onShowNotification
}) {
  // Form state - simplified to match requirements
  const [formData, setFormData] = useState({
    notificationType: 'email',
    recipientRoles: [],
    triggerEvents: [],
    slackWebhookUrl: ''
  });

  // Initialize form data
  useEffect(() => {
    if (notificationSettings) {
      setFormData({
        notificationType: notificationSettings.email.enabled ? 'email' : 'slack',
        recipientRoles: ['admin'], // Default role
        triggerEvents: notificationSettings.email.events || [],
        slackWebhookUrl: notificationSettings.slack.webhookUrl || ''
      });
    }
  }, [notificationSettings]);

  // Handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      recipientRoles: prev.recipientRoles.includes(roleValue)
        ? prev.recipientRoles.filter(r => r !== roleValue)
        : [...prev.recipientRoles, roleValue]
    }));
  };

  const handleEventToggle = (eventValue) => {
    setFormData(prev => ({
      ...prev,
      triggerEvents: prev.triggerEvents.includes(eventValue)
        ? prev.triggerEvents.filter(e => e !== eventValue)
        : [...prev.triggerEvents, eventValue]
    }));
  };

  const handleSaveNotificationSettings = async () => {
    try {
      const settings = {
        notificationType: formData.notificationType,
        recipientRoles: formData.recipientRoles,
        triggerEvents: formData.triggerEvents,
        slackWebhookUrl: formData.slackWebhookUrl
      };

      const result = await onUpdateSettings(settings);
      if (result.success) {
        onShowNotification('Notification settings saved successfully!');
      }
    } catch (error) {
      onShowNotification('Failed to save notification settings', 'error');
    }
  };

  const handleToggleFirebase = async (featureKey) => {
    try {
      const result = await onToggleFirebaseFeature(featureKey);
      if (result.success) {
        const feature = firebaseFeatures.find(f => f.key === featureKey);
        const newStatus = feature?.enabled ? 'disabled' : 'enabled';
        onShowNotification(`Firebase ${feature?.label} ${newStatus} successfully!`);
      }
    } catch (error) {
      onShowNotification('Failed to toggle Firebase feature', 'error');
    }
  };

  return (
    <div className="space-y-8">

      {/* Trigger Events - Simple Dropdown */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="text-xl mr-2">⚡</span>
            Trigger Events
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select which events should trigger notifications
          </p>
        </div>

        <div>
          <label htmlFor="triggerEvent" className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Event
          </label>
          <select
            id="triggerEvent"
            value={formData.triggerEvents[0] || ''}
            onChange={(e) => handleFormChange('triggerEvents', e.target.value ? [e.target.value] : [])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select an event</option>
            <option value="cashout_failure">Cashout Failure</option>
            <option value="cashout_completed">Cashout Completed</option>
            <option value="integration_failure">Integration Failure</option>
            <option value="system_error">System Error</option>
            <option value="survey_completed">Survey Completed</option>
            <option value="reward_issued">Reward Issued</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            // Reset form to initial state
            setFormData({
              notificationType: 'email',
              recipientRoles: [],
              triggerEvents: [],
              slackWebhookUrl: '',
              emailEnabled: true,
              slackEnabled: false
            });
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleSaveNotificationSettings}
          disabled={loading}
          className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </div>
  );
}