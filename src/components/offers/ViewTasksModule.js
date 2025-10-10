'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, FunnelIcon, ArrowLeftIcon, CogIcon } from '@heroicons/react/24/outline';
import FilterDropdown from '../ui/FilterDropdown';
import Pagination from '../ui/Pagination';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EditTaskModal from './modals/EditTaskModal';
import ConfirmationModal from './modals/ConfirmationModal';
import TierBadge from '../ui/TierBadge';
import XPTierBadge from '../ui/XPTierBadge';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useTasks } from '../../hooks/useTasks';
import toast from 'react-hot-toast';

const REWARD_TYPES = ['XP', 'Coins', 'XP + Coins', 'XP Boost', 'Coins + XP Boost'];
const TIER_RESTRICTIONS = ['Bronze', 'Gold', 'Platinum', 'All Tiers'];
const XP_TIER_RESTRICTIONS = ['Junior', 'Mid', 'Senior', 'All'];
const TASK_TYPES = ['Achievement', 'Recurring', 'Challenge', 'Milestone'];
const STATUS_TYPES = ['Active', 'Inactive', 'Testing', 'Paused'];

const mockTasks = [
  {
    id: 'TASK001',
    taskName: 'Complete First Survey',
    completionRule: 'Submit 1 survey with 100% completion rate',
    rewardType: 'XP + Coins',
    rewardXP: 500,
    rewardCoins: 100,
    tierRestriction: 'All Tiers',
    xpTierRestriction: 'Senior',
    status: 'Active',
    gameId: 'GAME001',
    gameName: 'Survey Master Pro',
    completionCount: 8500,
    successRate: '78.2%',
    avgCompletionTime: '12 min',
    lastCompleted: '2024-03-15T10:30:00Z',
    overrideActive: false
  },
  {
    id: 'TASK002',
    taskName: 'Daily Login Streak',
    completionRule: 'Login for 7 consecutive days',
    rewardType: 'Coins',
    rewardXP: 0,
    rewardCoins: 250,
    tierRestriction: 'Platinum',
    xpTierRestriction: 'Mid',
    status: 'Active',
    gameId: 'GAME001',
    gameName: 'Survey Master Pro',
    completionCount: 3200,
    successRate: '45.6%',
    avgCompletionTime: '7 days',
    lastCompleted: '2024-03-15T08:45:00Z',
    overrideActive: false
  },
  {
    id: 'TASK003',
    taskName: 'Download & Install App',
    completionRule: 'Successfully download and open app 3 times',
    rewardType: 'XP',
    rewardXP: 750,
    rewardCoins: 0,
    tierRestriction: 'All Tiers',
    xpTierRestriction: 'Junior',
    status: 'Active',
    gameId: 'GAME002',
    gameName: 'Download & Play Challenge',
    completionCount: 6750,
    successRate: '65.3%',
    avgCompletionTime: '8 min',
    lastCompleted: '2024-03-15T14:20:00Z',
    overrideActive: false
  },
  {
    id: 'TASK004',
    taskName: 'Premium Service Trial',
    completionRule: 'Sign up for premium trial and use for 3 days',
    rewardType: 'Coins + XP Boost',
    rewardXP: 1000,
    rewardCoins: 500,
    tierRestriction: 'Gold',
    xpTierRestriction: 'Senior',
    status: 'Testing',
    gameId: 'GAME003',
    gameName: 'Premium Trial Signup',
    completionCount: 120,
    successRate: '25.8%',
    avgCompletionTime: '3 days',
    lastCompleted: '2024-03-14T16:10:00Z',
    overrideActive: true
  },
  {
    id: 'TASK005',
    taskName: 'Social Media Follow',
    completionRule: 'Follow 5 social media accounts and engage',
    rewardType: 'XP + Coins',
    rewardXP: 300,
    rewardCoins: 75,
    tierRestriction: 'Bronze',
    xpTierRestriction: 'All',
    status: 'Active',
    gameId: 'GAME004',
    gameName: 'Social Media Follow',
    completionCount: 14250,
    successRate: '82.1%',
    avgCompletionTime: '5 min',
    lastCompleted: '2024-03-15T11:55:00Z',
    overrideActive: false
  }
];

const mockGames = [
  { id: 'GAME001', name: 'Survey Master Pro' },
  { id: 'GAME002', name: 'Download & Play Challenge' },
  { id: 'GAME003', name: 'Premium Trial Signup' },
  { id: 'GAME004', name: 'Social Media Follow' }
];

export default function ViewTasksModule() {
  const searchParams = useSearchParams();
  const gameFilter = searchParams.get('game');

  // Initialize API hook with gameId
  const { tasks: apiTasks, pagination: apiPagination, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks(gameFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gameId: gameFilter || 'all',
    rewardType: 'all',
    tierRestriction: 'all',
    xpTierRestriction: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tasks when component mounts or filters change
  useEffect(() => {
    if (gameFilter) {
      fetchTasks(currentPage, searchTerm, itemsPerPage);
    }
  }, [gameFilter, currentPage, searchTerm, itemsPerPage, fetchTasks]);

  // Update filter when URL changes
  useEffect(() => {
    if (gameFilter) {
      setFilters(prev => ({ ...prev, gameId: gameFilter }));
    }
  }, [gameFilter]);

  // Use API tasks directly (server-side pagination and search)
  const tasks = apiTasks;

  // Client-side filtering for fields not supported by API
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesRewardType = filters.rewardType === 'all' || task.rewardType === filters.rewardType;
      const matchesTierRestriction = filters.tierRestriction === 'all' || task.tierRestriction === filters.tierRestriction;
      const matchesXPTierRestriction = filters.xpTierRestriction === 'all' || task.xpTierRestriction === filters.xpTierRestriction;
      const matchesStatus = filters.status === 'all' || task.status === filters.status;

      return matchesRewardType && matchesTierRestriction && matchesXPTierRestriction && matchesStatus;
    });
  }, [tasks, filters]);

  // Use API pagination
  const totalPages = apiPagination.totalPages;
  const paginatedTasks = filteredTasks;

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Testing': 'bg-blue-100 text-blue-800',
      'Paused': 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };


  const formatReward = (task) => {
    const value = task.rewardValue || 0;
    const type = task.rewardType || '';

    if (type.toLowerCase() === 'coins') {
      return `${value} Coins`;
    } else if (type.toLowerCase() === 'xp') {
      return `${value} XP`;
    }
    return `${value} ${type}`;
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditTask = (task) => {
    // Transform API task data to match EditTaskModal's expected format
    const transformedTask = {
      ...task,
      taskName: task.name,
      milestoneLogic: task.completionRule
    };
    setSelectedTask(transformedTask);
    setShowEditModal(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowEditModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        // Update existing task
        await updateTask(selectedTask.id, taskData);
        toast.success('Task updated successfully');
        // Refresh tasks list
        fetchTasks(currentPage, searchTerm, itemsPerPage);
      } else {
        // Create new task
        await createTask(taskData);
        toast.success('Task created successfully');
        // Refresh tasks list
        fetchTasks(currentPage, searchTerm, itemsPerPage);
      }
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save task. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      toast.success('Task deleted successfully');
      setShowDeleteModal(false);
      setTaskToDelete(null);
      // Refresh tasks list
      fetchTasks(currentPage, searchTerm, itemsPerPage);
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleOverride = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const action = task?.overrideActive ? 'disable' : 'enable';

    if (confirm(`Are you sure you want to ${action} override for this task? This will ${action === 'enable' ? 'bypass normal completion rules and allow manual completion control' : 'restore normal completion rule validation'}.`)) {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, overrideActive: !task.overrideActive } : task
      ));
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/offers/games"
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h2 className="text-lg font-semibold text-gray-900">
                  View Tasks
                </h2>
                {gameFilter && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Game ID: {gameFilter}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Shows all tasks mapped to games, with logic for XP/coin rewards, rule triggers, and restrictions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks by name, rule, or game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Filters:</span>
              </div>

              <select
                value={filters.gameId}
                onChange={(e) => setFilters(prev => ({ ...prev, gameId: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Games</option>
                {mockGames.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>

              <select
                value={filters.rewardType}
                onChange={(e) => setFilters(prev => ({ ...prev, rewardType: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Rewards</option>
                {REWARD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.tierRestriction}
                onChange={(e) => setFilters(prev => ({ ...prev, tierRestriction: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Tiers</option>
                {TIER_RESTRICTIONS.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>

              <select
                value={filters.xpTierRestriction}
                onChange={(e) => setFilters(prev => ({ ...prev, xpTierRestriction: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All XP Tiers</option>
                {XP_TIER_RESTRICTIONS.map(xpTier => (
                  <option key={xpTier} value={xpTier}>{xpTier}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                {STATUS_TYPES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        {loading ? (
          <LoadingSpinner message="Loading tasks..." size="medium" />
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier Restriction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* PHASE 2: Override column temporarily hidden */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Override
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || Object.values(filters).some(f => f !== 'all')
                        ? 'No tasks match your current filters.'
                        : 'No tasks configured yet. Add your first task to get started.'}
                    </td>
                  </tr>
                ) : (
                paginatedTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.name}</div>
                          <div className="text-xs text-gray-700">{task.id}</div>
                          {task.description && (
                            <div className="text-xs text-gray-600 mt-1">{task.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {task.completionRule}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatReward(task)}</div>
                          <div className="text-xs text-gray-700 capitalize">{task.rewardType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TierBadge tier={task.tierRestriction} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <XPTierBadge xpTier={task.tierRestriction} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>
                      {/* PHASE 2: Override switch temporarily hidden */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleOverride(task.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            task.overrideActive
                              ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={task.overrideActive ? 'Override is active - Click to disable' : 'Override is disabled - Click to enable'}
                        >
                          <CogIcon className="h-3 w-3 mr-1" />
                          {task.overrideActive ? 'ON' : 'OFF'}
                        </button>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit task"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete task"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                  </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Summary & Pagination */}
        {!loading && !error && filteredTasks.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, apiPagination.totalItems)} of {apiPagination.totalItems} tasks
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
        loading={isDeleting}
      />
    </div>
  );
}