'use client';

import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, CalendarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import StreakBonusConfiguration from './StreakBonusConfiguration';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

export default function BonusDayConfiguration({
  bonusDays = [],
  onAddBonusDay,
  onUpdateBonusDay,
  onDeleteBonusDay,
  loading = false,
  // Streak bonus config props
  streakBonusConfig = null,
  onSaveStreakBonusConfig = null,
  loadingStreakConfig = false
}) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    bonusDay: '',
    rewards: [{ type: 'Coins', value: '' }],
    resetRule: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Toggles for Bonus Days section
  const [bonusDayConfigEnabled, setBonusDayConfigEnabled] = useState(true);
  const [streakBonusConfigEnabled, setStreakBonusConfigEnabled] = useState(false);
  const [showStreakConfig, setShowStreakConfig] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBonusDayId, setDeletingBonusDayId] = useState(null);

  const rewardTypes = ['Coins', 'XP'];

  const resetForm = () => {
    setFormData({
      bonusDay: '',
      rewards: [{ type: 'Coins', value: '' }],
      resetRule: true
    });
    setErrors({});
  };

  const addReward = () => {
    setFormData(prev => {
      // Maximum 2 rewards (Coins and XP)
      if (prev.rewards.length >= 2) return prev;
      
      // Determine which reward type to use for the new reward
      const existingTypes = prev.rewards.map(r => r.type);
      const newType = existingTypes.includes('Coins') ? 'XP' : 'Coins';
      
      return {
        ...prev,
        rewards: [...prev.rewards, { type: newType, value: '' }]
      };
    });
  };

  const removeReward = (rewardIndex) => {
    setFormData(prev => {
      // At least one reward must remain
      if (prev.rewards.length <= 1) return prev;
      
      return {
        ...prev,
        rewards: prev.rewards.filter((_, idx) => idx !== rewardIndex)
      };
    });
    
    // Clear errors for removed reward
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`reward_${rewardIndex}_type`];
      delete newErrors[`reward_${rewardIndex}_value`];
      return newErrors;
    });
  };

  const handleRewardChange = (rewardIndex, field, value) => {
    setFormData(prev => {
      const newRewards = [...prev.rewards];
      
      // If changing reward type, check for duplicates
      if (field === 'type') {
        const otherRewardTypes = prev.rewards
          .map((r, idx) => idx !== rewardIndex ? r.type : null)
          .filter(type => type !== null);
        
        // Prevent selecting a type that's already selected in another reward
        if (otherRewardTypes.includes(value)) {
          setErrors(prevErrors => ({
            ...prevErrors,
            [`reward_${rewardIndex}_type`]: 'This reward type is already selected'
          }));
          return prev; // Don't update if duplicate
        }
        
        // Clear error if valid
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[`reward_${rewardIndex}_type`];
          return newErrors;
        });
      }
      
      newRewards[rewardIndex] = { ...newRewards[rewardIndex], [field]: value };
      return { ...prev, rewards: newRewards };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bonusDay || formData.bonusDay < 1) {
      newErrors.bonusDay = 'Bonus day must be at least 1';
    }

    // Validate rewards
    if (!formData.rewards || formData.rewards.length === 0) {
      newErrors.rewards = 'At least one reward is required';
    } else {
      // Validate maximum 2 rewards
      if (formData.rewards.length > 2) {
        newErrors.rewards = 'Maximum 2 rewards allowed (Coins and XP)';
      }
      
      // Validate no duplicate reward types
      const rewardTypes = formData.rewards.map(r => r.type);
      const uniqueTypes = new Set(rewardTypes);
      if (rewardTypes.length !== uniqueTypes.size) {
        newErrors.rewards = 'Each reward type can only be selected once';
        formData.rewards.forEach((reward, idx) => {
          const typeCount = rewardTypes.filter(t => t === reward.type).length;
          if (typeCount > 1) {
            newErrors[`reward_${idx}_type`] = 'This reward type is already selected';
          }
        });
      }
      
      // Validate reward values
      let hasAtLeastOneValue = false;
      formData.rewards.forEach((reward, idx) => {
        if (reward.value && reward.value.toString().trim() !== '') {
          const value = parseInt(reward.value);
          if (isNaN(value) || value < 1) {
            newErrors[`reward_${idx}_value`] = 'Reward value must be at least 1';
          } else {
            hasAtLeastOneValue = true;
          }
        }
      });
      
      if (!hasAtLeastOneValue) {
        newErrors.rewards = 'At least one reward value must be provided';
      }
    }

    // Check for duplicate bonus days (excluding currently editing item)
    if (formData.bonusDay) {
      const dayNumber = parseInt(formData.bonusDay);
      if (!isNaN(dayNumber)) {
        const existingBonus = bonusDays.find(b =>
          b.bonusDay === dayNumber &&
          b.id !== editingId
        );
        if (existingBonus) {
          newErrors.bonusDay = `A bonus day for Day ${dayNumber} already exists`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate and get errors
    const newErrors = {};
    
    if (!formData.bonusDay || formData.bonusDay < 1) {
      newErrors.bonusDay = 'Bonus day must be at least 1';
    }

    // Validate rewards
    if (!formData.rewards || formData.rewards.length === 0) {
      newErrors.rewards = 'At least one reward is required';
    } else {
      // Validate maximum 2 rewards
      if (formData.rewards.length > 2) {
        newErrors.rewards = 'Maximum 2 rewards allowed (Coins and XP)';
      }
      
      // Validate no duplicate reward types
      const rewardTypes = formData.rewards.map(r => r.type);
      const uniqueTypes = new Set(rewardTypes);
      if (rewardTypes.length !== uniqueTypes.size) {
        newErrors.rewards = 'Each reward type can only be selected once';
      }
      
      // Validate reward values
      let hasAtLeastOneValue = false;
      formData.rewards.forEach((reward, idx) => {
        if (reward.value && reward.value.toString().trim() !== '') {
          const value = parseInt(reward.value);
          if (isNaN(value) || value < 1) {
            newErrors[`reward_${idx}_value`] = 'Reward value must be at least 1';
          } else {
            hasAtLeastOneValue = true;
          }
        }
      });
      
      if (!hasAtLeastOneValue) {
        newErrors.rewards = 'At least one reward value must be provided';
      }
    }

    // Check for duplicate bonus days (excluding currently editing item)
    if (formData.bonusDay) {
      const dayNumber = parseInt(formData.bonusDay);
      if (!isNaN(dayNumber)) {
        const existingBonus = bonusDays.find(b =>
          b.bonusDay === dayNumber &&
          b.id !== editingId
        );
        if (existingBonus) {
          newErrors.bonusDay = `A bonus day for Day ${dayNumber} already exists`;
        }
      }
    }

    // Set errors and show toast if validation fails
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Show toast for the most important error
      if (newErrors.bonusDay) {
        toast.error(newErrors.bonusDay);
      } else if (newErrors.rewards) {
        toast.error(newErrors.rewards);
      } else {
        // Show first error found
        const firstError = Object.values(newErrors)[0];
        if (firstError) {
          toast.error(firstError);
        }
      }
      return;
    }

    // Convert rewards array to the format expected by the API
    const rewards = formData.rewards
      .filter(r => r.value && r.value.toString().trim() !== '' && parseInt(r.value) > 0)
      .map(r => ({
        type: r.type,
        value: parseInt(r.value)
      }));

    // Extract coin and XP rewards for backward compatibility
    const coinReward = rewards.find(r => r.type === 'Coins');
    const xpReward = rewards.find(r => r.type === 'XP');

    const bonusDayData = {
      bonusDay: parseInt(formData.bonusDay),
      rewards: rewards,
      coinRewardType: coinReward ? 'Coins' : null,
      coinRewardValue: coinReward ? coinReward.value : null,
      xpRewardType: xpReward ? 'XP' : null,
      xpRewardValue: xpReward ? xpReward.value : null,
      resetRule: formData.resetRule
    };

    try {
      if (editingId) {
        await onUpdateBonusDay(editingId, bonusDayData);
        setEditingId(null);
      } else {
        await onAddBonusDay(bonusDayData);
        setShowAddForm(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving bonus day:', error);
    }
  };

  const handleEdit = (bonusDay) => {
    // Convert bonusDay data to rewards array format
    let rewards = [];
    
    // Check if bonusDay has rewards array (new format)
    if (bonusDay.rewards && Array.isArray(bonusDay.rewards) && bonusDay.rewards.length > 0) {
      rewards = bonusDay.rewards.map(r => ({
        type: r.type.charAt(0).toUpperCase() + r.type.slice(1), // Capitalize first letter
        value: r.value.toString()
      }));
    } else {
      // Convert from coinReward/xpReward format
      if (bonusDay.coinRewardValue) {
        rewards.push({
          type: bonusDay.coinRewardType || 'Coins',
          value: bonusDay.coinRewardValue.toString()
        });
      }
      if (bonusDay.xpRewardValue) {
        rewards.push({
          type: bonusDay.xpRewardType || 'XP',
          value: bonusDay.xpRewardValue.toString()
        });
      }
      
      // Fallback to legacy format
      if (rewards.length === 0 && bonusDay.rewardType && bonusDay.rewardValue) {
        rewards.push({
          type: bonusDay.rewardType,
          value: bonusDay.rewardValue.toString()
        });
        if (bonusDay.alternateReward) {
          rewards.push({
            type: bonusDay.rewardType === 'Coins' ? 'XP' : 'Coins',
            value: bonusDay.alternateReward.toString()
          });
        }
      }
    }
    
    // Ensure at least one reward exists
    if (rewards.length === 0) {
      rewards = [{ type: 'Coins', value: '' }];
    }

    setFormData({
      bonusDay: bonusDay.bonusDay.toString(),
      rewards: rewards,
      resetRule: bonusDay.resetRule
    });
    setEditingId(bonusDay.id);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const handleDelete = (id) => {
    setDeletingBonusDayId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBonusDayId) return;
    
    try {
      await onDeleteBonusDay(deletingBonusDayId);
      setShowDeleteModal(false);
      setDeletingBonusDayId(null);
      toast.success('Bonus day deleted successfully');
    } catch (error) {
      console.error('Error deleting bonus day:', error);
      toast.error('Failed to delete bonus day. Please try again.');
      // Don't close modal on error so user can retry
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingBonusDayId(null);
  };

  const getRewardIcon = (rewardType) => {
    switch (rewardType) {
      case 'Coins':
        return '🪙';
      case 'XP':
        return '⭐';
      default:
        return '💎';
    }
  };

  const sortedBonusDays = [...bonusDays].sort((a, b) => a.bonusDay - b.bonusDay);

  // If showing streak config, render that component
  if (showStreakConfig) {
    return (
      <div className="space-y-6">
        <StreakBonusConfiguration
          config={streakBonusConfig}
          onSave={async (data) => {
            if (onSaveStreakBonusConfig) {
              await onSaveStreakBonusConfig(data);
            }
          }}
          onCancel={() => setShowStreakConfig(false)}
          loading={loadingStreakConfig}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bonus Days Section Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bonus Days</h2>
            <p className="mt-1 text-sm text-gray-600">
              Configure bonus rewards for daily challenges and streak milestones
            </p>
          </div>
        </div>

        {/* Two Independent Toggles */}
        <div className="px-6 py-4 space-y-4 border-b border-gray-200">
          {/* Bonus Day Configuration Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Bonus Day Configuration</h3>
              <p className="mt-1 text-xs text-gray-600">
                Configure bonus rewards for normal Daily Challenge bonus days
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bonusDayConfigEnabled}
                onChange={(e) => setBonusDayConfigEnabled(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  bonusDayConfigEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    bonusDayConfigEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>

          {/* 30-Day Streak Bonus Configuration Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">30-Day Streak Bonus Configuration</h3>
              <p className="mt-1 text-xs text-gray-600">
                Configure milestone rewards for users who maintain a continuous 30-day streak
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={streakBonusConfigEnabled}
                onChange={(e) => setStreakBonusConfigEnabled(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  streakBonusConfigEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    streakBonusConfigEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>

          {/* CTA Button for Streak Configuration */}
          {streakBonusConfigEnabled && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowStreakConfig(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configure 30-Day Streak Bonus
              </button>
            </div>
          )}
        </div>

        {/* Bonus Day Configuration Content */}
        {bonusDayConfigEnabled && (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Daily Challenge Bonus Days</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure bonus rewards for milestone days (e.g., Day 7, Day 30) to boost user retention
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  disabled={showAddForm || editingId}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Bonus Day
                </button>
              </div>
            </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="space-y-4">
              <h3 className="text-md font-medium text-blue-900">Add New Bonus Day</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bonus Day *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.bonusDay}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({...formData, bonusDay: value});
                          // Clear error when user starts typing
                          if (errors.bonusDay) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.bonusDay;
                              return newErrors;
                            });
                          }
                          // Real-time validation for duplicate days
                          if (value) {
                            const dayNumber = parseInt(value);
                            if (!isNaN(dayNumber)) {
                              const existingBonus = bonusDays.find(b =>
                                b.bonusDay === dayNumber &&
                                b.id !== editingId
                              );
                              if (existingBonus) {
                                setErrors(prev => ({
                                  ...prev,
                                  bonusDay: `A bonus day for Day ${dayNumber} already exists`
                                }));
                                toast.error(`Day ${dayNumber} already exists`);
                              }
                            }
                          }
                        }}
                        className={`w-full px-3 py-2 pl-10 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${errors.bonusDay ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="7"
                      />
                      <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    {errors.bonusDay && (
                      <p className="mt-1 text-sm text-red-600">{errors.bonusDay}</p>
                    )}
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.resetRule}
                        onChange={(e) => setFormData({...formData, resetRule: e.target.checked})}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Reset streak on miss</span>
                    </label>
                  </div>
                </div>

                {/* Rewards Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rewards *
                    </label>
                    <button
                      type="button"
                      onClick={addReward}
                      disabled={formData.rewards.length >= 2}
                      className={`text-sm font-medium ${
                        formData.rewards.length >= 2
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                      title={formData.rewards.length >= 2 ? 'Maximum 2 rewards allowed (Coins and XP)' : 'Add Reward'}
                    >
                      + Add Reward
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.rewards.map((reward, rewardIndex) => {
                      const selectedTypes = formData.rewards
                        .map((r, idx) => idx !== rewardIndex ? r.type : null)
                        .filter(type => type !== null);
                      
                      return (
                        <div
                          key={rewardIndex}
                          className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-md"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Reward Type */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Reward Type
                              </label>
                              <select
                                value={reward.type}
                                onChange={(e) =>
                                  handleRewardChange(rewardIndex, 'type', e.target.value)
                                }
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                                  errors[`reward_${rewardIndex}_type`]
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                                }`}
                              >
                                {rewardTypes.map(type => {
                                  const isDisabled = selectedTypes.includes(type);
                                  return (
                                    <option 
                                      key={type} 
                                      value={type}
                                      disabled={isDisabled}
                                    >
                                      {type}
                                    </option>
                                  );
                                })}
                              </select>
                              {errors[`reward_${rewardIndex}_type`] && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors[`reward_${rewardIndex}_type`]}
                                </p>
                              )}
                            </div>

                            {/* Reward Value */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Reward Value
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={reward.value}
                                  onChange={(e) =>
                                    handleRewardChange(rewardIndex, 'value', e.target.value)
                                  }
                                  className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                                    errors[`reward_${rewardIndex}_value`]
                                      ? 'border-red-300'
                                      : 'border-gray-300'
                                  }`}
                                  placeholder="Enter value"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-500">
                                  {getRewardIcon(reward.type)}
                                </span>
                              </div>
                              {errors[`reward_${rewardIndex}_value`] && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors[`reward_${rewardIndex}_value`]}
                                </p>
                              )}
                            </div>
                          </div>
                          {formData.rewards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeReward(rewardIndex)}
                              className="mt-6 text-red-600 hover:text-red-700"
                              title="Remove reward"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {errors.rewards && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.rewards}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Bonus Day
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bonus Days Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rewards
                </th>
                {/* Alternate Reward column hidden */}
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alternate Reward
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reset Rule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBonusDays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No bonus days configured yet. Add your first bonus day to get started.
                  </td>
                </tr>
              ) : (
                sortedBonusDays.map((bonusDay) => (
                  <tr key={bonusDay.id} className="hover:bg-gray-50">
                    {editingId === bonusDay.id ? (
                      // Edit Row
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={formData.bonusDay}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData({...formData, bonusDay: value});
                                // Clear error when user starts typing
                                if (errors.bonusDay) {
                                  setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.bonusDay;
                                    return newErrors;
                                  });
                                }
                                // Real-time validation for duplicate days
                                if (value) {
                                  const dayNumber = parseInt(value);
                                  if (!isNaN(dayNumber)) {
                                    const existingBonus = bonusDays.find(b =>
                                      b.bonusDay === dayNumber &&
                                      b.id !== editingId
                                    );
                                    if (existingBonus) {
                                      setErrors(prev => ({
                                        ...prev,
                                        bonusDay: `A bonus day for Day ${dayNumber} already exists`
                                      }));
                                      toast.error(`Day ${dayNumber} already exists`);
                                    }
                                  }
                                }
                              }}
                              className={`w-20 px-2 py-1 pl-8 border rounded text-sm ${errors.bonusDay ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.bonusDay && (
                              <p className="mt-1 text-xs text-red-600">{errors.bonusDay}</p>
                            )}
                            <CalendarIcon className="h-4 w-4 text-gray-400 absolute left-2 top-1.5" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2 min-w-[300px]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600">Rewards</span>
                              <button
                                type="button"
                                onClick={addReward}
                                disabled={formData.rewards.length >= 2}
                                className={`text-xs font-medium ${
                                  formData.rewards.length >= 2
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-emerald-600 hover:text-emerald-700'
                                }`}
                                title={formData.rewards.length >= 2 ? 'Maximum 2 rewards allowed' : 'Add Reward'}
                              >
                                + Add
                              </button>
                            </div>
                            {formData.rewards.map((reward, rewardIndex) => {
                              const selectedTypes = formData.rewards
                                .map((r, idx) => idx !== rewardIndex ? r.type : null)
                                .filter(type => type !== null);
                              
                              return (
                                <div
                                  key={rewardIndex}
                                  className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded"
                                >
                                  <select
                                    value={reward.type}
                                    onChange={(e) =>
                                      handleRewardChange(rewardIndex, 'type', e.target.value)
                                    }
                                    className={`w-20 px-2 py-1 text-xs border rounded ${
                                      errors[`reward_${rewardIndex}_type`]
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {rewardTypes.map(type => {
                                      const isDisabled = selectedTypes.includes(type);
                                      return (
                                        <option 
                                          key={type} 
                                          value={type}
                                          disabled={isDisabled}
                                        >
                                          {type}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <input
                                    type="number"
                                    min="1"
                                    value={reward.value}
                                    onChange={(e) =>
                                      handleRewardChange(rewardIndex, 'value', e.target.value)
                                    }
                                    className={`flex-1 px-2 py-1 text-xs border rounded ${
                                      errors[`reward_${rewardIndex}_value`]
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                    }`}
                                    placeholder="Value"
                                  />
                                  {formData.rewards.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeReward(rewardIndex)}
                                      className="text-red-600 hover:text-red-700"
                                      title="Remove reward"
                                    >
                                      <XMarkIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            {errors.rewards && (
                              <p className="text-xs text-red-600">{errors.rewards}</p>
                            )}
                          </div>
                        </td>
                        {/* Alternate Reward input hidden */}
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={formData.alternateReward}
                            onChange={(e) => setFormData({...formData, alternateReward: e.target.value})}
                            className={`w-20 px-2 py-1 border rounded text-sm ${errors.alternateReward ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Alt"
                          />
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={formData.resetRule}
                            onChange={(e) => setFormData({...formData, resetRule: e.target.checked})}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSubmit}
                              className="text-emerald-600 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-50"
                              title="Save changes"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
                              title="Cancel editing"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Display Row
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span
                              className="font-medium cursor-help"
                              title={`Bonus reward given on day ${bonusDay.bonusDay}`}
                            >
                              Day {bonusDay.bonusDay}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            {/* Display rewards from array (new format) */}
                            {bonusDay.rewards && Array.isArray(bonusDay.rewards) && bonusDay.rewards.length > 0 ? (
                              bonusDay.rewards.map((reward, idx) => (
                                <div key={idx} className="flex items-center">
                                  <span className="mr-2">{getRewardIcon(reward.type)}</span>
                                  <span className="font-medium mr-2">{reward.type}:</span>
                                  <span className="font-medium text-emerald-600">
                                    {reward.value.toLocaleString()}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <>
                                {/* Display Coin Reward */}
                                {bonusDay.coinRewardValue && (
                                  <div className="flex items-center">
                                    <span className="mr-2">{getRewardIcon(bonusDay.coinRewardType || 'Coins')}</span>
                                    <span className="font-medium mr-2">{bonusDay.coinRewardType || 'Coins'}:</span>
                                    <span className="font-medium text-emerald-600">
                                      {bonusDay.coinRewardValue.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {/* Display XP Reward */}
                                {bonusDay.xpRewardValue && (
                                  <div className="flex items-center">
                                    <span className="mr-2">{getRewardIcon(bonusDay.xpRewardType || 'XP')}</span>
                                    <span className="font-medium mr-2">{bonusDay.xpRewardType || 'XP'}:</span>
                                    <span className="font-medium text-emerald-600">
                                      {bonusDay.xpRewardValue.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {/* Fallback for legacy data */}
                                {!bonusDay.coinRewardValue && !bonusDay.xpRewardValue && bonusDay.rewardType && bonusDay.rewardValue && (
                                  <div className="flex items-center">
                                    <span className="mr-2">{getRewardIcon(bonusDay.rewardType)}</span>
                                    <span className="font-medium mr-2">{bonusDay.rewardType}:</span>
                                    <span className="font-medium text-emerald-600">
                                      {bonusDay.rewardValue.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        {/* Alternate Reward data column hidden */}
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bonusDay.alternateReward ? (
                            <span
                              className="font-medium text-orange-600"
                              title={`${bonusDay.alternateReward} ${bonusDay.rewardType.toLowerCase()} (fallback)`}
                            >
                              {bonusDay.alternateReward.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center min-w-[60px] px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bonusDay.resetRule
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {bonusDay.resetRule ? 'Reset' : 'Continue'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(bonusDay)}
                              className="text-emerald-600 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-50"
                              title="Edit bonus day"
                              disabled={editingId || showAddForm}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(bonusDay.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Delete bonus day"
                              disabled={editingId || showAddForm}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

            {/* Summary */}
            {sortedBonusDays.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Total: {sortedBonusDays.length} bonus days | Reset on miss: {sortedBonusDays.filter(b => b.resetRule).length}
                  </span>
                  <span className="text-xs">
                    Bonus days help boost user retention and engagement
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Message when both toggles are off */}
        {!bonusDayConfigEnabled && !streakBonusConfigEnabled && (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>Enable at least one configuration option above to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Bonus Day"
        message="Are you sure you want to delete this bonus day? This action cannot be undone."
        confirmButtonText="OK"
        cancelButtonText="Cancel"
        loading={loading}
      />
    </div>
  );
}