'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SDK_PROVIDERS = ['BitLabs', 'AdGem', 'OfferToro', 'AdGate', 'RevenueUniverse', 'Pollfish'];
const COUNTRIES = ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'];
const TIERS = ['Bronze', 'Silver', 'Gold'];

export default function EditOfferModal({ isOpen, onClose, offer, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    sdk: '',
    expiry: '',
    status: 'Active',
    tierAccess: [],
    countries: [],
    xptrRules: '',
    adOffer: false,
    rewardXP: 0,
    rewardCoins: 0,
    estimatedCompletion: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || '',
        sdk: offer.sdk || '',
        expiry: offer.expiry || '',
        status: offer.status || 'Active',
        tierAccess: offer.tierAccess || [],
        countries: offer.countries || [],
        xptrRules: offer.xptrRules || '',
        adOffer: offer.adOffer || false,
        rewardXP: offer.rewardXP || 0,
        rewardCoins: offer.rewardCoins || 0,
        estimatedCompletion: offer.estimatedCompletion || ''
      });
    } else {
      // Reset form for new offer
      setFormData({
        name: '',
        sdk: '',
        expiry: '',
        status: 'Active',
        tierAccess: [],
        countries: [],
        xptrRules: '',
        adOffer: false,
        rewardXP: 0,
        rewardCoins: 0,
        estimatedCompletion: ''
      });
    }
    setErrors({});
  }, [offer, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMultiSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Offer name is required';
    }
    if (!formData.sdk) {
      newErrors.sdk = 'SDK selection is required';
    }
    if (!formData.expiry) {
      newErrors.expiry = 'Expiry date is required';
    }
    if (!formData.xptrRules.trim()) {
      newErrors.xptrRules = 'XPTR rules are required';
    }
    if (formData.tierAccess.length === 0) {
      newErrors.tierAccess = 'At least one tier must be selected';
    }
    if (formData.countries.length === 0) {
      newErrors.countries = 'At least one country must be selected';
    }
    if (formData.rewardXP < 0 || formData.rewardCoins < 0) {
      newErrors.rewards = 'Rewards cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        id: offer?.id || `OFF${Date.now()}`,
        ...formData
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {offer ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter offer name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SDK Provider *
                  </label>
                  <select
                    value={formData.sdk}
                    onChange={(e) => handleInputChange('sdk', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.sdk ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select SDK</option>
                    {SDK_PROVIDERS.map(sdk => (
                      <option key={sdk} value={sdk}>{sdk}</option>
                    ))}
                  </select>
                  {errors.sdk && <p className="mt-1 text-xs text-red-600">{errors.sdk}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiry}
                    onChange={(e) => handleInputChange('expiry', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.expiry ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.expiry && <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* XPTR Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XPTR Rules *
              </label>
              <textarea
                value={formData.xptrRules}
                onChange={(e) => handleInputChange('xptrRules', e.target.value)}
                rows={3}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.xptrRules ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Describe the completion rules and requirements"
              />
              {errors.xptrRules && <p className="mt-1 text-xs text-red-600">{errors.xptrRules}</p>}
            </div>

            {/* Tier Access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier Access *
              </label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(tier => (
                  <label key={tier} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tierAccess.includes(tier)}
                      onChange={() => handleMultiSelectChange('tierAccess', tier)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tier}</span>
                  </label>
                ))}
              </div>
              {errors.tierAccess && <p className="mt-1 text-xs text-red-600">{errors.tierAccess}</p>}
            </div>

            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Countries *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COUNTRIES.map(country => (
                  <label key={country} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.countries.includes(country)}
                      onChange={() => handleMultiSelectChange('countries', country)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{country}</span>
                  </label>
                ))}
              </div>
              {errors.countries && <p className="mt-1 text-xs text-red-600">{errors.countries}</p>}
            </div>

            {/* Rewards */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rewardXP}
                    onChange={(e) => handleInputChange('rewardXP', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coins Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rewardCoins}
                    onChange={(e) => handleInputChange('rewardCoins', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Completion
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedCompletion}
                    onChange={(e) => handleInputChange('estimatedCompletion', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 15 min"
                  />
                </div>
              </div>
              {errors.rewards && <p className="mt-1 text-xs text-red-600">{errors.rewards}</p>}
            </div>

            {/* Ad Support */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="adOffer"
                checked={formData.adOffer}
                onChange={(e) => handleInputChange('adOffer', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="adOffer" className="ml-2 text-sm text-gray-700">
                This is an ad-supported offer
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {offer ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}