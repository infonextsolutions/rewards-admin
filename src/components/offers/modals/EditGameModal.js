'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SDK_PROVIDERS = ['BitLabs', 'AdGem', 'OfferToro', 'AdGate', 'RevenueUniverse', 'Pollfish'];
const COUNTRIES = ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'];
const STATUS_TYPES = ['Active', 'Inactive', 'Testing', 'Paused'];

export default function EditGameModal({ isOpen, onClose, game, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    sdk: 'BitLabs',
    xptrRules: '',
    taskCount: 0,
    activeTasks: 0,
    countries: ['US'],
    status: 'Active',
    rewardXP: 0,
    rewardCoins: 0,
    adSupported: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || '',
        sdk: game.sdk || 'BitLabs',
        xptrRules: game.xptrRules || '',
        taskCount: game.taskCount || 0,
        activeTasks: game.activeTasks || 0,
        countries: game.countries || ['US'],
        status: game.status || 'Active',
        rewardXP: game.rewardXP || 0,
        rewardCoins: game.rewardCoins || 0,
        adSupported: game.adSupported || false
      });
    } else {
      setFormData({
        title: '',
        sdk: 'BitLabs',
        xptrRules: '',
        taskCount: 0,
        activeTasks: 0,
        countries: ['US'],
        status: 'Active',
        rewardXP: 0,
        rewardCoins: 0,
        adSupported: false
      });
    }
    setErrors({});
  }, [game, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCountryChange = (country) => {
    setFormData(prev => {
      const current = prev.countries;
      const updated = current.includes(country)
        ? current.filter(c => c !== country)
        : [...current, country];
      return {
        ...prev,
        countries: updated
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Game title is required';
    }
    if (!formData.xptrRules.trim()) {
      newErrors.xptrRules = 'XPTR rules are required';
    }
    if (formData.countries.length === 0) {
      newErrors.countries = 'At least one country must be selected';
    }
    if (formData.activeTasks > formData.taskCount) {
      newErrors.activeTasks = 'Active tasks cannot exceed total task count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        id: game?.id || `GAME${Date.now()}`,
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

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full z-50">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {game ? 'Edit Game' : 'Create New Game'}
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
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Game Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Enter game title"
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SDK Provider *
                  </label>
                  <select
                    value={formData.sdk}
                    onChange={(e) => handleInputChange('sdk', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {SDK_PROVIDERS.map(sdk => (
                      <option key={sdk} value={sdk}>{sdk}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XPTR Rules *
                  </label>
                  <textarea
                    value={formData.xptrRules}
                    onChange={(e) => handleInputChange('xptrRules', e.target.value)}
                    rows={3}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.xptrRules ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Describe the completion rules for this game"
                  />
                  {errors.xptrRules && <p className="mt-1 text-xs text-red-600">{errors.xptrRules}</p>}
                </div>
              </div>
            </div>

            {/* Task Configuration */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Task Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Tasks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.taskCount}
                    onChange={(e) => handleInputChange('taskCount', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Tasks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.taskCount}
                    value={formData.activeTasks}
                    onChange={(e) => handleInputChange('activeTasks', parseInt(e.target.value) || 0)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.activeTasks ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                  />
                  {errors.activeTasks && <p className="mt-1 text-xs text-red-600">{errors.activeTasks}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {STATUS_TYPES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Countries & Rewards */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Targeting & Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Countries *
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {COUNTRIES.map(country => (
                      <label key={country} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.countries.includes(country)}
                          onChange={() => handleCountryChange(country)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{country}</span>
                      </label>
                    ))}
                  </div>
                  {errors.countries && <p className="mt-1 text-xs text-red-600">{errors.countries}</p>}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        XP Reward
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.rewardXP}
                        onChange={(e) => handleInputChange('rewardXP', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.adSupported}
                        onChange={(e) => handleInputChange('adSupported', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ad Supported</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {game ? 'Update Game' : 'Create Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}