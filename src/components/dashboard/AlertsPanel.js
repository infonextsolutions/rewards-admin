"use client";

import { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldExclamationIcon,
  CpuChipIcon,
  BanknotesIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const AlertsPanel = ({ alerts = [], loading = false, onRefresh }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id || alert.type));

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type, severity) => {
    const iconClass = `h-5 w-5 ${getSeverityColor(severity)}`;
    
    switch (type) {
      case 'pending_redemption':
        return <BanknotesIcon className={iconClass} />;
      case 'sdk_failure':
        return <CpuChipIcon className={iconClass} />;
      case 'fraud_alert':
        return <ShieldExclamationIcon className={iconClass} />;
      case 'system_error':
        return <XCircleIcon className={iconClass} />;
      default:
        return <ExclamationTriangleIcon className={iconClass} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const handleAlertClick = (alert) => {
    if (alert.actionUrl) {
      // In a real app, you'd use Next.js router
      window.location.href = alert.actionUrl;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            System Alerts
          </h3>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            System Alerts
          </h3>
          {visibleAlerts.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {visibleAlerts.length}
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
            title="Refresh alerts"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">All clear!</h3>
            <p className="mt-1 text-sm text-gray-500">
              No system alerts at this time.
            </p>
          </div>
        ) : (
          visibleAlerts.map((alert, index) => (
            <div
              key={alert.id || alert.type || index}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${getSeverityBg(alert.severity)} ${
                alert.actionUrl ? 'cursor-pointer hover:bg-opacity-80' : ''
              }`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.message}
                      </p>
                      {alert.count && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'high' || alert.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTimestamp(alert.timestamp)}
                      </p>
                      {alert.severity && (
                        <span className={`text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {alert.actionUrl && (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissAlert(alert.id || alert.type);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-white hover:bg-opacity-50"
                    title="Dismiss alert"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {visibleAlerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Alerts are updated every 5 minutes. Click on an alert to take action.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;