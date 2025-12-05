'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import EditProgressionRuleModal from './modals/EditProgressionRuleModal';
import ConfirmationModal from './modals/ConfirmationModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProgressionRules } from '../../hooks/useProgressionRules';
import { gamesAPI } from '../../data/games';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';

export default function TaskProgressionRulesModule() {
  const { rules: progressionRules, loading: loadingRules, error: rulesError, pagination: rulesPagination, fetchProgressionRules, deleteProgressionRule } = useProgressionRules();
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('configured');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedProgressionRule, setSelectedProgressionRule] = useState(null);
  
  // Pagination state for games
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Pagination state for progression rules
  const [rulesCurrentPage, setRulesCurrentPage] = useState(1);

  // Fetch games and progression rules on component mount
  useEffect(() => {
    fetchGames(currentPage);
    // Fetch all progression rules initially for matching with games
    // Use a large limit to get all rules, but still support pagination if needed
    fetchProgressionRules({ page: 1, limit: 1000 });
  }, [currentPage]);

  // Fetch progression rules when pagination changes (if user navigates rules pages)
  useEffect(() => {
    if (rulesCurrentPage > 1) {
      fetchProgressionRules({ page: rulesCurrentPage, limit: 100 });
    }
  }, [rulesCurrentPage]);

  // Refetch when search changes (reset to page 1)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchGames(1);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Refetch when filter status changes (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchGames(1);
  }, [filterStatus]);

  const fetchGames = async (page = 1) => {
    setLoadingGames(true);
    try {
      const response = await gamesAPI.getGames({ 
        page, 
        limit: 10,
        search: searchTerm || undefined
      });
      
      const gamesList = response.games || [];
      const paginationData = response.pagination || {
        page: 1,
        limit: 10,
        total: gamesList.length,
        pages: 1
      };
      
      setPagination(paginationData);
      
      // Fetch full game data with besitosRawData only for current page games
      const gamesWithData = await Promise.all(
        gamesList.map(async (game) => {
          try {
            const fullGameResponse = await apiClient.get(`/admin/game-offers/games/${game.id}`);
            return {
              ...game,
              besitosRawData: fullGameResponse.data.data.besitosRawData || null
            };
          } catch (error) {
            console.error(`Error fetching full data for game ${game.id}:`, error);
            return {
              ...game,
              besitosRawData: null
            };
          }
        })
      );
      
      setGames(gamesWithData);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoadingGames(false);
    }
  };

  // Get progression rule for a game
  const getProgressionRuleForGame = (game) => {
    if (!game) return null;
    return progressionRules.find(rule => {
      // Match by MongoDB _id (game.id matches rule.gameId)
      if (game.id && rule.gameId) {
        if (game.id.toString() === rule.gameId.toString()) {
          return true;
        }
      }
      // Match by external game ID (game.gameId matches rule.gameGameId)
      if (game.gameId && rule.gameGameId) {
        if (game.gameId === rule.gameGameId) {
          return true;
        }
      }
      return false;
    });
  };

  // Calculate visible tasks for a user profile
  const calculateVisibleTasks = (game, progressionRule, userProfile = null) => {
    if (!progressionRule || !game.besitosRawData?.goals) {
      return {
        totalTasks: game.besitosRawData?.goals?.length || 0,
        visibleTasks: game.besitosRawData?.goals?.length || 0,
        thresholdTasks: 0,
        postThresholdTasks: 0,
        lockedTasks: 0
      };
    }

    const allGoals = game.besitosRawData.goals || [];
    const threshold = progressionRule.minimumEventThreshold || 5;
    const postThresholdTasks = progressionRule.postThresholdTasks || [];

    // If no user profile, show all tasks
    if (!userProfile) {
      return {
        totalTasks: allGoals.length,
        visibleTasks: allGoals.length,
        thresholdTasks: threshold,
        postThresholdTasks: postThresholdTasks.length,
        lockedTasks: 0
      };
    }

    // Calculate based on user profile
    const completedTasks = userProfile.completedTasks || 0;
    const rewardTransferred = userProfile.rewardTransferred || false;
    const userXpTier = userProfile.xpTier || 'junior';
    const userMembershipTier = userProfile.membershipTier || 'bronze';

    let visibleCount = 0;
    let lockedCount = 0;

    // Tasks before threshold are always visible if not completed
    allGoals.forEach((goal, index) => {
      if (index < threshold) {
        visibleCount++;
      } else {
        // Post-threshold tasks
        const postThresholdTask = postThresholdTasks.find(pt => 
          pt.taskId === goal.goal_id || pt.name === goal.text
        );

        if (postThresholdTask) {
          // Check if user meets requirements
          const meetsThreshold = completedTasks >= threshold;
          const meetsTransfer = rewardTransferred;
          const meetsXpTier = !postThresholdTask.requiredXpTier || 
            postThresholdTask.requiredXpTier.toLowerCase() === userXpTier.toLowerCase();
          const meetsMembershipTier = !postThresholdTask.requiredMembershipTier || 
            postThresholdTask.requiredMembershipTier.toLowerCase() === userMembershipTier.toLowerCase();

          if (meetsThreshold && meetsTransfer && meetsXpTier && meetsMembershipTier) {
            visibleCount++;
          } else {
            lockedCount++;
          }
        } else {
          // Regular post-threshold task (no special requirements)
          if (completedTasks >= threshold && rewardTransferred) {
            visibleCount++;
          } else {
            lockedCount++;
          }
        }
      }
    });

    return {
      totalTasks: allGoals.length,
      visibleTasks: visibleCount,
      thresholdTasks: threshold,
      postThresholdTasks: postThresholdTasks.length,
      lockedTasks: lockedCount
    };
  };

  // Filter games (client-side filtering for status only, search is done server-side)
  const filteredGames = games.filter(game => {
    const progressionRule = getProgressionRuleForGame(game);
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'configured' && progressionRule) ||
      (filterStatus === 'not-configured' && !progressionRule);

    return matchesStatus;
  });

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages && !loadingGames) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditRule = async (game) => {
    try {
      const progressionRule = getProgressionRuleForGame(game);
      
      // Always fetch fresh game data to ensure we have besitosRawData
      try {
        const fullGameResponse = await apiClient.get(`/admin/game-offers/games/${game.id}`);
        const gameWithData = {
          ...game,
          besitosRawData: fullGameResponse.data.data.besitosRawData || null
        };
        
        setSelectedGame(gameWithData);
        setSelectedProgressionRule(progressionRule);
        setShowEditModal(true);
      } catch (error) {
        console.error('Error fetching full game data:', error);
        // Still open modal even if fetch fails
        setSelectedGame(game);
        setSelectedProgressionRule(progressionRule);
        setShowEditModal(true);
        toast.warning('Could not load full game data. Some features may be limited.');
      }
    } catch (error) {
      console.error('Error in handleEditRule:', error);
      toast.error('Failed to open edit modal');
    }
  };

  const handleCreateRule = () => {
    setSelectedGame(null);
    setSelectedProgressionRule(null);
    setShowEditModal(true);
  };

  const handleDeleteRule = (game) => {
    const progressionRule = getProgressionRuleForGame(game.id);
    setSelectedGame(game);
    setSelectedProgressionRule(progressionRule);
    setShowDeleteModal(true);
  };

  const confirmDeleteRule = async () => {
    if (!selectedGame || !selectedProgressionRule) return;

    try {
      await deleteProgressionRule(selectedGame.id);
      toast.success('Progression rule deleted successfully');
      setShowDeleteModal(false);
      setSelectedGame(null);
      setSelectedProgressionRule(null);
      // Refetch with same limit as initial load
      await fetchProgressionRules({ page: 1, limit: 1000 });
      // Refetch current page of games to update the status
      await fetchGames(currentPage);
    } catch (error) {
      console.error('Failed to delete progression rule:', error);
      toast.error('Failed to delete progression rule');
    }
  };

  const handleSaveRule = async () => {
    try {
      // Refetch progression rules with the same limit as initial load to get all rules
      await fetchProgressionRules({ page: 1, limit: 1000 });
      // Refetch current page of games to update the status
      await fetchGames(currentPage);
      // Close modal
      setShowEditModal(false);
      setSelectedGame(null);
      setSelectedProgressionRule(null);
    } catch (error) {
      console.error('Failed to refresh after saving rule:', error);
      toast.error('Rule saved but failed to refresh the list');
    }
  };

  const getStatusBadge = (hasRule) => {
    return (
      <span className={`inline-flex items-center justify-center min-w-[100px] px-2.5 py-0.5 rounded-full text-xs font-medium ${
        hasRule ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {hasRule ? 'Configured' : 'Not Configured'}
      </span>
    );
  };

  if (loadingGames || loadingRules) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
        <p className="ml-3 text-sm text-gray-500">Loading games and progression rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/offers"
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h2 className="text-lg font-semibold text-gray-900">
                  Task Progression Rules
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Configure sequential task unlocking with threshold requirements and tier-based access. Tasks unlock after completing threshold and transferring rewards from My Coin Box.
              </p>
              {rulesPagination.total > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Total Progression Rules: <span className="font-semibold text-gray-700">{rulesPagination.total}</span>
                  {rulesPagination.pages > 1 && (
                    <span className="ml-2">
                      (Page {rulesCurrentPage} of {rulesPagination.pages})
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {rulesPagination.pages > 1 && (
                <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 bg-white">
                  <button
                    onClick={() => {
                      const newPage = rulesCurrentPage - 1;
                      if (newPage >= 1) {
                        setRulesCurrentPage(newPage);
                      }
                    }}
                    disabled={rulesCurrentPage === 1 || loadingRules}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-700 px-2">
                    {rulesCurrentPage} / {rulesPagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = rulesCurrentPage + 1;
                      if (newPage <= rulesPagination.pages) {
                        setRulesCurrentPage(newPage);
                      }
                    }}
                    disabled={rulesCurrentPage >= rulesPagination.pages || loadingRules}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
              <button
                onClick={handleCreateRule}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Progression Rule
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
                  placeholder="Search games by title or game ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Reset to page 1 when search changes
                    if (currentPage !== 1) {
                      setCurrentPage(1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchGames(1);
                    }
                  }}
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Games</option>
                <option value="configured">With Rules</option>
                <option value="not-configured">Without Rules</option>
              </select>
            </div>
          </div>
        </div>

        {/* Games Table */}
        {rulesError ? (
          <div className="px-6 py-8 text-center text-red-600">
            {rulesError}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visible Tasks (Example User)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGames.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || filterStatus !== 'all'
                        ? 'No games match your current filters.'
                        : 'No games found.'}
                    </td>
                  </tr>
                ) : (
                  filteredGames.map((game) => {
                    const progressionRule = getProgressionRuleForGame(game);
                    const taskInfo = calculateVisibleTasks(game, progressionRule);
                    
                    return (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{game.title}</div>
                            <div className="text-xs text-gray-500">{game.gameId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {taskInfo.totalTasks} tasks
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {progressionRule ? `${progressionRule.minimumEventThreshold} tasks` : 'Not set'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {progressionRule ? (
                              <div className="space-y-1">
                                <div>Visible: {taskInfo.visibleTasks}/{taskInfo.totalTasks}</div>
                                <div className="text-xs text-gray-500">
                                  Locked: {taskInfo.lockedTasks}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">All tasks visible</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(!!progressionRule)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditRule(game)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title={progressionRule ? "Edit progression rule" : "Create progression rule"}
                            >
                              {progressionRule ? (
                                <PencilIcon className="h-4 w-4" />
                              ) : (
                                <PlusIcon className="h-4 w-4" />
                              )}
                            </button>
                            {progressionRule && (
                              <button
                                onClick={() => handleDeleteRule(game)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete progression rule"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls - Bottom */}
        {!loadingGames && pagination.total > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> games
                {filteredGames.length < games.length && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({filteredGames.length} shown after filter)
                  </span>
                )}
              </div>
              {pagination.pages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loadingGames}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loadingGames}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.pages || loadingGames}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Progression Rule Modal */}
      <EditProgressionRuleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGame(null);
          setSelectedProgressionRule(null);
        }}
        game={selectedGame}
        progressionRule={selectedProgressionRule}
        onSave={handleSaveRule}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGame(null);
          setSelectedProgressionRule(null);
        }}
        onConfirm={confirmDeleteRule}
        title="Delete Progression Rule"
        message={`Are you sure you want to delete the progression rule for "${selectedGame?.title}"? This action cannot be undone.`}
        confirmText="Delete Rule"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
