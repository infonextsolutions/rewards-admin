"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import KPICards from "./KPICards";
import FilterControls from "./FilterControls";
import RetentionTrendGraph from "./RetentionTrendGraph";
import TopPlayedGameSnapshot from "./TopPlayedGameSnapshot";
import RevenueVsRewardTable from "./RevenueVsRewardTable";
import AttributionPerformanceTable from "./AttributionPerformanceTable";

const Dashboard = () => {
  const { user } = useAuth();
  const filterTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [filters, setFilters] = useState({
    dateRange: "last30days",
    game: "all",
    source: "all",
    gender: "all",
    search: "",
  });

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date(now);
    
    switch (filters.dateRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last30days":
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last90days":
        startDate.setDate(startDate.getDate() - 90);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "lastYear":
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      gameId: filters.game && filters.game !== "all" ? filters.game : undefined,
      source: filters.source && filters.source !== "all" ? filters.source : undefined,
      gender: filters.gender && filters.gender !== "all" ? filters.gender : undefined,
      search: filters.search && filters.search.trim() !== "" ? filters.search.trim() : undefined,
    };
  }, [filters]);

  const { dashboardData, loading, error, fetchDashboardData } = useDashboard();

  // Optimized fetch function - instant for dropdowns, debounced for search
  const optimizedFetch = useCallback((filtersToUse, isSearch = false) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // All filters trigger immediately since search is pre-debounced in FilterControls (250ms)
    // Dropdown filters: instant response (0ms delay)
    // Search: already debounced to 250ms in FilterControls, so we can call immediately here
    // This prevents double debouncing and makes the UI feel much faster
    fetchDashboardData(filtersToUse, abortControllerRef.current?.signal);
  }, [fetchDashboardData]);

  // Initial load - fetch immediately without debounce
  const isInitialMount = useRef(true);

  // Track previous filters to detect if it's a search change
  const prevFiltersRef = useRef(apiFilters);

  // Refetch data when filters change (with optimized debouncing)
  useEffect(() => {
    if (isInitialMount.current) {
      // First load - fetch immediately without debounce
      isInitialMount.current = false;
      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }
      fetchDashboardData(apiFilters, abortControllerRef.current.signal);
      prevFiltersRef.current = apiFilters;
    } else {
      // Check if this is a search change or filter change
      const isSearchChange = 
        prevFiltersRef.current?.search !== apiFilters?.search;
      
      // Subsequent changes - use optimized fetch (instant for dropdowns, debounced for search)
      optimizedFetch(apiFilters, isSearchChange);
      prevFiltersRef.current = apiFilters;
    }

    // Cleanup function
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [apiFilters, optimizedFetch, fetchDashboardData]);

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  // Memoize data transformations for performance
  const retentionData = useMemo(() => dashboardData.retention?.trend || [], [dashboardData.retention?.trend]);
  
  const topGameData = useMemo(() => {
    if (dashboardData.topPlayedGame) {
      return {
        name: dashboardData.topPlayedGame.title || "N/A",
        banner: dashboardData.topPlayedGame.banner || "https://c.animaapp.com/7TgsSdEJ/img/image-16@2x.png",
        avgXP: dashboardData.topPlayedGame.analytics?.averageXP || 0,
        rewardConversion: dashboardData.topPlayedGame.analytics?.rewardConversion || 0,
        demographics: dashboardData.topPlayedGame.demographics || {
          age: [],
          gender: [],
          region: [],
          tier: [],
        },
      };
    }
    return {
      name: "N/A",
      banner: "https://c.animaapp.com/7TgsSdEJ/img/image-16@2x.png",
      avgXP: 0,
      rewardConversion: 0,
      demographics: {
        age: [],
        gender: [],
        region: [],
        tier: [],
      },
    };
  }, [dashboardData.topPlayedGame]);

  const revenueByGame = useMemo(() => dashboardData.revenueByGame || [], [dashboardData.revenueByGame]);
  const attributionData = useMemo(() => dashboardData.attribution || [], [dashboardData.attribution]);
  const retentionCurrent = useMemo(() => dashboardData.retention?.current, [dashboardData.retention?.current]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, {user?.firstName || "Admin"}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to your admin dashboard - here&apos;s what&apos;s happening
            today
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <FilterControls filters={filters} onFilterChange={handleFilterChange} loading={loading} />

      {/* KPI Cards */}
      <KPICards data={dashboardData} loading={loading} />

      {/* Retention Trend Graph Section */}
      <div className="mb-6">
        <RetentionTrendGraph
          data={retentionData}
          retentionCurrent={retentionCurrent}
          filters={filters}
          loading={loading}
        />
      </div>

      {/* Top Played Game Section */}
      <div className="mb-6">
        <TopPlayedGameSnapshot data={topGameData} loading={loading} />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue vs Reward Cost Table */}
        <RevenueVsRewardTable data={revenueByGame} loading={loading} />

        {/* Attribution Performance Table */}
        <AttributionPerformanceTable
          data={attributionData}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
