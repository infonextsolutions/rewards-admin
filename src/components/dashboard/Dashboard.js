'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import KPICards from './KPICards';
import FilterControls from './FilterControls';
import RetentionTrendGraph from './RetentionTrendGraph';
import TopPlayedGameSnapshot from './TopPlayedGameSnapshot';
import RevenueVsRewardTable from './RevenueVsRewardTable';
import AttributionPerformanceTable from './AttributionPerformanceTable';

const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    game: 'all',
    source: 'all',
    ageRange: 'all',
    gender: 'all'
  });
  
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalUsers: 45789,
      activeUsersToday: 3247,
      totalRewardsIssued: 2456789,
      totalRedemptions: 1234567,
      avgXPPerUser: 847
    },
    retentionData: [],
    topGame: null,
    revenueData: [],
    attributionData: [],
    loading: false
  });

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Simulate data loading based on filters
  useEffect(() => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    
    // Simulate API call delay
    setTimeout(() => {
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        // Data would be filtered based on current filters
      }));
    }, 500);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Hello, {user?.firstName || 'Admin'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome to your admin dashboard - here&apos;s what&apos;s happening today
        </p>
      </div>

      {/* Filter Controls */}
      <FilterControls 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      {/* KPI Cards */}
      <KPICards 
        data={dashboardData.kpis} 
        loading={dashboardData.loading} 
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Retention Trend Graph - Takes 2/3 width */}
        <div className="xl:col-span-2">
          <RetentionTrendGraph 
            data={dashboardData.retentionData}
            filters={filters}
            loading={dashboardData.loading}
          />
        </div>
        
        {/* Top Played Game Snapshot - Takes 1/3 width */}
        <div className="xl:col-span-1">
          <TopPlayedGameSnapshot 
            data={dashboardData.topGame}
            loading={dashboardData.loading}
          />
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue vs Reward Cost Table */}
        <RevenueVsRewardTable 
          data={dashboardData.revenueData}
          loading={dashboardData.loading}
        />
        
        {/* Attribution Performance Table */}
        <AttributionPerformanceTable 
          data={dashboardData.attributionData}
          loading={dashboardData.loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;