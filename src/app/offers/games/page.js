'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '../../../contexts/SearchContext';
import Link from 'next/link';

const mockGames = [
  {
    id: 'GAME001',
    title: 'Quiz Master',
    category: 'Educational',
    description: 'Test your knowledge with daily quizzes',
    status: 'Live',
    totalTasks: 5,
    activeTasks: 3,
    totalPlayers: 12500,
    avgEngagement: '8.5 min',
    sdkIntegration: 'Unity',
    rewardType: 'XP + Coins',
    createdDate: '2024-01-15',
    lastUpdated: '2024-02-28'
  },
  {
    id: 'GAME002',
    title: 'Memory Challenge',
    category: 'Puzzle',
    description: 'Train your memory with card matching games',
    status: 'Live',
    totalTasks: 8,
    activeTasks: 6,
    totalPlayers: 8900,
    avgEngagement: '12.3 min',
    sdkIntegration: 'React Native',
    rewardType: 'Coins',
    createdDate: '2024-02-01',
    lastUpdated: '2024-02-25'
  },
  {
    id: 'GAME003',
    title: 'Speed Runner',
    category: 'Action',
    description: 'Fast-paced running game with obstacles',
    status: 'Testing',
    totalTasks: 12,
    activeTasks: 0,
    totalPlayers: 0,
    avgEngagement: '0 min',
    sdkIntegration: 'Flutter',
    rewardType: 'XP',
    createdDate: '2024-02-20',
    lastUpdated: '2024-02-28'
  },
  {
    id: 'GAME004',
    title: 'Word Builder',
    category: 'Educational',
    description: 'Build words from letter combinations',
    status: 'Paused',
    totalTasks: 6,
    activeTasks: 2,
    totalPlayers: 5600,
    avgEngagement: '6.8 min',
    sdkIntegration: 'Unity',
    rewardType: 'Coins',
    createdDate: '2024-01-20',
    lastUpdated: '2024-02-15'
  }
];

export default function GamesPage() {
  const [games, setGames] = useState(mockGames);
  const [filteredGames, setFilteredGames] = useState(mockGames);
  const [selectedGames, setSelectedGames] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sdkIntegration: ''
  });

  const { searchTerm, registerSearchHandler } = useSearch();

  useEffect(() => {
    const handleSearch = (query) => {
      if (!query) {
        setFilteredGames(games);
        return;
      }
      
      const filtered = games.filter(game => 
        game.title.toLowerCase().includes(query.toLowerCase()) ||
        game.id.toLowerCase().includes(query.toLowerCase()) ||
        game.category.toLowerCase().includes(query.toLowerCase()) ||
        game.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGames(filtered);
    };

    registerSearchHandler(handleSearch);
    handleSearch(searchTerm);
  }, [games, searchTerm, registerSearchHandler]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    
    let filtered = games;
    
    if (newFilters.status) {
      filtered = filtered.filter(game => game.status === newFilters.status);
    }
    if (newFilters.category) {
      filtered = filtered.filter(game => game.category === newFilters.category);
    }
    if (newFilters.sdkIntegration) {
      filtered = filtered.filter(game => game.sdkIntegration === newFilters.sdkIntegration);
    }
    
    setFilteredGames(filtered);
  };

  const handleSelectGame = (gameId) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGames.length === filteredGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(filteredGames.map(game => game.id));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Live': 'bg-green-100 text-green-800',
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

  const getSDKBadge = (sdk) => {
    const styles = {
      'Unity': 'bg-purple-100 text-purple-800',
      'React Native': 'bg-blue-100 text-blue-800',
      'Flutter': 'bg-cyan-100 text-cyan-800',
      'Native iOS': 'bg-gray-100 text-gray-800',
      'Native Android': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[sdk] || 'bg-gray-100 text-gray-800'}`}>
        {sdk}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/offers" 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Games Management</h1>
          </div>
          <p className="text-gray-600 mt-1">Manage games, tasks, and SDK integrations</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Game
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="Live">Live</option>
              <option value="Testing">Testing</option>
              <option value="Paused">Paused</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Categories</option>
              <option value="Educational">Educational</option>
              <option value="Puzzle">Puzzle</option>
              <option value="Action">Action</option>
              <option value="Strategy">Strategy</option>
              <option value="Casual">Casual</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">SDK:</label>
            <select
              value={filters.sdkIntegration}
              onChange={(e) => handleFilterChange('sdkIntegration', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All SDKs</option>
              <option value="Unity">Unity</option>
              <option value="React Native">React Native</option>
              <option value="Flutter">Flutter</option>
              <option value="Native iOS">Native iOS</option>
              <option value="Native Android">Native Android</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedGames.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedGames.length} game(s) selected
            </span>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Go Live
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

      {/* Games Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ minWidth: '1200px' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedGames.length === filteredGames.length && filteredGames.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & SDK
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
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
              {filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedGames.includes(game.id)}
                      onChange={() => handleSelectGame(game.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{game.title}</div>
                      <div className="text-sm text-gray-500">{game.id}</div>
                      <div className="text-sm text-gray-600 mt-1 max-w-xs">{game.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">{game.category}</div>
                      {getSDKBadge(game.sdkIntegration)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {game.activeTasks}/{game.totalTasks} Active
                      </div>
                      <div className="text-sm text-gray-500">Tasks configured</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {game.totalPlayers.toLocaleString()} players
                      </div>
                      <div className="text-sm text-gray-500">{game.avgEngagement} avg session</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(game.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                      <Link 
                        href={`/offers/tasks?game=${game.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        View Tasks
                      </Link>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Analytics
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{games.filter(g => g.status === 'Live').length}</div>
          <div className="text-sm text-gray-600">Live Games</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{games.reduce((sum, g) => sum + g.totalTasks, 0)}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{games.reduce((sum, g) => sum + g.activeTasks, 0)}</div>
          <div className="text-sm text-gray-600">Active Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{games.reduce((sum, g) => sum + g.totalPlayers, 0).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Players</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">9.1 min</div>
          <div className="text-sm text-gray-600">Avg Engagement</div>
        </div>
      </div>
    </div>
  );
}