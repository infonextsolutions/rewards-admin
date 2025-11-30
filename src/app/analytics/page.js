'use client';

import React, { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Pagination from "../../components/ui/Pagination";
import { useSearch } from "../../contexts/SearchContext";
import { ANALYTICS_API } from "../../data/analytics";
import toast from "react-hot-toast";

const Frame = ({ onExportCSV }) => {
  return (
    <header
      className="flex w-full items-center justify-between relative mb-6"
      role="banner"
    >
      <div className="relative">
        <h1 className="[font-family:'DM_Sans',Helvetica] font-semibold text-black text-[25.6px] tracking-[0] leading-[normal]">
          Marketing Attribution &amp; Analytics
        </h1>
        <p className="[font-family:'DM_Sans',Helvetica] font-medium text-gray-500 text-[14.4px] tracking-[0] leading-[normal] mt-2">
          Analyze acquisition sources, game performance, and marketing attribution
        </p>
      </div>

      <div className="inline-flex items-center gap-6 relative flex-[0_0_auto]">
        <button
          onClick={onExportCSV}
          className="all-[unset] box-border inline-flex h-[30px] items-center justify-end gap-2.5 px-[18px] py-1.5 relative flex-[0_0_auto] bg-[#00a389] rounded-[100px] hover:bg-[#008a73] focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
          type="button"
          aria-label="Export data as CSV file"
        >
          <img
            className="relative w-6 h-6 mt-[-3.00px] mb-[-3.00px] aspect-[1]"
            alt=""
            src="https://c.animaapp.com/Sb6Gxa8j/img/material-symbols-download-rounded.svg"
            role="presentation"
          />
          <span className="relative w-fit mt-[-1.50px] [font-family:'Inter',Helvetica] font-medium text-white text-[13px] tracking-[0] leading-[19px] whitespace-nowrap">
            Export CSV
          </span>
        </button>
      </div>
    </header>
  );
};

const FiltersSection = ({ filters, onFilterChange, filterOptions = {} }) => {
  const acquisitionSources = filterOptions.acquisitionSources || [
    'Facebook', 'Google Ads', 'Organic'
  ];
  
  const advertiserList = filterOptions.advertisers || [];

  const platformList = filterOptions.platforms || [
    'iOS', 'Android', 'Web'
  ];

  return (
    <div className="bg-white rounded-[10px] p-6 mb-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Acquisition Source */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Acquisition Source</label>
            {filters.acquisitionSources.length > 0 && (
              <button
                onClick={() => onFilterChange('acquisitionSources', [])}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="border border-gray-300 rounded-md p-3 bg-white max-h-24 overflow-y-auto">
            {acquisitionSources.map(source => (
              <label key={source} className="flex items-center mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.acquisitionSources.includes(source)}
                  onChange={(e) => {
                    const currentSources = filters.acquisitionSources;
                    if (e.target.checked) {
                      onFilterChange('acquisitionSources', [...currentSources, source]);
                    } else {
                      onFilterChange('acquisitionSources', currentSources.filter(s => s !== source));
                    }
                  }}
                  className="mr-2 w-3 h-3 text-[#00a389] border-gray-300 rounded focus:ring-[#00a389] focus:ring-2"
                />
                <span className="text-sm text-gray-700">{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* EXCLUDED: KPIs per Game Title functionality not supported per requirements - display only as per UTM information
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Game Title</label>
            {filters.gamesTitles.length > 0 && (
              <button
                onClick={() => onFilterChange('gamesTitles', [])}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="border border-gray-300 rounded-md p-3 bg-white max-h-24 overflow-y-auto">
            {gameList.map(game => (
              <label key={game} className="flex items-center mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.gamesTitles.includes(game)}
                  onChange={(e) => {
                    const currentGames = filters.gamesTitles;
                    if (e.target.checked) {
                      onFilterChange('gamesTitles', [...currentGames, game]);
                    } else {
                      onFilterChange('gamesTitles', currentGames.filter(g => g !== game));
                    }
                  }}
                  className="mr-2 w-3 h-3 text-[#00a389] border-gray-300 rounded focus:ring-[#00a389] focus:ring-2"
                />
                <span className="text-sm text-gray-700">{game}</span>
              </label>
            ))}
          </div>
        </div>
        */}

        {/* Advertiser */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Advertiser</label>
          <select
            value={filters.advertiser}
            onChange={(e) => onFilterChange('advertiser', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent bg-white"
            style={{
              color: '#333333',
              backgroundColor: 'white'
            }}
          >
            <option value="" style={{ color: '#333333', backgroundColor: 'white' }}>All Advertisers</option>
            {advertiserList.map(advertiser => (
              <option key={advertiser} value={advertiser} style={{ color: '#333333', backgroundColor: 'white' }}>{advertiser}</option>
            ))}
          </select>
        </div>

        {/* Metrics Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Metrics Type</label>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => onFilterChange('metricsType', 'Performance')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded transition-colors ${
                filters.metricsType === 'Performance' 
                  ? 'bg-[#00a389] text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => onFilterChange('metricsType', 'Retention')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded transition-colors ${
                filters.metricsType === 'Retention' 
                  ? 'bg-[#00a389] text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Retention
            </button>
          </div>
        </div>

        {/* Platform */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Platform</label>
          <select
            value={filters.platform}
            onChange={(e) => onFilterChange('platform', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent bg-white"
            style={{
              color: '#333333',
              backgroundColor: 'white'
            }}
          >
            <option value="" style={{ color: '#333333', backgroundColor: 'white' }}>All Platforms</option>
            {platformList.map(platform => (
              <option key={platform} value={platform} style={{ color: '#333333', backgroundColor: 'white' }}>{platform}</option>
            ))}
          </select>
        </div>

        {/* Country filter hidden - no corresponding table column */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={filters.country}
            onChange={(e) => onFilterChange('country', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent bg-white"
            style={{
              color: '#333333',
              backgroundColor: 'white'
            }}
          >
            <option value="" style={{ color: '#333333', backgroundColor: 'white' }}>All Countries</option>
            {countryList.map(country => (
              <option key={country} value={country} style={{ color: '#333333', backgroundColor: 'white' }}>{country}</option>
            ))}
          </select>
        </div> */}

        {/* Date Range */}
        <div className="flex flex-col xl:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFilterChange('dateRange', {...filters.dateRange, start: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent w-full bg-white"
              style={{
                color: '#333333',
                backgroundColor: 'white'
              }}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFilterChange('dateRange', {...filters.dateRange, end: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent w-full bg-white"
              style={{
                color: '#333333',
                backgroundColor: 'white'
              }}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// EXCLUDED: Row-click drill-down modal with multi-KPI trendlines not supported per requirements
const TrendModal = ({ isOpen, onClose, selectedRow }) => {
  // Drill-down modal functionality disabled per requirements
  return null;

  /* ORIGINAL CODE - COMMENTED OUT
  if (!isOpen || !selectedRow) return null;

  // Prepare chart data
  const chartData = [
    { day: 'Day 1', installs: 120, revenue: 4800, retention: 33 },
    { day: 'Day 2', installs: 150, revenue: 5200, retention: 35 },
    { day: 'Day 3', installs: 180, revenue: 5800, retention: 32 },
    { day: 'Day 4', installs: 200, revenue: 6100, retention: 38 },
    { day: 'Day 5', installs: 170, revenue: 5900, retention: 36 },
    { day: 'Day 6', installs: 220, revenue: 6400, retention: 34 },
    { day: 'Day 7', installs: 250, revenue: 6800, retention: 37 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Trend Analysis: {selectedRow.gameTitle} - {selectedRow.acquisitionSource}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium mb-4 text-blue-600 text-lg">Installs Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Installs']} />
                  <Line type="monotone" dataKey="installs" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium mb-4 text-green-600 text-lg">Revenue Trend (₹)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium mb-4 text-purple-600 text-lg">Retention Trend (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Retention']} />
                  <Line type="monotone" dataKey="retention" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  */
};

const Table = ({ currentPage, onPageChange, totalPages, totalItems, data, onRowClick, sortConfig, onSort, loading }) => {
  const getSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="flex flex-col w-full items-end justify-end gap-[30px] p-6 relative bg-white rounded-[10px]">
      <div className="flex-col items-start gap-8 w-full flex-[0_0_auto] flex relative self-stretch">
        <div className="flex-col items-start w-full flex-[0_0_auto] flex relative self-stretch overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="h-16 bg-[#ecf8f1] rounded-[10px]">
                {/* EXCLUDED: Game Title KPIs not supported per requirements
                <th className="text-left px-4 py-4">
                  <div className="font-bold text-[#333333] text-sm">
                    Game Title
                  </div>
                </th>
                */}
                <th className="text-left px-4 py-4">
                  <div className="font-bold text-[#333333] text-sm">
                    Acquisition Source
                  </div>
                </th>
                <th className="text-center px-4 py-4 cursor-pointer" onClick={() => onSort('installs')}>
                  <div className="font-bold text-[#333333] text-sm hover:text-[#00a389]">
                    Installs{getSortIcon('installs')}
                  </div>
                </th>
                <th className="text-center px-4 py-4">
                  <div className="font-bold text-[#333333] text-sm">
                    Retention D1/D7
                  </div>
                </th>
                <th className="text-center px-4 py-4 cursor-pointer" onClick={() => onSort('revenue')}>
                  <div className="font-bold text-[#333333] text-sm hover:text-[#00a389]">
                    Revenue{getSortIcon('revenue')}
                  </div>
                </th>
                <th className="text-left px-4 py-4">
                  <div className="font-bold text-[#333333] text-sm">
                    Advertiser
                  </div>
                </th>
                <th className="text-left px-4 py-4">
                  <div className="font-bold text-[#333333] text-sm">
                    Platform
                  </div>
                </th>
                {/* EXCLUDED: Rewards Issued tracking as marketing KPI not supported per requirements
                <th className="text-center px-4 py-4 cursor-pointer" onClick={() => onSort('rewards')}>
                  <div className="font-bold text-[#333333] text-sm hover:text-[#00a389]">
                    Rewards Issued{getSortIcon('rewards')}
                  </div>
                </th>
                */}
                {/* EXCLUDED: ROAS % calculation functionality not supported per requirements
                <th className="text-center px-4 py-4 cursor-pointer" onClick={() => onSort('roas')}>
                  <div className="font-bold text-[#333333] text-sm hover:text-[#00a389] flex items-center justify-center gap-1">
                    ROAS %{getSortIcon('roas')}
                    <span
                      className="text-gray-400 cursor-help"
                      title="Return on Ad Spend: (Revenue ÷ Reward Cost) × 100. Shows profitability of campaigns. >100% indicates profitable campaigns."
                    >
                      ℹ️
                    </span>
                  </div>
                </th>
                */}
                {/* EXCLUDED: Quality Score composite metric not supported per requirements
                <th className="text-center px-4 py-4 cursor-pointer" onClick={() => onSort('qualityScore')}>
                  <div className="font-bold text-[#333333] text-sm hover:text-[#00a389] flex items-center justify-center gap-1">
                    Quality Score{getSortIcon('qualityScore')}
                    <span
                      className="text-gray-400 cursor-help"
                      title="Composite score (0-10) evaluating user quality based on retention rates and revenue generation. Higher scores indicate better user quality."
                    >
                      ℹ️
                    </span>
                  </div>
                </th>
                */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-600">Loading analytics data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.219 0-4.207.906-5.662 2.372A2 2 0 014 19.5V21a1 1 0 002 2h12a1 1 0 002-2v-1.5a2 2 0 00-2.338-1.968z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                <tr
                  key={index}
                  className="h-[66px] border-b [border-bottom-style:solid] border-[#d0d6e7] hover:bg-gray-50 transition-colors"
                  // EXCLUDED: Row click drill-down disabled per requirements
                  // onClick={() => onRowClick(row)}
                >
                  {/* EXCLUDED: Game Title data not displayed per requirements
                  <td className="px-4 py-4">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.gameTitle}
                    </div>
                  </td>
                  */}
                  <td className="px-4 py-4">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.acquisitionSource}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.installs.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      <span className="text-green-600">{row.retentionD1}%</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-blue-600">{row.retentionD7 > 0 ? `${row.retentionD7}%` : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      ₹{row.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.advertiser}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.platform}
                    </div>
                  </td>
                  {/* EXCLUDED: Rewards Issued data not displayed per requirements
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      ₹{row.rewards.toLocaleString()}
                    </div>
                  </td>
                  */}
                  {/* EXCLUDED: ROAS % data not displayed per requirements
                  <td className="px-4 py-4 text-center">
                    <div className={`font-normal text-sm ${
                      parseFloat(row.roas) > 100 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {row.roas}%
                    </div>
                  </td>
                  */}
                  {/* EXCLUDED: Quality Score data not displayed per requirements
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.qualityScore}
                    </div>
                  </td>
                  */}
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
        variant="compact"
      />
    </div>
  );
};

export default function AnalyticsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const { registerSearchHandler, searchTerm } = useSearch();
  const [filters, setFilters] = useState({
    acquisitionSources: [],
    // EXCLUDED: gamesTitles filter removed per requirements
    // gamesTitles: [],
    advertiser: '',
    platform: '',
    country: '',
    metricsType: 'Performance',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  // Register search handler
  useEffect(() => {
    registerSearchHandler((query) => {
      setSearchQuery(query);
      setCurrentPage(1); // Reset to first page when searching
    });
  }, [registerSearchHandler]);

  // Update local search query when search term changes
  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    acquisitionSources: [],
    advertisers: [],
    platforms: [],
  });

  // Fetch analytics data from API
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const apiFilters = {
        startDate: filters.dateRange.start || undefined,
        endDate: filters.dateRange.end || undefined,
        // Note: Multiple acquisition sources filtering is done client-side
        // Single source can be filtered server-side if needed
        advertiser: filters.advertiser || undefined,
        platform: filters.platform || undefined,
      };

      const response = await ANALYTICS_API.getAttributionData(apiFilters);
      
      if (response.data?.success && response.data?.data?.attribution) {
        // Map API attribution data to component format
        const mappedData = response.data.data.attribution.map((item) => {
          // Map source names to display names
          const sourceMap = {
            google: "Google Ads",
            facebook: "Facebook",
            direct: "Organic",
          };
          
          return {
            acquisitionSource: sourceMap[item.source] || item.source.charAt(0).toUpperCase() + item.source.slice(1),
            installs: item.installs || 0,
            retentionD1: item.d1Retention || 0,
            retentionD7: 0, // D7 retention not available in attribution data
            revenue: item.revenue || 0,
            rewards: item.rewardCost || 0,
            advertiser: "N/A", // Not available in attribution data
            platform: "N/A", // Not available in attribution data
            country: "N/A", // Not available in attribution data
          };
        });

        setAnalyticsData(mappedData);

        // Extract unique filter options from data
        const sources = [...new Set(mappedData.map(item => item.acquisitionSource))];
        setFilterOptions(prev => ({
          ...prev,
          acquisitionSources: sources,
        }));
      } else {
        setAnalyticsData([]);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to fetch analytics data");
      setAnalyticsData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch data when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Filter data based on current filters and search query (client-side filtering for search only)
  // Most filtering is done server-side via API, but we do client-side search filtering
  const filteredData = analyticsData.filter(row => {
    // Apply search filter (client-side)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        row.acquisitionSource.toLowerCase().includes(query) ||
        row.advertiser.toLowerCase().includes(query) ||
        row.platform.toLowerCase().includes(query) ||
        row.country.toLowerCase().includes(query) ||
        row.installs.toString().includes(query) ||
        row.revenue.toString().includes(query);
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    // Apply client-side filters for acquisition sources (multi-select)
    if (filters.acquisitionSources.length > 0 && !filters.acquisitionSources.includes(row.acquisitionSource)) {
      return false;
    }
    
    // Other filters are handled server-side via API
    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
      aValue = parseFloat(aValue);
    }
    if (typeof bValue === 'string' && !isNaN(parseFloat(bValue))) {
      bValue = parseFloat(bValue);
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = sortedData.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    // EXCLUDED: Game Title, Rewards Issued, ROAS %, Quality Score columns removed per requirements
    const headers = [
      'Acquisition Source', 'Installs', 'Retention D1%', 'Retention D7%',
      'Revenue', 'Advertiser', 'Platform', 'Country'
    ];

    const csvData = sortedData.map(row => [
      row.acquisitionSource,
      row.installs,
      row.retentionD1,
      row.retentionD7,
      row.revenue,
      row.advertiser,
      row.platform,
      row.country
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <Frame onExportCSV={exportToCSV} />
      <FiltersSection 
        filters={filters} 
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
      />
      <Table
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalItems={totalItems}
        data={paginatedData}
        onRowClick={handleRowClick}
        sortConfig={sortConfig}
        onSort={handleSort}
        loading={loading}
      />
      <TrendModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedRow={selectedRow} 
      />
    </div>
  );
}