'use client';

import { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, FunnelIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import FilterDropdown from '../ui/FilterDropdown';
import Pagination from '../ui/Pagination';
import Link from 'next/link';
import EditGameModal from './modals/EditGameModal';

const SDK_PROVIDERS = ['BitLabs', 'AdGem', 'OfferToro', 'AdGate', 'RevenueUniverse', 'Pollfish'];
const COUNTRIES = ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'];
const STATUS_TYPES = ['Active', 'Inactive', 'Testing', 'Paused'];

const mockGames = [
  {
    id: 'GAME001',
    title: 'Survey Master Pro',
    sdk: 'BitLabs',
    xptrRules: 'Complete 3 surveys worth 100+ points each',
    taskCount: 5,
    activeTasks: 3,
    countries: ['US', 'CA', 'UK'],
    status: 'Active',
    rewardXP: 750,
    rewardCoins: 150,
    adSupported: true
  },
  {
    id: 'GAME002',
    title: 'Download & Play Challenge',
    sdk: 'AdGem',
    xptrRules: 'Download app and play for 10 minutes',
    taskCount: 8,
    activeTasks: 6,
    countries: ['US', 'AU', 'UK', 'CA'],
    status: 'Active',
    rewardXP: 500,
    rewardCoins: 100,
    adSupported: false
  },
  {
    id: 'GAME003',
    title: 'Premium Trial Signup',
    sdk: 'OfferToro',
    xptrRules: 'Sign up for premium trial service',
    taskCount: 3,
    activeTasks: 2,
    countries: ['US', 'CA'],
    status: 'Testing',
    rewardXP: 1000,
    rewardCoins: 250,
    adSupported: true
  },
  {
    id: 'GAME004',
    title: 'Social Media Follow',
    sdk: 'AdGate',
    xptrRules: 'Follow 5 social media accounts',
    taskCount: 10,
    activeTasks: 8,
    countries: ['US', 'UK', 'AU', 'DE', 'FR'],
    status: 'Active',
    rewardXP: 300,
    rewardCoins: 75,
    adSupported: false
  }
];

export default function GamesListingModule() {
  const [games, setGames] = useState(mockGames);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: 'all',
    sdk: 'all',
    xptr: 'all',
    adGame: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch =
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.sdk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.xptrRules.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = filters.country === 'all' || game.countries.includes(filters.country);
      const matchesSdk = filters.sdk === 'all' || game.sdk === filters.sdk;
      const matchesStatus = filters.status === 'all' || game.status === filters.status;
      const matchesAdGame = filters.adGame === 'all' ||
        (filters.adGame === 'yes' && game.adSupported) ||
        (filters.adGame === 'no' && !game.adSupported);

      return matchesSearch && matchesCountry && matchesSdk && matchesStatus && matchesAdGame;
    });
  }, [games, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + itemsPerPage);

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

  const getCountryFlags = (countries) => {
    const countryFlags = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'UK': '🇬🇧', 'AU': '🇦🇺',
      'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
      'NL': '🇳🇱', 'SE': '🇸🇪'
    };

    return (
      <div className="flex flex-wrap gap-1">
        {countries.slice(0, 3).map(country => (
          <span key={country} className="text-sm text-gray-800" title={country}>
            {countryFlags[country] || country}
          </span>
        ))}
        {countries.length > 3 && (
          <span className="text-xs text-gray-700 ml-1">+{countries.length - 3}</span>
        )}
      </div>
    );
  };

  const handleEditGame = (game) => {
    setSelectedGame(game);
    setShowEditModal(true);
  };

  const handleCreateGame = () => {
    setSelectedGame(null);
    setShowEditModal(true);
  };

  const handleSaveGame = (gameData) => {
    if (selectedGame) {
      // Edit existing game
      setGames(prev => prev.map(game =>
        game.id === selectedGame.id ? gameData : game
      ));
    } else {
      // Add new game
      setGames(prev => [...prev, gameData]);
    }
    setShowEditModal(false);
    setSelectedGame(null);
  };

  const handleDeleteGame = (gameId) => {
    if (confirm('Are you sure you want to delete this game?')) {
      setGames(prev => prev.filter(game => game.id !== gameId));
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
                  href="/offers"
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h2 className="text-lg font-semibold text-gray-900">
                  Games Listing
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Displays games pushed via SDK with XP rules, country visibility, and task linkage
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateGame}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Game
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
                  placeholder="Search games by title, SDK, or XPTR rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
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
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Countries</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              <select
                value={filters.sdk}
                onChange={(e) => setFilters(prev => ({ ...prev, sdk: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All SDKs</option>
                {SDK_PROVIDERS.map(sdk => (
                  <option key={sdk} value={sdk}>{sdk}</option>
                ))}
              </select>

              <select
                value={filters.adGame}
                onChange={(e) => setFilters(prev => ({ ...prev, adGame: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Ad Games</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                {STATUS_TYPES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Games Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SDK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP Rules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Countries
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
              {paginatedGames.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || Object.values(filters).some(f => f !== 'all')
                      ? 'No games match your current filters.'
                      : 'No games configured yet. Add your first game to get started.'}
                  </td>
                </tr>
              ) : (
                paginatedGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{game.title}</div>
                        <div className="text-xs text-gray-700">{game.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{game.sdk}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 max-w-xs">{game.xptrRules}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {game.activeTasks}/{game.taskCount}
                        </div>
                        <div className="text-xs text-gray-700">Active/Total</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCountryFlags(game.countries)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(game.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/offers/tasks?game=${game.id}`}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                          title="View tasks"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleEditGame(game)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="Edit game"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Delete game"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredGames.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Game Modal */}
      <EditGameModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGame(null);
        }}
        game={selectedGame}
        onSave={handleSaveGame}
      />
    </div>
  );
}