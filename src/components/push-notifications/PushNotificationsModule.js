'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import CampaignManager from './CampaignManager';
import ABTestingInterface from './ABTestingInterface';

const TABS = [
  { 
    id: 'campaigns', 
    label: 'Campaign Manager', 
    icon: '📢',
    description: 'Create, edit, schedule, and manage push notification campaigns'
  },
  { 
    id: 'ab-testing', 
    label: 'A/B Testing Interface', 
    icon: '🧪',
    description: 'Compare message variants and review A/B test performance'
  }
];

export default function PushNotificationsModule() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [notification, setNotification] = useState(null);

  const {
    campaigns,
    abTests,
    userSegments,
    ctaRouting,
    stats,
    loading,
    error,
    currentUserRole,
    permissions,
    campaignStatuses,
    campaignTypes,
    frequencyRules,
    ctaActions,
    segmentCategories,
    ctaCategories,
    gameConfigs,
    offerConfigs,
    filterCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    filterAbTests,
    createAbTest,
    calculateAudienceSize,
    clearError
  } = usePushNotifications();

  // Show notification helper
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Error handling
  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
      clearError();
    }
  }, [error, showNotification, clearError]);

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return (
          <CampaignManager
            campaigns={campaigns}
            stats={stats}
            userSegments={userSegments}
            ctaRouting={ctaRouting}
            campaignStatuses={campaignStatuses}
            campaignTypes={campaignTypes}
            frequencyRules={frequencyRules}
            ctaActions={ctaActions}
            segmentCategories={segmentCategories}
            ctaCategories={ctaCategories}
            gameConfigs={gameConfigs}
            offerConfigs={offerConfigs}
            permissions={permissions}
            loading={loading}
            filterCampaigns={filterCampaigns}
            onCreateCampaign={createCampaign}
            onUpdateCampaign={updateCampaign}
            onDeleteCampaign={deleteCampaign}
            onSendCampaign={sendCampaign}
            onCalculateAudienceSize={calculateAudienceSize}
            onShowNotification={showNotification}
          />
        );
      case 'ab-testing':
        return (
          <ABTestingInterface
            abTests={abTests}
            userSegments={userSegments}
            campaignStatuses={campaignStatuses}
            segmentCategories={segmentCategories}
            permissions={permissions}
            loading={loading}
            filterAbTests={filterAbTests}
            onCreateAbTest={createAbTest}
            onCalculateAudienceSize={calculateAudienceSize}
            onShowNotification={showNotification}
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
        <h1 className="text-3xl font-bold text-gray-900">Push Notification Center</h1>
        <p className="text-gray-600 mt-2">
          Create, manage, test, and track push notification campaigns with Firebase integration and A/B testing
        </p>
      </div>

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
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

        {/* Tab Description */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {TABS.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
