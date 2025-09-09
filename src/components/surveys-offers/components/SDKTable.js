'use client';

import { useState } from 'react';
import { SEGMENT_OPTIONS } from '../../../data/surveys/surveyData';

export default function SDKTable({ sdks, onEdit, onToggleStatus, onPreviewAudience, onUpdateSegmentRule }) {
  const [loadingStates, setLoadingStates] = useState({});
  const [editingSegment, setEditingSegment] = useState({});

  const handleToggleStatus = async (sdkId) => {
    setLoadingStates(prev => ({ ...prev, [sdkId]: true }));
    try {
      await onToggleStatus(sdkId);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sdkId]: false }));
    }
  };

  const getStatusBadge = (status, isActive) => {
    // Determine actual status based on isActive flag
    const actualStatus = isActive ? 'Active' : 'Inactive';
    
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Error': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[actualStatus] || 'bg-gray-100 text-gray-800'}`}>
        {actualStatus}
      </span>
    );
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SDK Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SDK Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Display Name (FE)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SDK Key/Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Daily Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Segment Rule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview Audience
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
                  <div className="font-medium text-gray-900">{sdk.name}</div>
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
                  <div className="text-sm text-gray-900">{sdk.displayName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 font-mono">•••••••••{sdk.apiKey.slice(-4)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{sdk.maxDailyUsers || 'Unlimited'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {/* Age Range Dropdown */}
                    <div>
                      <select
                        value={`${sdk.segmentRules.ageRange.min}-${sdk.segmentRules.ageRange.max}`}
                        onChange={(e) => {
                          const [min, max] = e.target.value.split('-').map(Number);
                          onUpdateSegmentRule && onUpdateSegmentRule(sdk.id, {
                            ...sdk.segmentRules,
                            ageRange: { min, max }
                          });
                        }}
                        className="text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {SEGMENT_OPTIONS.ageRanges.map((range) => (
                          <option key={range.label} value={`${range.value.min}-${range.value.max}`}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Countries Dropdown */}
                    <div>
                      <select
                        multiple
                        value={sdk.segmentRules.countries}
                        onChange={(e) => {
                          const selectedCountries = Array.from(e.target.selectedOptions, option => option.value);
                          onUpdateSegmentRule && onUpdateSegmentRule(sdk.id, {
                            ...sdk.segmentRules,
                            countries: selectedCountries
                          });
                        }}
                        className="text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-16"
                      >
                        {SEGMENT_OPTIONS.countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Gender Dropdown */}
                    <div>
                      <select
                        value={sdk.segmentRules.gender}
                        onChange={(e) => {
                          onUpdateSegmentRule && onUpdateSegmentRule(sdk.id, {
                            ...sdk.segmentRules,
                            gender: e.target.value
                          });
                        }}
                        className="text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {SEGMENT_OPTIONS.genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onPreviewAudience(sdk)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View ({sdk.previewAudienceCount.toLocaleString()})
                  </button>
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