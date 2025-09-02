'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import Link from 'next/link';

const mockOffers = [
  {
    id: 'OFF001',
    title: 'Welcome Bonus',
    type: 'Sign-up',
    description: 'Get 100 coins for signing up',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    targetSegment: 'New Users',
    rewardType: 'Coins',
    rewardValue: 100,
    usageCount: 1250,
    conversionRate: '15.2%'
  },
  {
    id: 'OFF002', 
    title: 'Daily Login Streak',
    type: 'Engagement',
    description: 'Login 7 days consecutively for 50 coins',
    status: 'Active',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    targetSegment: 'Active Users',
    rewardType: 'Coins',
    rewardValue: 50,
    usageCount: 850,
    conversionRate: '23.1%'
  },
  {
    id: 'OFF003',
    title: 'Premium Upgrade',
    type: 'Tier Upgrade',
    description: 'Upgrade to premium for exclusive rewards',
    status: 'Draft',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    targetSegment: 'Gold Tier',
    rewardType: 'XP Boost',
    rewardValue: '2x',
    usageCount: 0,
    conversionRate: '0%'
  }
];

export default function OffersPage() {
  const [offers, setOffers] = useState(mockOffers);
  const [filteredOffers, setFilteredOffers] = useState(mockOffers);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    segment: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { searchTerm, registerSearchHandler } = useSearch();

  useEffect(() => {
    const handleSearch = (query) => {
      if (!query) {
        setFilteredOffers(offers);
        return;
      }
      
      const filtered = offers.filter(offer => 
        offer.title.toLowerCase().includes(query.toLowerCase()) ||
        offer.id.toLowerCase().includes(query.toLowerCase()) ||
        offer.type.toLowerCase().includes(query.toLowerCase()) ||
        offer.targetSegment.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOffers(filtered);
    };

    registerSearchHandler(handleSearch);
    handleSearch(searchTerm);
  }, [offers, searchTerm, registerSearchHandler]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    
    let filtered = offers;
    
    if (newFilters.status) {
      filtered = filtered.filter(offer => offer.status === newFilters.status);
    }
    if (newFilters.type) {
      filtered = filtered.filter(offer => offer.type === newFilters.type);
    }
    if (newFilters.segment) {
      filtered = filtered.filter(offer => offer.targetSegment === newFilters.segment);
    }
    
    setFilteredOffers(filtered);
  };

  const handleSelectOffer = (offerId) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === filteredOffers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(filteredOffers.map(offer => offer.id));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Draft': 'bg-gray-100 text-gray-800', 
      'Paused': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
          <p className="text-gray-600 mt-1">Create and manage offers, rewards, and campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Offer
        </button>
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
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Types</option>
              <option value="Sign-up">Sign-up</option>
              <option value="Engagement">Engagement</option>
              <option value="Tier Upgrade">Tier Upgrade</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Segment:</label>
            <select
              value={filters.segment}
              onChange={(e) => handleFilterChange('segment', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Segments</option>
              <option value="New Users">New Users</option>
              <option value="Active Users">Active Users</option>
              <option value="Gold Tier">Gold Tier</option>
              <option value="Premium Users">Premium Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOffers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedOffers.length} offer(s) selected
            </span>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Activate
              </button>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                Pause
              </button>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ minWidth: '1000px' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOffers.length === filteredOffers.length && filteredOffers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Segment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
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
              {filteredOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOffers.includes(offer.id)}
                      onChange={() => handleSelectOffer(offer.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{offer.title}</div>
                      <div className="text-sm text-gray-500">{offer.id}</div>
                      <div className="text-sm text-gray-600 mt-1">{offer.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{offer.type}</div>
                      <div className="text-sm text-gray-500">{offer.targetSegment}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{offer.rewardValue} {offer.rewardType}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{offer.usageCount} uses</div>
                      <div className="text-sm text-gray-500">{offer.conversionRate} conversion</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(offer.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                      <Link 
                        href="/offers/games"
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        View Games
                      </Link>
                      <Link 
                        href="/offers/tasks"
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Tasks
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{offers.filter(o => o.status === 'Active').length}</div>
          <div className="text-sm text-gray-600">Active Offers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{offers.filter(o => o.status === 'Draft').length}</div>
          <div className="text-sm text-gray-600">Draft Offers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{offers.reduce((sum, o) => sum + o.usageCount, 0)}</div>
          <div className="text-sm text-gray-600">Total Usage</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">18.4%</div>
          <div className="text-sm text-gray-600">Avg Conversion</div>
        </div>
      </div>
    </div>
  );
}