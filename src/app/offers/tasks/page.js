'use client';

import React, { useState, useEffect } from 'react';
import { useSearch } from '../../../contexts/SearchContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const mockTasks = [
  {
    id: 'TASK001',
    title: 'Complete First Quiz',
    gameId: 'GAME001',
    gameName: 'Quiz Master',
    description: 'Answer 5 questions correctly in your first quiz attempt',
    taskType: 'Achievement',
    triggerType: 'Event',
    status: 'Active',
    rewardType: 'XP + Coins',
    rewardValue: '50 XP + 10 Coins',
    completionCount: 8500,
    successRate: '68.2%',
    rules: {
      conditions: [
        { field: 'quiz_attempts', operator: '>=', value: 1 },
        { field: 'correct_answers', operator: '>=', value: 5 }
      ],
      frequency: 'Once per user',
      cooldown: 'None',
      timeLimit: 'None'
    },
    createdDate: '2024-01-15',
    lastUpdated: '2024-02-20'
  },
  {
    id: 'TASK002',
    title: 'Daily Login Bonus',
    gameId: 'GAME001',
    gameName: 'Quiz Master',
    description: 'Login to the game daily for 7 consecutive days',
    taskType: 'Recurring',
    triggerType: 'Time-based',
    status: 'Active',
    rewardType: 'Coins',
    rewardValue: '25 Coins',
    completionCount: 12300,
    successRate: '45.8%',
    rules: {
      conditions: [
        { field: 'consecutive_logins', operator: '>=', value: 7 }
      ],
      frequency: 'Weekly reset',
      cooldown: '24 hours',
      timeLimit: '7 days'
    },
    createdDate: '2024-01-20',
    lastUpdated: '2024-02-25'
  },
  {
    id: 'TASK003',
    title: 'Memory Master',
    gameId: 'GAME002',
    gameName: 'Memory Challenge',
    description: 'Complete memory game with 90% accuracy',
    taskType: 'Achievement',
    triggerType: 'Performance',
    status: 'Active',
    rewardType: 'XP',
    rewardValue: '75 XP',
    completionCount: 3200,
    successRate: '23.5%',
    rules: {
      conditions: [
        { field: 'accuracy_percentage', operator: '>=', value: 90 },
        { field: 'game_completed', operator: '==', value: true }
      ],
      frequency: 'Once per day',
      cooldown: '24 hours',
      timeLimit: '30 minutes'
    },
    createdDate: '2024-02-01',
    lastUpdated: '2024-02-28'
  },
  {
    id: 'TASK004',
    title: 'Speed Runner Challenge',
    gameId: 'GAME003',
    gameName: 'Speed Runner',
    description: 'Complete level in under 2 minutes',
    taskType: 'Challenge',
    triggerType: 'Performance',
    status: 'Testing',
    rewardType: 'Coins + XP Boost',
    rewardValue: '100 Coins + 2x XP',
    completionCount: 0,
    successRate: '0%',
    rules: {
      conditions: [
        { field: 'level_completion_time', operator: '<', value: 120 },
        { field: 'level_number', operator: '>=', value: 5 }
      ],
      frequency: 'Once per level',
      cooldown: 'None',
      timeLimit: '5 minutes'
    },
    createdDate: '2024-02-20',
    lastUpdated: '2024-02-28'
  }
];

const mockGames = [
  { id: 'GAME001', name: 'Quiz Master' },
  { id: 'GAME002', name: 'Memory Challenge' },
  { id: 'GAME003', name: 'Speed Runner' },
  { id: 'GAME004', name: 'Word Builder' }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState(mockTasks);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    taskType: '',
    gameId: '',
    triggerType: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);

  const searchParams = useSearchParams();
  const gameFilter = searchParams.get('game');

  const { searchTerm, registerSearchHandler } = useSearch();

  useEffect(() => {
    // Apply game filter from URL if present
    if (gameFilter) {
      setFilters(prev => ({ ...prev, gameId: gameFilter }));
    }
  }, [gameFilter]);

  useEffect(() => {
    const handleSearch = (query) => {
      let filtered = tasks;
      
      // Apply filters first
      if (filters.status) {
        filtered = filtered.filter(task => task.status === filters.status);
      }
      if (filters.taskType) {
        filtered = filtered.filter(task => task.taskType === filters.taskType);
      }
      if (filters.gameId) {
        filtered = filtered.filter(task => task.gameId === filters.gameId);
      }
      if (filters.triggerType) {
        filtered = filtered.filter(task => task.triggerType === filters.triggerType);
      }
      
      // Apply search query
      if (query) {
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.id.toLowerCase().includes(query.toLowerCase()) ||
          task.gameName.toLowerCase().includes(query.toLowerCase()) ||
          task.description.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      setFilteredTasks(filtered);
    };

    registerSearchHandler(handleSearch);
    handleSearch(searchTerm);
  }, [tasks, filters, searchTerm, registerSearchHandler]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Testing': 'bg-blue-100 text-blue-800',
      'Paused': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getTaskTypeBadge = (type) => {
    const styles = {
      'Achievement': 'bg-purple-100 text-purple-800',
      'Recurring': 'bg-blue-100 text-blue-800',
      'Challenge': 'bg-orange-100 text-orange-800',
      'Milestone': 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {type}
      </span>
    );
  };

  const renderRuleConditions = (conditions) => {
    return conditions.map((condition, index) => (
      <div key={index} className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-700">{condition.field}</span>
        <span className="text-gray-500">{condition.operator}</span>
        <span className="font-medium text-gray-900">{condition.value}</span>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/offers/games" 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            {gameFilter && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Filtered by: {mockGames.find(g => g.id === gameFilter)?.name}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">Configure tasks, rules, and reward conditions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Game:</label>
            <select 
              value={filters.gameId}
              onChange={(e) => handleFilterChange('gameId', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Games</option>
              {mockGames.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Testing">Testing</option>
              <option value="Paused">Paused</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filters.taskType}
              onChange={(e) => handleFilterChange('taskType', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Types</option>
              <option value="Achievement">Achievement</option>
              <option value="Recurring">Recurring</option>
              <option value="Challenge">Challenge</option>
              <option value="Milestone">Milestone</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Trigger:</label>
            <select
              value={filters.triggerType}
              onChange={(e) => handleFilterChange('triggerType', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Triggers</option>
              <option value="Event">Event</option>
              <option value="Time-based">Time-based</option>
              <option value="Performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedTasks.length} task(s) selected
            </span>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Activate
              </button>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                Pause
              </button>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ minWidth: '1400px' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game & Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rewards
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleSelectTask(task.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.id}</div>
                        <div className="text-sm text-gray-600 mt-1 max-w-md">{task.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">{task.gameName}</div>
                        <div className="flex gap-2">
                          {getTaskTypeBadge(task.taskType)}
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {task.triggerType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.rewardValue}</div>
                        <div className="text-sm text-gray-500">{task.rewardType}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.completionCount.toLocaleString()} completions
                        </div>
                        <div className="text-sm text-gray-500">{task.successRate} success rate</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleTaskExpansion(task.id)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          {expandedTask === task.id ? 'Hide Rules' : 'View Rules'}
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Analytics
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedTask === task.id && (
                    <tr>
                      <td colSpan="7" className="px-4 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Conditions</h4>
                            <div className="space-y-1">
                              {renderRuleConditions(task.rules.conditions)}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Frequency & Limits</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Frequency:</span>
                                <span className="text-gray-900">{task.rules.frequency}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cooldown:</span>
                                <span className="text-gray-900">{task.rules.cooldown}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Time Limit:</span>
                                <span className="text-gray-900">{task.rules.timeLimit}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="text-gray-900">{task.createdDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Updated:</span>
                                <span className="text-gray-900">{task.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'Active').length}</div>
          <div className="text-sm text-gray-600">Active Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{tasks.reduce((sum, t) => sum + t.completionCount, 0).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Completions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">42.1%</div>
          <div className="text-sm text-gray-600">Avg Success Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{new Set(tasks.map(t => t.gameId)).size}</div>
          <div className="text-sm text-gray-600">Games with Tasks</div>
        </div>
      </div>
    </div>
  );
}