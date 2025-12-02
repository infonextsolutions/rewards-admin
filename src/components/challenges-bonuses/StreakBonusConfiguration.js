'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function StreakBonusConfiguration({
  config = null,
  onSave,
  onCancel,
  loading = false
}) {
  const [milestones, setMilestones] = useState([
    { day: 7, active: true, rewardType: 'coins', rewardValue: 0, claimMode: 'auto' },
    { day: 14, active: true, rewardType: 'coins', rewardValue: 0, claimMode: 'auto' },
    { day: 21, active: true, rewardType: 'coins', rewardValue: 0, claimMode: 'auto' },
    { day: 30, active: true, rewardType: 'coins', rewardValue: 0, claimMode: 'auto' }
  ]);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize milestones from config when it loads
  useEffect(() => {
    if (config && config.milestones) {
      // Sort milestones by day to ensure correct order
      const sortedMilestones = [...config.milestones].sort((a, b) => a.day - b.day);
      setMilestones(sortedMilestones);
      setHasChanges(false);
    }
  }, [config]);

  const handleMilestoneChange = (day, field, value) => {
    setMilestones(prev => {
      const updated = prev.map(m => 
        m.day === day ? { ...m, [field]: value } : m
      );
      setHasChanges(true);
      return updated;
    });
    
    // Clear error for this field
    if (errors[`${day}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${day}_${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    milestones.forEach(milestone => {
      if (milestone.active) {
        if (!milestone.rewardValue || milestone.rewardValue < 0) {
          newErrors[`${milestone.day}_rewardValue`] = 'Reward value must be at least 0';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      await onSave({ milestones });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving streak bonus configuration:', error);
    }
  };

  const handleCancel = () => {
    // Reset to original config
    if (config && config.milestones) {
      const sortedMilestones = [...config.milestones].sort((a, b) => a.day - b.day);
      setMilestones(sortedMilestones);
    }
    setHasChanges(false);
    setErrors({});
    if (onCancel) onCancel();
  };

  const getRewardIcon = (rewardType) => {
    return rewardType === 'coins' ? '🪙' : '⭐';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                30-Day Streak Bonus Configuration
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Configure milestone rewards for users who maintain a continuous 30-day streak.
                This configuration is separate from Daily Challenge bonus days.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.day}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Day {milestone.day} Milestone
                  </h3>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-3 text-sm text-gray-700">
                        {milestone.active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={milestone.active}
                          onChange={(e) =>
                            handleMilestoneChange(milestone.day, 'active', e.target.checked)
                          }
                          className="sr-only"
                        />
                        <div
                          className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
                            milestone.active ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${
                              milestone.active ? 'transform translate-x-6' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {milestone.active && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Reward Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reward Type *
                      </label>
                      <select
                        value={milestone.rewardType}
                        onChange={(e) =>
                          handleMilestoneChange(milestone.day, 'rewardType', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="coins">Coins</option>
                        <option value="xp">XP</option>
                      </select>
                    </div>

                    {/* Reward Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reward Value *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={milestone.rewardValue}
                          onChange={(e) =>
                            handleMilestoneChange(
                              milestone.day,
                              'rewardValue',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className={`w-full px-3 py-2 pr-12 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors[`${milestone.day}_rewardValue`]
                              ? 'border-red-300'
                              : 'border-gray-300'
                          }`}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-500">
                          {getRewardIcon(milestone.rewardType)}
                        </span>
                      </div>
                      {errors[`${milestone.day}_rewardValue`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`${milestone.day}_rewardValue`]}
                        </p>
                      )}
                    </div>

                    {/* Claim Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Claim Mode *
                      </label>
                      <select
                        value={milestone.claimMode}
                        onChange={(e) =>
                          handleMilestoneChange(milestone.day, 'claimMode', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="watch_ad">Watch Ad</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {milestone.claimMode === 'auto'
                          ? 'Reward is automatically awarded'
                          : 'User must watch an ad to claim'}
                      </p>
                    </div>
                  </div>
                )}

                {!milestone.active && (
                  <div className="text-sm text-gray-500 italic">
                    This milestone is inactive and will be skipped by the streak logic.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How It Works
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Users must log in each day and complete at least one required game task to maintain the streak.
                    </li>
                    <li>
                      When a user reaches a configured milestone day, the system checks if the milestone is active and issues the reward based on the configured settings.
                    </li>
                    <li>
                      If a user misses a day, the streak resets to the last unlocked milestone (not to Day 0).
                    </li>
                    <li>
                      Only milestones marked as Active are processed by the streak logic.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

