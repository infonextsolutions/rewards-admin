'use client';

import { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import FilterDropdown from '../ui/FilterDropdown';
import Pagination from '../ui/Pagination';
import EditOfferModal from './modals/EditOfferModal';
import ConfirmationModal from './modals/ConfirmationModal';
import ManageSegmentsModal from './modals/ManageSegmentsModal';

const STATUS_TYPES = ['Active', 'Inactive'];
const MARKETING_CHANNELS = ['Facebook', 'TikTok', 'Google', 'Instagram', 'Twitter'];

const mockOffers = [
  {
    id: 'WELCOME_001',
    offerName: 'Welcome Bonus',
    sdkOffer: 'WELCOME_001',
    rewardType: 'Coins',
    rewardValue: 500,
    retentionRate: '85%',
    clickRate: '12%',
    installRate: '8.5%',
    roas: '245%',
    marketingChannel: 'Facebook',
    campaign: 'Holiday Campaign',
    status: 'Active'
  },
  {
    id: 'DAILY_002',
    offerName: 'Daily Login Bonus',
    sdkOffer: 'DAILY_002',
    rewardType: 'XP',
    rewardValue: 100,
    retentionRate: '72%',
    clickRate: '18%',
    installRate: '6.8%',
    roas: '180%',
    marketingChannel: 'TikTok',
    campaign: 'Daily Engagement',
    status: 'Active'
  }
];

export default function OffersListingModule() {
  const [offers, setOffers] = useState(mockOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    channel: 'all'
  });
  const [activeTab, setActiveTab] = useState('offer');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSegmentsModal, setShowSegmentsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Filter offers
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch =
        offer.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.sdkOffer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.campaign.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || offer.status === filters.status;
      const matchesChannel = filters.channel === 'all' || offer.marketingChannel === filters.channel;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [offers, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOffers = filteredOffers.slice(startIndex, startIndex + itemsPerPage);

  // Get metric chip styling based on value
  const getMetricChipStyle = (value, type) => {
    const numValue = parseFloat(value.replace('%', ''));

    if (type === 'retention') {
      return numValue >= 80 ? 'bg-[#E6F9EC] text-[#0F8A3B]' : 'bg-[#FFF7E6] text-[#B66A00]';
    } else if (type === 'click') {
      return numValue >= 15 ? 'bg-[#E6F9EC] text-[#0F8A3B]' : 'bg-[#FFF7E6] text-[#B66A00]';
    } else if (type === 'install') {
      return numValue >= 8 ? 'bg-[#E6F9EC] text-[#0F8A3B]' : 'bg-[#FFF7E6] text-[#B66A00]';
    } else if (type === 'roas') {
      return numValue >= 200 ? 'bg-[#E6F9EC] text-[#0F8A3B]' : 'bg-[#FFF7E6] text-[#B66A00]';
    }
    return 'bg-[#FFF7E6] text-[#B66A00]';
  };

  const getMetricChip = (value, type) => {
    const chipStyle = getMetricChipStyle(value, type);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${chipStyle}`}>
        {value}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Active': 'bg-[#E9F7EF] text-[#0F8A3B]',
      'Inactive': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setShowEditModal(true);
  };

  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setShowEditModal(true);
  };

  const handleSegmentsOffer = (offer) => {
    setSelectedOffer(offer);
    setShowSegmentsModal(true);
  };

  const handleSaveSegments = (segmentData) => {
    console.log('Applying segment changes:', segmentData);
    // TODO: Implement API call to save segment changes
    // For now, just close the modal
    setShowSegmentsModal(false);
    setSelectedOffer(null);
  };

  const handleDeleteOffer = (offer) => {
    setSelectedOffer(offer);
    setShowDeleteModal(true);
  };

  const confirmDeleteOffer = () => {
    if (selectedOffer) {
      setOffers(prev => prev.filter(offer => offer.id !== selectedOffer.id));
      setShowDeleteModal(false);
      setSelectedOffer(null);
    }
  };

  const handleSaveOffer = (offerData) => {
    if (selectedOffer) {
      // Edit existing offer
      setOffers(prev => prev.map(offer =>
        offer.id === selectedOffer.id ? offerData : offer
      ));
    } else {
      // Add new offer
      setOffers(prev => [...prev, offerData]);
    }
    setShowEditModal(false);
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Offers Listing
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage all currently available offers with SDK mapping, tier logic, expiry, and country visibility
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateOffer}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Offer
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Search offers"
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
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                {STATUS_TYPES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={filters.channel}
                onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by channel"
              >
                <option value="all">All Channels</option>
                {MARKETING_CHANNELS.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SDK Offer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retention Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Install Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketing Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
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
              {paginatedOffers.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || Object.values(filters).some(f => f !== 'all')
                      ? 'No offers match your current filters.'
                      : 'No offers configured yet. Add your first offer to get started.'}
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{offer.offerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.sdkOffer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.rewardType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{offer.rewardValue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.retentionRate, 'retention')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.clickRate, 'click')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.installRate, 'install')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.roas, 'roas')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.marketingChannel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.campaign}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                          title="Edit offer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSegmentsOffer(offer)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                          title="Segments"
                        >
                          Segments
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer)}
                          className="px-3 py-1 text-xs font-medium bg-[#FFEBEC] text-[#C0392B] hover:bg-red-200 rounded-md"
                          title="Delete offer"
                        >
                          Delete
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
        {filteredOffers.length > 0 && (
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

      {/* Edit Offer Modal */}
      <EditOfferModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        onSave={handleSaveOffer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOffer(null);
        }}
        onConfirm={confirmDeleteOffer}
        title="Delete Offer"
        message={`Are you sure you want to delete the offer "${selectedOffer?.offerName}"? This action cannot be undone.`}
        confirmText="Delete Offer"
        type="warning"
      />

      {/* Manage Segments Modal */}
      <ManageSegmentsModal
        isOpen={showSegmentsModal}
        onClose={() => {
          setShowSegmentsModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        onSave={handleSaveSegments}
      />
    </div>
  );
}