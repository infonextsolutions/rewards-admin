'use client';

import { useState, useEffect } from 'react';
import { SEGMENT_OPTIONS } from '../../../data/surveys/surveyData';

export default function EditSDKModal({ isOpen, onClose, onSave, sdk }) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    apiKey: '',
    endpointUrl: '',
    maxDailyUsers: '',
    segmentRules: {
      ageRange: { min: 18, max: 65 },
      countries: [],
      gender: 'all'
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sdk && isOpen) {
      setFormData({
        name: sdk.name || '',
        displayName: sdk.displayName || '',
        description: sdk.description || '',
        apiKey: sdk.apiKey || '',
        endpointUrl: sdk.endpointUrl || '',
        maxDailyUsers: sdk.maxDailyUsers || '',
        segmentRules: {
          ageRange: sdk.segmentRules?.ageRange || { min: 18, max: 65 },
          countries: sdk.segmentRules?.countries || [],
          gender: sdk.segmentRules?.gender || 'all'
        }
      });
      setErrors({});
    }
  }, [sdk, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSegmentRuleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      segmentRules: {
        ...prev.segmentRules,
        [field]: value
      }
    }));
  };

  const handleAgeRangeChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      segmentRules: {
        ...prev.segmentRules,
        ageRange: {
          ...prev.segmentRules.ageRange,
          [type]: parseInt(value)
        }
      }
    }));
  };

  const handleCountryToggle = (countryCode) => {
    setFormData(prev => ({
      ...prev,
      segmentRules: {
        ...prev.segmentRules,
        countries: prev.segmentRules.countries.includes(countryCode)
          ? prev.segmentRules.countries.filter(c => c !== countryCode)
          : [...prev.segmentRules.countries, countryCode]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'SDK name is required';
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    if (!formData.apiKey.trim()) newErrors.apiKey = 'API key is required';
    if (!formData.endpointUrl.trim()) newErrors.endpointUrl = 'Endpoint URL is required';
    if (formData.segmentRules.countries.length === 0) newErrors.countries = 'At least one country must be selected';
    if (formData.segmentRules.ageRange.min >= formData.segmentRules.ageRange.max) {
      newErrors.ageRange = 'Minimum age must be less than maximum age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(sdk.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving SDK:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit SDK Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SDK Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Bitlabs"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name (Frontend) *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.displayName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Paid Surveys"
              />
              {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Brief description of the SDK"
            />
          </div>

          {/* API Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key/Token *
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.apiKey ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Secret API Key"
              />
              {errors.apiKey && <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Daily Users
              </label>
              <input
                type="number"
                value={formData.maxDailyUsers}
                onChange={(e) => handleInputChange('maxDailyUsers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endpoint URL *
            </label>
            <input
              type="url"
              value={formData.endpointUrl}
              onChange={(e) => handleInputChange('endpointUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.endpointUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://api.example.com/v1"
            />
            {errors.endpointUrl && <p className="mt-1 text-sm text-red-600">{errors.endpointUrl}</p>}
          </div>

          {/* Segment Rules */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Targeting Rules</h3>
            
            {/* Age Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.segmentRules.ageRange.min}
                    onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Min Age"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.segmentRules.ageRange.max}
                    onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Max Age"
                  />
                </div>
              </div>
              {errors.ageRange && <p className="mt-1 text-sm text-red-600">{errors.ageRange}</p>}
            </div>

            {/* Countries */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Countries *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {SEGMENT_OPTIONS.countries.map((country) => (
                  <label key={country.code} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.segmentRules.countries.includes(country.code)}
                      onChange={() => handleCountryToggle(country.code)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{country.label}</span>
                  </label>
                ))}
              </div>
              {errors.countries && <p className="mt-1 text-sm text-red-600">{errors.countries}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender Targeting
              </label>
              <select
                value={formData.segmentRules.gender}
                onChange={(e) => handleSegmentRuleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SEGMENT_OPTIONS.genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}