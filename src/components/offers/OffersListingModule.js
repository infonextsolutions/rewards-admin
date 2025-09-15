'use client';

import { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import FilterDropdown from '../ui/FilterDropdown';
import Pagination from '../ui/Pagination';
import EditOfferModal from './modals/EditOfferModal';

const SDK_PROVIDERS = ['BitLabs', 'AdGem', 'OfferToro', 'AdGate', 'RevenueUniverse', 'Pollfish'];
const COUNTRIES = ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'];
const TIERS = ['Bronze', 'Silver', 'Gold'];
const STATUS_TYPES = ['Active', 'Inactive', 'Pending', 'Expired'];

const mockOffers = [
  {
    id: 'OFF001',
    name: 'Survey Completion Offer',
    sdk: 'BitLabs',
    expiry: '2024-12-31',
    status: 'Active',
    tierAccess: ['Bronze', 'Silver', 'Gold'],
    countries: ['US', 'CA', 'UK'],
    xptrRules: 'Complete survey worth 150+ points',
    adOffer: true,
    rewardXP: 500,
    rewardCoins: 100
  },
  {
    id: 'OFF002',
    name: 'App Download Challenge',
    sdk: 'AdGem',
    expiry: '2024-11-30',
    status: 'Active',
    tierAccess: ['Silver', 'Gold'],
    countries: ['US', 'AU', 'UK'],
    xptrRules: 'Download and open app 3 times',
    adOffer: false,
    rewardXP: 750,
    rewardCoins: 150
  },
  {
    id: 'OFF003',
    name: 'Premium Trial Signup',
    sdk: 'OfferToro',
    expiry: '2024-10-15',
    status: 'Pending',
    tierAccess: ['Gold'],
    countries: ['US', 'CA'],
    xptrRules: 'Sign up for premium trial',
    adOffer: true,
    rewardXP: 1000,
    rewardCoins: 250
  }
];

export default function OffersListingModule() {
  const [offers, setOffers] = useState(mockOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: 'all',
    sdk: 'all',
    xptr: 'all',
    adOffer: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Filter offers
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch =
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.sdk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = filters.country === 'all' || offer.countries.includes(filters.country);
      const matchesSdk = filters.sdk === 'all' || offer.sdk === filters.sdk;
      const matchesStatus = filters.status === 'all' || offer.status === filters.status;
      const matchesAdOffer = filters.adOffer === 'all' ||
        (filters.adOffer === 'yes' && offer.adOffer) ||
        (filters.adOffer === 'no' && !offer.adOffer);

      return matchesSearch && matchesCountry && matchesSdk && matchesStatus && matchesAdOffer;
    });
  }, [offers, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOffers = filteredOffers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  const getTierBadges = (tiers) => {
    const tierColors = {
      'Bronze': 'bg-orange-100 text-orange-800',
      'Silver': 'bg-gray-100 text-gray-800',
      'Gold': 'bg-yellow-100 text-yellow-800'
    };

    return (
      <div className="flex flex-wrap gap-1">
        {tiers.map(tier => (
          <span key={tier} className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors[tier]}`}>
            {tier}
          </span>
        ))}
      </div>
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

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setShowEditModal(true);
  };

  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setShowEditModal(true);
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

  const handleDeleteOffer = (offerId) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
    }
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Offer
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
                  placeholder="Search offers by name, SDK, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Countries</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              <select
                value={filters.sdk}
                onChange={(e) => setFilters(prev => ({ ...prev, sdk: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All SDKs</option>
                {SDK_PROVIDERS.map(sdk => (
                  <option key={sdk} value={sdk}>{sdk}</option>
                ))}
              </select>

              <select
                value={filters.adOffer}
                onChange={(e) => setFilters(prev => ({ ...prev, adOffer: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Ad Offers</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {STATUS_TYPES.map(status => (
                  <option key={status} value={status}>{status}</option>
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
                  SDK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier Access
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
              {paginatedOffers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || Object.values(filters).some(f => f !== 'all')
                      ? 'No offers match your current filters.'
                      : 'No offers configured yet. Add your first offer to get started.'}
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{offer.name}</div>
                        <div className="text-xs text-gray-700">{offer.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{offer.sdk}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(offer.expiry).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTierBadges(offer.tierAccess)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCountryFlags(offer.countries)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="Edit offer"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Delete offer"
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
    </div>
  );
}