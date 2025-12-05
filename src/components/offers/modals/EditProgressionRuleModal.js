'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { gamesAPI } from '../../../data/games';
import { progressionRulesAPI } from '../../../data/progressionRules';
import apiClient from '../../../lib/apiClient';
import toast from 'react-hot-toast';

const xpTierOptions = ['Junior', 'Mid', 'Senior'];
const membershipTierOptions = ['Bronze', 'Gold', 'Platinum'];

export default function EditProgressionRuleModal({ isOpen, onClose, game, progressionRule, onSave }) {
  const [formData, setFormData] = useState({
    gameId: '',
    gameName: '',
    minimumEventThreshold: 5,
    requiredXpTier: null,
    requiredMembershipTier: null,
    postThresholdTasks: [],
    isActive: true
  });
  
  const [gameGoals, setGameGoals] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch games when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchGames();
    }
  }, [isOpen]);

  // Fetch game goals/tasks when game is selected or changes
  useEffect(() => {
    if (formData.gameId && game?.besitosRawData?.goals) {
      setGameGoals(game.besitosRawData.goals || []);
    } else if (formData.gameId) {
      // If game is selected but we don't have besitosRawData, try to fetch it
      fetchGameData(formData.gameId);
    } else {
      setGameGoals([]);
    }
  }, [formData.gameId, game]);
  
  const fetchGameData = async (gameId) => {
    try {
      const response = await apiClient.get(`/admin/game-offers/games/${gameId}`);
      const gameData = response.data.data;
      if (gameData.besitosRawData?.goals) {
        setGameGoals(gameData.besitosRawData.goals || []);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  // Initialize form data when game/progressionRule changes
  useEffect(() => {
    if (progressionRule && game) {
      // Editing existing rule
      setFormData({
        gameId: game.id || '',
        gameName: game.title || game.name || '',
        minimumEventThreshold: progressionRule.minimumEventThreshold || 5,
        requiredXpTier: progressionRule.requiredXpTier || null,
        requiredMembershipTier: progressionRule.requiredMembershipTier || null,
        postThresholdTasks: progressionRule.postThresholdTasks || [],
        isActive: progressionRule.isActive !== undefined ? progressionRule.isActive : true
      });
      // Fetch game data if needed
      if (game.id && !game.besitosRawData) {
        fetchGameData(game.id);
      } else if (game.besitosRawData?.goals) {
        setGameGoals(game.besitosRawData.goals || []);
      }
    } else if (game) {
      // Creating new rule for a specific game
      setFormData({
        gameId: game.id || '',
        gameName: game.title || game.name || '',
        minimumEventThreshold: 5,
        requiredXpTier: null,
        requiredMembershipTier: null,
        postThresholdTasks: [],
        isActive: true
      });
      // Fetch game data if needed
      if (game.id && !game.besitosRawData) {
        fetchGameData(game.id);
      } else if (game.besitosRawData?.goals) {
        setGameGoals(game.besitosRawData.goals || []);
      }
    } else {
      // Creating new rule - no game selected yet
      setFormData({
        gameId: '',
        gameName: '',
        minimumEventThreshold: 5,
        requiredXpTier: null,
        requiredMembershipTier: null,
        postThresholdTasks: [],
        isActive: true
      });
      setGameGoals([]);
    }
    setErrors({});
  }, [game, progressionRule, isOpen]);

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

  const handleGameSelect = (gameId) => {
    const selectedGame = games.find(g => g.id === gameId);
    setFormData(prev => ({
      ...prev,
      gameId: gameId || '',
      gameName: selectedGame ? (selectedGame.title || selectedGame.name) : '',
      postThresholdTasks: [] // Reset tasks when game changes
    }));
    if (gameId) {
      fetchGameData(gameId);
    } else {
      setGameGoals([]);
    }
  };

  const updatePostThresholdTask = (index, field, value) => {
    const newTasks = [...formData.postThresholdTasks];
    if (!newTasks[index]) {
      newTasks[index] = {
        taskId: null,
        order: index + 1,
        requiredXpTier: null,
        requiredMembershipTier: null,
        isEnabled: true
      };
    }
    newTasks[index][field] = value;
    setFormData(prev => ({
      ...prev,
      postThresholdTasks: newTasks
    }));
  };

  const addPostThresholdTask = () => {
    setFormData(prev => ({
      ...prev,
      postThresholdTasks: [
        ...prev.postThresholdTasks,
        {
          taskId: null,
          order: prev.postThresholdTasks.length + 1,
          requiredXpTier: null,
          requiredMembershipTier: null,
          isEnabled: true
        }
      ]
    }));
  };

  const removePostThresholdTask = (index) => {
    const newTasks = formData.postThresholdTasks.filter((_, i) => i !== index);
    // Reorder remaining tasks
    newTasks.forEach((task, i) => {
      task.order = i + 1;
    });
    setFormData(prev => ({
      ...prev,
      postThresholdTasks: newTasks
    }));
  };

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  const fetchGames = async () => {
    setLoadingGames(true);
    try {
      const response = await gamesAPI.getGames({ page: 1, limit: 1000, status: 'all' });
      setGames(response.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoadingGames(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.gameId) {
      newErrors.gameId = 'Please select a game';
    }
    if (formData.minimumEventThreshold < 1) {
      newErrors.minimumEventThreshold = 'Threshold must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Prepare rule data - use global tier requirements for all post-threshold tasks
    const ruleData = {
      minimumEventThreshold: formData.minimumEventThreshold,
      postThresholdTasks: formData.postThresholdTasks.map((task, index) => ({
        taskId: task.taskId,
        order: task.order || index + 1,
        // Use global tier requirements for all tasks
        requiredXpTier: formData.requiredXpTier ? formData.requiredXpTier.toLowerCase() : null,
        requiredMembershipTier: formData.requiredMembershipTier ? formData.requiredMembershipTier.toLowerCase() : null,
        isEnabled: task.isEnabled !== undefined ? task.isEnabled : true
      })),
      isActive: formData.isActive
    };

    // Make API call
    try {
      if (progressionRule) {
        await progressionRulesAPI.updateProgressionRule(formData.gameId, ruleData);
        toast.success('Progression rule updated successfully');
      } else {
        await progressionRulesAPI.createProgressionRule(formData.gameId, ruleData);
        toast.success('Progression rule created successfully');
      }
      // Call onSave to refresh the list, then close modal
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving progression rule:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save progression rule';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  if (!isOpen) return null;

  const threshold = Math.max(1, formData.minimumEventThreshold || 5);
  const thresholdTasks = Array.isArray(gameGoals) ? gameGoals.slice(0, threshold) : [];
  const postThresholdGoals = Array.isArray(gameGoals) ? gameGoals.slice(threshold) : [];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {progressionRule ? 'Edit Progression Rule' : 'Create New Progression Rule'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Game Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Game *
                </label>
                <select
                  value={formData.gameId}
                  onChange={(e) => handleGameSelect(e.target.value)}
                  disabled={!!game} // Disable if game is pre-selected
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.gameId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  } ${game ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a game...</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.title || g.name} ({g.gameId})
                    </option>
                  ))}
                </select>
                {errors.gameId && <p className="mt-1 text-xs text-red-600">{errors.gameId}</p>}
                {loadingGames && <p className="mt-1 text-xs text-gray-500">Loading games...</p>}
              </div>

              {/* Global Tier Requirements */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Global Requirements (Applied to All Post-Threshold Tasks)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required XP Tier
                    </label>
                    <select
                      value={formData.requiredXpTier || ''}
                      onChange={(e) => handleInputChange('requiredXpTier', e.target.value || null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">No Requirement</option>
                      {xpTierOptions.map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Membership/VIP Tier
                    </label>
                    <select
                      value={formData.requiredMembershipTier || ''}
                      onChange={(e) => handleInputChange('requiredMembershipTier', e.target.value || null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">No Requirement</option>
                      {membershipTierOptions.map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  These tier requirements will be applied to ALL post-threshold tasks. Users must meet both the XP tier and Membership tier requirements (if set) to unlock post-threshold tasks.
                </p>
              </div>

              {/* Minimum Event Threshold */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Event Threshold *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minimumEventThreshold}
                  onChange={(e) => handleInputChange('minimumEventThreshold', parseInt(e.target.value) || 1)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.minimumEventThreshold ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="5"
                />
                {errors.minimumEventThreshold && <p className="mt-1 text-xs text-red-600">{errors.minimumEventThreshold}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Number of tasks user must complete before they can transfer rewards from "My Coin Box". After transfer, post-threshold tasks will unlock sequentially.
                </p>
              </div>

              {/* Post-Threshold Tasks Configuration */}
              {formData.gameId && gameGoals.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Post-Threshold Tasks Configuration
                    </h4>
                    <button
                      type="button"
                      onClick={addPostThresholdTask}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Task
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Unlock Flow:</strong> Tasks {threshold + 1} and beyond require:
                      <br />1. Complete first {threshold} tasks (threshold)
                      <br />2. Transfer rewards from "My Coin Box"
                      <br />3. Meet XP Tier requirement: {formData.requiredXpTier || 'None'}
                      <br />4. Meet Membership Tier requirement: {formData.requiredMembershipTier || 'None'}
                    </p>
                  </div>

                  {formData.postThresholdTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No post-threshold tasks configured. Click "Add Task" to add tasks that unlock after the threshold.</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.postThresholdTasks.map((task, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Task {task.order || index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removePostThresholdTask(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Select Task
                              </label>
                              <select
                                value={task.taskId || ''}
                                onChange={(e) => updatePostThresholdTask(index, 'taskId', e.target.value || null)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">Select a task...</option>
                                {postThresholdGoals.map((goal, goalIndex) => (
                                  <option key={goalIndex} value={goal.goal_id || goalIndex + threshold}>
                                    {goal.text || `Task ${goalIndex + threshold + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                              <strong>Requirements for this task:</strong>
                              <br />• Complete {threshold} tasks first
                              <br />• Transfer rewards from My Coin Box
                              {formData.requiredXpTier && <><br />• XP Tier: {formData.requiredXpTier}</>}
                              {formData.requiredMembershipTier && <><br />• Membership Tier: {formData.requiredMembershipTier}</>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable this rule</span>
                </label>
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                {progressionRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
