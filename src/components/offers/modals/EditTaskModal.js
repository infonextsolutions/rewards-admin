'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const REWARD_TYPES = ['XP', 'Coins', 'XP + Coins', 'XP Boost', 'Coins + XP Boost'];
const TIER_RESTRICTIONS = ['Bronze', 'Silver', 'Gold', 'All Tiers'];
const STATUS_TYPES = ['Active', 'Inactive', 'Testing', 'Paused'];

const mockGames = [
  { id: 'GAME001', name: 'Survey Master Pro' },
  { id: 'GAME002', name: 'Download & Play Challenge' },
  { id: 'GAME003', name: 'Premium Trial Signup' },
  { id: 'GAME004', name: 'Social Media Follow' }
];

export default function EditTaskModal({ isOpen, onClose, task, onSave }) {
  const [formData, setFormData] = useState({
    taskName: '',
    completionRule: '',
    rewardType: 'XP + Coins',
    rewardXP: 0,
    rewardCoins: 0,
    tierRestriction: 'All Tiers',
    status: 'Active',
    gameId: '',
    gameName: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.taskName || '',
        completionRule: task.completionRule || '',
        rewardType: task.rewardType || 'XP + Coins',
        rewardXP: task.rewardXP || 0,
        rewardCoins: task.rewardCoins || 0,
        tierRestriction: task.tierRestriction || 'All Tiers',
        status: task.status || 'Active',
        gameId: task.gameId || '',
        gameName: task.gameName || ''
      });
    } else {
      // Reset form for new task
      setFormData({
        taskName: '',
        completionRule: '',
        rewardType: 'XP + Coins',
        rewardXP: 0,
        rewardCoins: 0,
        tierRestriction: 'All Tiers',
        status: 'Active',
        gameId: '',
        gameName: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

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

  const handleGameChange = (gameId) => {
    const selectedGame = mockGames.find(g => g.id === gameId);
    setFormData(prev => ({
      ...prev,
      gameId,
      gameName: selectedGame ? selectedGame.name : ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }
    if (!formData.completionRule.trim()) {
      newErrors.completionRule = 'Completion rule is required';
    }
    if (!formData.gameId) {
      newErrors.gameId = 'Game selection is required';
    }
    if (formData.rewardXP < 0 || formData.rewardCoins < 0) {
      newErrors.rewards = 'Rewards cannot be negative';
    }
    if (formData.rewardXP === 0 && formData.rewardCoins === 0) {
      newErrors.rewards = 'At least one reward type must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        id: task?.id || `TASK${Date.now()}`,
        ...formData,
        completionCount: task?.completionCount || 0,
        successRate: task?.successRate || '0%',
        avgCompletionTime: task?.avgCompletionTime || '0 min',
        lastCompleted: task?.lastCompleted || new Date().toISOString()
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
                {task ? 'Edit Task' : 'Create New Task'}
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
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Task Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    value={formData.taskName}
                    onChange={(e) => handleInputChange('taskName', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.taskName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Enter task name"
                  />
                  {errors.taskName && <p className="mt-1 text-xs text-red-600">{errors.taskName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Associated Game *
                  </label>
                  <select
                    value={formData.gameId}
                    onChange={(e) => handleGameChange(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.gameId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  >
                    <option value="">Select Game</option>
                    {mockGames.map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </select>
                  {errors.gameId && <p className="mt-1 text-xs text-red-600">{errors.gameId}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Rule *
                  </label>
                  <textarea
                    value={formData.completionRule}
                    onChange={(e) => handleInputChange('completionRule', e.target.value)}
                    rows={3}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.completionRule ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Describe what the user needs to do to complete this task"
                  />
                  {errors.completionRule && <p className="mt-1 text-xs text-red-600">{errors.completionRule}</p>}
                </div>
              </div>
            </div>

            {/* Rewards Configuration */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Rewards Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Type
                  </label>
                  <select
                    value={formData.rewardType}
                    onChange={(e) => handleInputChange('rewardType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {REWARD_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rewardXP}
                    onChange={(e) => handleInputChange('rewardXP', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              {errors.rewards && <p className="mt-1 text-xs text-red-600">{errors.rewards}</p>}
            </div>

            {/* Restrictions and Status */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Restrictions & Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier Restriction
                  </label>
                  <select
                    value={formData.tierRestriction}
                    onChange={(e) => handleInputChange('tierRestriction', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {TIER_RESTRICTIONS.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {STATUS_TYPES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Task Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Task:</span>
                  <span className="text-gray-900 font-medium">{formData.taskName || 'Untitled Task'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Game:</span>
                  <span className="text-gray-900">{formData.gameName || 'No game selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rewards:</span>
                  <span className="text-gray-900">
                    {formData.rewardXP > 0 && `${formData.rewardXP} XP`}
                    {formData.rewardXP > 0 && formData.rewardCoins > 0 && ' + '}
                    {formData.rewardCoins > 0 && `${formData.rewardCoins} Coins`}
                    {formData.rewardXP === 0 && formData.rewardCoins === 0 && 'No rewards set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tier Access:</span>
                  <span className="text-gray-900">{formData.tierRestriction}</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}