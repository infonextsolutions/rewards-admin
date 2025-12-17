'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { eventTokensAPI } from '../../data/eventTokens';
import toast from 'react-hot-toast';

export default function EventTokenAnalytics() {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch all tokens on mount
  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await eventTokensAPI.getEventTokens({});
      if (response.success) {
        setTokens(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load event tokens');
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (token) => {
    if (!token) return;

    setAnalyticsLoading(true);
    setAnalytics(null);
    try {
      const response = await eventTokensAPI.getTokenAnalytics(token, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: 'complete',
      });

      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    fetchAnalytics(token.token);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    if (selectedToken) {
      fetchAnalytics(selectedToken.token);
    }
  };

  // Filter tokens by search term
  const filteredTokens = tokens.filter(token =>
    token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.token?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Event Token Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View comprehensive analytics for each Adjust event token
          </p>
        </div>
        {selectedToken && (
          <button
            onClick={handleRefresh}
            disabled={analyticsLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#00a389] rounded-md hover:bg-[#008a73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389] disabled:opacity-50"
          >
            {analyticsLoading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Token List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Token</h2>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tokens..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => {
                    handleDateRangeChange('startDate', e.target.value);
                    if (selectedToken) {
                      fetchAnalytics(selectedToken.token);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-sm"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    handleDateRangeChange('endDate', e.target.value);
                    if (selectedToken) {
                      fetchAnalytics(selectedToken.token);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-sm"
                />
              </div>
            </div>

            {/* Token List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Loading tokens...</p>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No tokens found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTokens.map((token) => (
                  <button
                    key={token._id || token.id}
                    onClick={() => handleTokenSelect(token)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedToken?.token === token.token
                        ? 'bg-[#00a389] text-white border-[#00a389]'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{token.name}</div>
                    <div className={`text-xs mt-1 ${selectedToken?.token === token.token ? 'text-white/80' : 'text-gray-500'}`}>
                      {token.token}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Analytics */}
        <div className="lg:col-span-2">
          {!selectedToken ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Token</h3>
              <p className="text-sm text-gray-500">
                Choose an event token from the list to view its analytics
              </p>
            </div>
          ) : analyticsLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Token Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {analytics.eventToken?.name || selectedToken.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Token</div>
                    <div className="text-sm font-mono font-medium text-gray-900">
                      {analytics.eventToken?.token || selectedToken.token}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Category</div>
                    <div className="text-sm font-medium text-gray-900">
                      {analytics.eventToken?.category || selectedToken.category || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Type</div>
                    <div className="text-sm font-medium text-gray-900">
                      {analytics.eventToken?.isS2S ? 'S2S' : 'SDK'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date Range</div>
                    <div className="text-sm font-medium text-gray-900">
                      {dateRange.startDate} to {dateRange.endDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Analytics */}
              {analytics.eventAnalytics && !analytics.eventAnalytics.error && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Analytics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">Total Events</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {analytics.eventAnalytics?.result_parameters?.events || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-xs text-green-600 font-medium mb-1">Total Installs</div>
                      <div className="text-2xl font-bold text-green-900">
                        {analytics.eventAnalytics?.result_parameters?.installs || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium mb-1">Total Clicks</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {analytics.eventAnalytics?.result_parameters?.clicks || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-xs text-yellow-600 font-medium mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        ${(analytics.eventAnalytics?.result_parameters?.revenue || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Installs by Source */}
              {analytics.installsBySource && !analytics.installsBySource.error && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Installs by Source</h3>
                  <div className="space-y-2">
                    {analytics.installsBySource?.result_set?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{item.network || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{item.campaign || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{item.installs || 0}</div>
                          <div className="text-xs text-gray-500">installs</div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500 text-center py-4">No install data available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Revenue Data */}
              {analytics.revenueData && !analytics.revenueData.error && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-xs text-green-600 font-medium mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-900">
                        ${(analytics.revenueData?.result_parameters?.revenue || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">Revenue Events</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {analytics.revenueData?.result_parameters?.revenue_events || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Device & Location Data */}
              {analytics.deviceLocationData && !analytics.deviceLocationData.error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Devices */}
                  {analytics.deviceLocationData.devices && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Devices</h3>
                      <div className="space-y-2">
                        {analytics.deviceLocationData.devices?.result_set?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium text-gray-900">{item.platform || 'Unknown'}</span>
                            <span className="text-sm text-gray-600">{item.events || 0} events</span>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500 text-center py-4">No device data available</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {analytics.deviceLocationData.locations && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                      <div className="space-y-2">
                        {analytics.deviceLocationData.locations?.result_set?.slice(0, 10).map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium text-gray-900">{item.country || 'Unknown'}</span>
                            <span className="text-sm text-gray-600">{item.events || 0} events</span>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500 text-center py-4">No location data available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Messages */}
              {(analytics.eventAnalytics?.error || analytics.installsBySource?.error || 
                analytics.revenueData?.error || analytics.deviceLocationData?.error) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Some analytics data could not be loaded. This may be due to API limitations or insufficient data.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



