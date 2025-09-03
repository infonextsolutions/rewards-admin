'use client';

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Pagination from "../../components/ui/Pagination";

const Frame = ({ onExportCSV }) => {
  return (
    <header
      className="flex w-full items-center justify-between relative mb-6"
      role="banner"
    >
      <div className="relative">
        <h1 className="[font-family:'DM_Sans',Helvetica] font-semibold text-black text-[25.6px] tracking-[0] leading-[normal]">
          Marketing Atrribution &amp;  Analytics
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

const FiltersSection = ({ filters, onFilterChange }) => {
  const acquisitionSources = [
    'Facebook', 'Google Ads', 'TikTok Ads', 'Organic', 'YouTube', 'Instagram', 'Snapchat', 'Unity Ads'
  ];
  
  const gameList = [
    'Lords Mobile', 'Coin Run', 'Puzzle Quest', 'Battle Royale', 'City Builder', 'Racing Thunder'
  ];
  
  const advertiserList = [
    'Azur', 'Gameloft', 'King Digital', 'Supercell', 'Machine Zone'
  ];

  const platformList = [
    'iOS', 'Android', 'Web'
  ];

  const countryList = [
    'United States', 'India', 'United Kingdom', 'Germany', 'Japan', 'Brazil', 'Canada', 'Australia', 'France', 'South Korea'
  ];

  return (
    <div className="bg-white rounded-[10px] p-6 mb-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {/* Acquisition Source */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Acquisition Source</label>
          <select
            multiple
            value={filters.acquisitionSources}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              onFilterChange('acquisitionSources', values);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent h-20 bg-white"
            style={{
              color: '#333333',
              backgroundColor: 'white'
            }}
          >
            {acquisitionSources.map(source => (
              <option key={source} value={source} style={{ color: '#333333', backgroundColor: 'white' }}>{source}</option>
            ))}
          </select>
        </div>

        {/* Game Title */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Game Title</label>
          <select
            multiple
            value={filters.gamesTitles}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              onFilterChange('gamesTitles', values);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent h-20 bg-white"
            style={{
              color: '#333333',
              backgroundColor: 'white'
            }}
          >
            {gameList.map(game => (
              <option key={game} value={game} style={{ color: '#333333', backgroundColor: 'white' }}>{game}</option>
            ))}
          </select>
        </div>

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

        {/* Country */}
        <div className="flex flex-col">
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
        </div>

        {/* Date Range */}
        <div className="flex flex-col sm:col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <label className="text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex flex-col gap-2 lg:flex-row lg:gap-2">
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

const TrendModal = ({ isOpen, onClose, selectedRow }) => {
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
          {/* Installs Trend Chart */}
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

          {/* Revenue Trend Chart */}
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

          {/* Retention Trend Chart */}
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
};

const Table = ({ currentPage, onPageChange, totalPages, totalItems, data, onRowClick, sortConfig, onSort }) => {
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
          <table className="w-full">
            <thead>
              <tr className="h-16 bg-[#ecf8f1] rounded-[10px]">
                <th className="text-left px-4 py-4">
                  <div className="font-bold text-[#333333] text-sm">
                    Game Title
                  </div>
                </th>
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
                <th className="text-center px-4 py-4 cursor-pointer" onClick={() => onSort('rewards')}>
                  <div className="font-bold text-[#333333] text-sm hover:text-[#00a389]">
                    Rewards Issued{getSortIcon('rewards')}
                  </div>
                </th>
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
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className="h-[66px] border-b [border-bottom-style:solid] border-[#d0d6e7] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRowClick(row)}
                >
                  <td className="px-4 py-4">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.gameTitle}
                    </div>
                  </td>
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
                      <span className="text-blue-600">{row.retentionD7}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      ₹{row.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      ₹{row.rewards.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`font-normal text-sm ${
                      parseFloat(row.roas) > 100 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {row.roas}%
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-normal text-[#333333] text-sm">
                      {row.qualityScore}
                    </div>
                  </td>
                </tr>
              ))}
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
  const [filters, setFilters] = useState({
    acquisitionSources: [],
    gamesTitles: [],
    advertiser: '',
    platform: '',
    country: '',
    metricsType: 'Performance',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  // Mock data that matches requirements
  const mockData = [
    {
      gameTitle: "Lords Mobile",
      acquisitionSource: "Facebook",
      installs: 13400,
      retentionD1: 33,
      retentionD7: 12,
      revenue: 48000,
      rewards: 12000,
      roas: "125.5",
      qualityScore: "8.2",
      advertiser: "Azur",
      platform: "iOS",
      country: "United States"
    },
    {
      gameTitle: "Coin Run",
      acquisitionSource: "Google Ads",
      installs: 9800,
      retentionD1: 28,
      retentionD7: 15,
      revenue: 35000,
      rewards: 8500,
      roas: "98.7",
      qualityScore: "7.8",
      advertiser: "Gameloft",
      platform: "Android",
      country: "India"
    },
    {
      gameTitle: "Puzzle Quest",
      acquisitionSource: "TikTok Ads",
      installs: 15600,
      retentionD1: 41,
      retentionD7: 18,
      revenue: 62000,
      rewards: 18000,
      roas: "156.2",
      qualityScore: "9.1",
      advertiser: "King Digital",
      platform: "iOS",
      country: "United Kingdom"
    },
    {
      gameTitle: "Battle Royale",
      acquisitionSource: "Organic",
      installs: 22000,
      retentionD1: 45,
      retentionD7: 22,
      revenue: 88000,
      rewards: 0,
      roas: "∞",
      qualityScore: "9.8",
      advertiser: "Supercell",
      platform: "iOS",
      country: "Japan"
    },
    {
      gameTitle: "City Builder",
      acquisitionSource: "YouTube",
      installs: 7200,
      retentionD1: 25,
      retentionD7: 9,
      revenue: 24000,
      rewards: 6000,
      roas: "88.9",
      qualityScore: "6.5",
      advertiser: "Machine Zone",
      platform: "Android",
      country: "Brazil"
    },
    {
      gameTitle: "Racing Thunder",
      acquisitionSource: "Instagram",
      installs: 11500,
      retentionD1: 36,
      retentionD7: 14,
      revenue: 41000,
      rewards: 11000,
      roas: "112.3",
      qualityScore: "8.0",
      advertiser: "Azur",
      platform: "Web",
      country: "Germany"
    },
    {
      gameTitle: "Lords Mobile",
      acquisitionSource: "Snapchat",
      installs: 5400,
      retentionD1: 29,
      retentionD7: 11,
      revenue: 19000,
      rewards: 5000,
      roas: "95.0",
      qualityScore: "7.2",
      advertiser: "Azur",
      platform: "Android",
      country: "Canada"
    },
    {
      gameTitle: "Coin Run",
      acquisitionSource: "Unity Ads",
      installs: 8900,
      retentionD1: 31,
      retentionD7: 13,
      revenue: 31000,
      rewards: 8000,
      roas: "108.6",
      qualityScore: "7.9",
      advertiser: "Gameloft",
      platform: "iOS",
      country: "Australia"
    },
    {
      gameTitle: "Puzzle Quest",
      acquisitionSource: "Facebook",
      installs: 12200,
      retentionD1: 38,
      retentionD7: 16,
      revenue: 54000,
      rewards: 14000,
      roas: "132.1",
      qualityScore: "8.5",
      advertiser: "King Digital",
      platform: "Android",
      country: "France"
    },
    {
      gameTitle: "Battle Royale",
      acquisitionSource: "Google Ads",
      installs: 18500,
      retentionD1: 42,
      retentionD7: 20,
      revenue: 76000,
      rewards: 19000,
      roas: "145.8",
      qualityScore: "9.3",
      advertiser: "Supercell",
      platform: "Web",
      country: "South Korea"
    }
  ];

  // Filter data based on current filters
  const filteredData = mockData.filter(row => {
    if (filters.acquisitionSources.length > 0 && !filters.acquisitionSources.includes(row.acquisitionSource)) {
      return false;
    }
    if (filters.gamesTitles.length > 0 && !filters.gamesTitles.includes(row.gameTitle)) {
      return false;
    }
    if (filters.advertiser && row.advertiser !== filters.advertiser) {
      return false;
    }
    if (filters.platform && row.platform !== filters.platform) {
      return false;
    }
    if (filters.country && row.country !== filters.country) {
      return false;
    }
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
    const headers = [
      'Game Title', 'Acquisition Source', 'Installs', 'Retention D1%', 'Retention D7%', 
      'Revenue', 'Rewards Issued', 'ROAS %', 'Quality Score', 'Advertiser', 'Platform', 'Country'
    ];
    
    const csvData = sortedData.map(row => [
      row.gameTitle,
      row.acquisitionSource,
      row.installs,
      row.retentionD1,
      row.retentionD7,
      row.revenue,
      row.rewards,
      row.roas,
      row.qualityScore,
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
    <div className="w-full space-y-6 px-4 md:px-0">
      <Frame onExportCSV={exportToCSV} />
      <FiltersSection 
        filters={filters} 
        onFilterChange={handleFilterChange} 
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
      />
      <TrendModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedRow={selectedRow} 
      />
    </div>
  );
}