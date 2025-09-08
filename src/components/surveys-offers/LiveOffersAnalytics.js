'use client';

import { useState, useMemo } from 'react';
import OffersTable from './components/OffersTable';
import OfferPreviewModal from './modals/OfferPreviewModal';
import { LIVE_OFFERS } from '../../data/surveys/surveyData';

export default function LiveOffersAnalytics() {
  const [offers, setOffers] = useState(LIVE_OFFERS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = !searchTerm || 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [offers, searchTerm]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const filtered = filteredOffers;
    return {
      totalOffers: filtered.length,
      liveOffers: filtered.filter(o => o.status === 'Live').length,
      totalViews: filtered.reduce((sum, o) => sum + o.engagementFunnel.views, 0),
      totalStarts: filtered.reduce((sum, o) => sum + o.engagementFunnel.starts, 0),
      totalCompletions: filtered.reduce((sum, o) => sum + o.engagementFunnel.completions, 0),
      totalCoinsIssued: filtered.reduce((sum, o) => sum + o.coinsIssued, 0),
      avgCompletionRate: filtered.length > 0 
        ? (filtered.reduce((sum, o) => sum + (o.engagementFunnel.completions / o.engagementFunnel.views || 0), 0) / filtered.length * 100).toFixed(1)
        : 0
    };
  }, [filteredOffers]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handlePreviewOffer = (offer) => {
    setSelectedOffer(offer);
    setShowPreviewModal(true);
  };

  const handleToggleOfferStatus = async (offerId) => {
    setOffers(prevOffers => 
      prevOffers.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: offer.status === 'Live' ? 'Paused' : 'Live' }
          : offer
      )
    );
  };

  const handleExportData = (offersToExport = filteredOffers) => {
    // Create CSV content
    const headers = [
      'Offer ID',
      'Title', 
      'SDK Source',
      'Category',
      'Coin Reward',
      'Status',
      'Avg Completion Time',
      'Coins Issued',
      'Views',
      'Starts',
      'Completions',
      'Completion Rate',
      'Description'
    ];

    const csvContent = [
      headers.join(','),
      ...offersToExport.map(offer => [
        offer.id,
        `"${offer.title}"`,
        offer.sdkSource,
        offer.category,
        offer.coinReward,
        offer.status,
        offer.avgCompletionTime,
        offer.coinsIssued,
        offer.engagementFunnel.views,
        offer.engagementFunnel.starts,
        offer.engagementFunnel.completions,
        `${Math.round((offer.engagementFunnel.completions / offer.engagementFunnel.views) * 100)}%`,
        `"${offer.description}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey-offers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Offers & Analytics</h2>
          <p className="text-gray-600 mt-1">Monitor real-time survey performance and engagement metrics</p>
        </div>
        <button
          onClick={() => handleExportData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Data</span>
        </button>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{analytics.totalOffers}</div>
          <div className="text-sm text-gray-600">Total Offers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{analytics.liveOffers}</div>
          <div className="text-sm text-gray-600">Live Offers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalViews.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{analytics.totalStarts.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Started</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{analytics.totalCompletions.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{analytics.avgCompletionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{analytics.totalCoinsIssued.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Coins Issued</div>
        </div>
      </div>

      {/* Engagement Funnel Visualization */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Engagement Funnel</h3>
        <div className="space-y-4">
          {/* Views */}
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium text-gray-700">Views</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="w-20 text-right">
              <span className="text-lg font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</span>
              <div className="text-xs text-gray-500">100%</div>
            </div>
          </div>

          {/* Starts */}
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium text-gray-700">Starts</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full" 
                  style={{ width: `${(analytics.totalStarts / analytics.totalViews) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-right">
              <span className="text-lg font-bold text-gray-900">{analytics.totalStarts.toLocaleString()}</span>
              <div className="text-xs text-gray-500">
                {Math.round((analytics.totalStarts / analytics.totalViews) * 100)}%
              </div>
            </div>
          </div>

          {/* Completions */}
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium text-gray-700">Completions</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${(analytics.totalCompletions / analytics.totalViews) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-right">
              <span className="text-lg font-bold text-gray-900">{analytics.totalCompletions.toLocaleString()}</span>
              <div className="text-xs text-gray-500">
                {Math.round((analytics.totalCompletions / analytics.totalViews) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredOffers.length} of {offers.length} offers
        {searchTerm && (
          <span> matching &quot;{searchTerm}&quot;</span>
        )}
      </div>

      {/* Offers Table */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No offers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search.'
              : 'No survey offers are currently available.'
            }
          </p>
        </div>
      ) : (
        <OffersTable
          offers={filteredOffers}
          onPreview={handlePreviewOffer}
          onToggleStatus={handleToggleOfferStatus}
          onExport={handleExportData}
        />
      )}

      {/* Offer Preview Modal */}
      <OfferPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
      />
    </div>
  );
}