'use client';

import { useState } from 'react';

export default function SDKTable({ sdks, onEdit, onToggleStatus, onPreviewAudience }) {
  const [loadingStates, setLoadingStates] = useState({});

  const handleToggleStatus = async (sdkId) => {
    setLoadingStates(prev => ({ ...prev, [sdkId]: true }));
    try {
      await onToggleStatus(sdkId);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sdkId]: false }));
    }
  };

  const getStatusBadge = (status, isActive) => {
    if (!isActive) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Error': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SDK Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Configuration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Audience
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
            {sdks.map((sdk) => (
              <tr key={sdk.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{sdk.name}</div>
                    <div className="text-sm text-gray-500">{sdk.displayName}</div>
                    <div className="text-sm text-gray-600 mt-1">{sdk.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Max Users:</span> {sdk.maxDailyUsers || 'Unlimited'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Endpoint:</span>
                      <div className="text-xs text-gray-500 break-all">{sdk.endpointUrl}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Age:</span> {sdk.segmentRules.ageRange.min}-{sdk.segmentRules.ageRange.max}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Countries:</span> {sdk.segmentRules.countries.join(', ')}
                    </div>
                    <button
                      onClick={() => onPreviewAudience(sdk)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Preview ({sdk.previewAudienceCount.toLocaleString()} users)
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(sdk.status, sdk.isActive)}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sdk.isActive}
                        onChange={() => handleToggleStatus(sdk.id)}
                        disabled={loadingStates[sdk.id]}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full shadow-inner transition-colors relative ${
                        sdk.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                      } ${loadingStates[sdk.id] ? 'opacity-50' : ''}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in-out ${
                          sdk.isActive ? 'translate-x-5 bg-white' : 'translate-x-0.5 bg-white'
                        }`} />
                      </div>
                    </label>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(sdk.lastUpdated)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(sdk)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}