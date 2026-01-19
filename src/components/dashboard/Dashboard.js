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
    age: "all",
    search: "",
    customStartDate: "",
    customEndDate: "",
  });

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const now = new Date();
    let endDate = new Date(now);
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
      case "custom":
        // Use custom dates if both are provided
        if (filters.customStartDate && filters.customEndDate) {
          startDate = new Date(filters.customStartDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(filters.customEndDate);
          endDate.setHours(23, 59, 59, 999);

          // Validate that end date is not before start date
          if (startDate > endDate) {
            console.warn('Invalid date range: End date is before start date');
            return null; // Don't trigger API call with invalid date range
          }
        } else {
          // If custom dates not complete, don't trigger API call yet
          // Return undefined to prevent API call
          return null;
        }
        break;
      case "all":
        // For "all", don't set date filters - will be undefined
        startDate = undefined;
        endDate = undefined;
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
    }

    return {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      gameId: filters.game && filters.game !== "all" ? filters.game : undefined,
      source:
        filters.source && filters.source !== "all" ? filters.source : undefined,
      gender:
        filters.gender && filters.gender !== "all" ? filters.gender : undefined,
      age: filters.age && filters.age !== "all" ? filters.age : undefined,
      search:
        filters.search && filters.search.trim() !== ""
          ? filters.search.trim()
          : undefined,
    };
  }, [
    filters.dateRange,
    filters.game,
    filters.source,
    filters.gender,
    filters.age,
    filters.search,
    filters.customStartDate,
    filters.customEndDate,
  ]);

  const { dashboardData, loading, loadingStates, error, fetchDashboardData } =
    useDashboard();

  // Optimized fetch function - instant for dropdowns, debounced for search
  const optimizedFetch = useCallback(
    (filtersToUse, isSearch = false) => {
      // Cancel previous request if exists (only for filter changes, not initial mount)
      if (abortControllerRef.current && !isInitialMount.current) {
        abortControllerRef.current.abort();
      }

      // Clear existing timeout
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
        filterTimeoutRef.current = null;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // All filters trigger immediately since search is pre-debounced in FilterControls (250ms)
      // Dropdown filters: instant response (0ms delay)
      // Search: already debounced to 250ms in FilterControls, so we can call immediately here
      // This prevents double debouncing and makes the UI feel much faster
      fetchDashboardData(filtersToUse, abortControllerRef.current?.signal);
    },
    [fetchDashboardData]
  );

  // Initial load - fetch immediately without debounce
  const isInitialMount = useRef(true);

  // Track previous filters to detect if it's a search change
  // Initialize to null so first render always triggers
  const prevFiltersRef = useRef(null);

  // Helper function to check if filters actually changed
  const filtersChanged = useCallback((prev, current) => {
    // If prev is null/undefined, consider it changed (first load)
    if (!prev) return true;
    if (!current) return false;

    return (
      prev.startDate !== current.startDate ||
      prev.endDate !== current.endDate ||
      prev.gameId !== current.gameId ||
      prev.source !== current.source ||
      prev.gender !== current.gender ||
      prev.age !== current.age ||
      prev.search !== current.search
    );
  }, []);

  // Refetch data when filters change (with optimized debouncing)
  useEffect(() => {
    // Skip API call if apiFilters is null (incomplete custom date range)
    if (apiFilters === null) {
      return;
    }

    // Check if filters actually changed to prevent unnecessary API calls
    // But always allow initial mount
    if (
      !isInitialMount.current &&
      !filtersChanged(prevFiltersRef.current, apiFilters)
    ) {
      return;
    }

    if (isInitialMount.current) {
      // First load - fetch immediately without debounce
      isInitialMount.current = false;

      // Don't abort previous request on initial mount (handles React Strict Mode)
      // Just create a new controller if needed
      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }

      fetchDashboardData(apiFilters, abortControllerRef.current.signal);
      prevFiltersRef.current = apiFilters;
    } else {
      // Subsequent changes - not initial mount
      // Check if this is a custom date change (needs debouncing)
      const isCustomDateChange =
        filters.dateRange === "custom" &&
        (prevFiltersRef.current?.startDate !== apiFilters?.startDate ||
          prevFiltersRef.current?.endDate !== apiFilters?.endDate);

      // Check if this is a search change
      const isSearchChange =
        prevFiltersRef.current?.search !== apiFilters?.search;

      // For custom date changes, add debounce to prevent double API calls
      if (isCustomDateChange) {
        // Clear existing timeout
        if (filterTimeoutRef.current) {
          clearTimeout(filterTimeoutRef.current);
        }

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Debounce custom date changes by 600ms to wait for both dates to be set
        // This prevents double API calls when user selects start date then end date
        filterTimeoutRef.current = setTimeout(() => {
          // Double-check filters haven't changed during debounce
          if (filtersChanged(prevFiltersRef.current, apiFilters)) {
            fetchDashboardData(apiFilters, abortControllerRef.current?.signal);
            prevFiltersRef.current = apiFilters;
          }
        }, 600);
      } else {
        // For other filter changes, use optimized fetch (instant for dropdowns)
        optimizedFetch(apiFilters, isSearchChange);
        prevFiltersRef.current = apiFilters;
      }
    }

    // Cleanup function
    return () => {
      // Clear timeout if exists
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
        filterTimeoutRef.current = null;
      }
    };
  }, [
    apiFilters,
    optimizedFetch,
    fetchDashboardData,
    filters.dateRange,
    filtersChanged,
  ]);

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  // Memoize data transformations for performance
  const retentionData = useMemo(
    () => dashboardData.retention?.trend || [],
    [dashboardData.retention?.trend]
  );

  const topGameData = useMemo(() => {
    if (dashboardData.topPlayedGame) {
      // Extract banner image URL with proper fallback chain
      let bannerImageUrl = null;

      // Try banner field first (backend now provides this)
      if (dashboardData.topPlayedGame.banner) {
        bannerImageUrl = dashboardData.topPlayedGame.banner;
      }
      // Then try bannerImage.url
      else if (dashboardData.topPlayedGame.bannerImage?.url) {
        bannerImageUrl = dashboardData.topPlayedGame.bannerImage.url;
      }
      // Then try bannerImage as string
      else if (typeof dashboardData.topPlayedGame.bannerImage === "string") {
        bannerImageUrl = dashboardData.topPlayedGame.bannerImage;
      }
      // Then try bannerImage object itself
      else if (dashboardData.topPlayedGame.bannerImage) {
        bannerImageUrl = dashboardData.topPlayedGame.bannerImage;
      }
      // Final fallback to default
      else {
        bannerImageUrl = "https://c.animaapp.com/7TgsSdEJ/img/image-16@2x.png";
      }

      // Trim game name to remove text after " - " (dash)
      const gameTitle = dashboardData.topPlayedGame.title || "N/A";
      const trimmedTitle = gameTitle.split(" - ")[0].trim();

      return {
        gameId: dashboardData.topPlayedGame.gameId,
        name: trimmedTitle,
        banner: bannerImageUrl,
        avgXP: dashboardData.topPlayedGame.analytics?.averageXP || 0,
        rewardConversion:
          dashboardData.topPlayedGame.analytics?.rewardConversion || 0,
        demographics: dashboardData.topPlayedGame.demographics || {
          age: [],
          gender: [],
          region: [],
          tier: [],
        },
      };
    }
    // Return null when no top played game exists
    return null;
  }, [dashboardData.topPlayedGame]);

  const revenueByGame = useMemo(
    () => dashboardData.revenueByGame || [],
    [dashboardData.revenueByGame]
  );
  const attributionData = useMemo(
    () => dashboardData.attribution || [],
    [dashboardData.attribution]
  );
  const retentionCurrent = useMemo(
    () => dashboardData.retention?.current,
    [dashboardData.retention?.current]
  );

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
      <FilterControls
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      {/* KPI Cards - Show immediately with loading state */}
      <KPICards data={dashboardData} loading={loadingStates.kpis} />

      {/* Retention Trend Graph Section */}
      <div className="mb-6">
        <RetentionTrendGraph
          data={retentionData}
          retentionCurrent={retentionCurrent}
          filters={filters}
          loading={loadingStates.retention}
        />
      </div>

      {/* Top Played Game Section */}
      <div className="mb-6">
        <TopPlayedGameSnapshot
          data={topGameData}
          loading={loadingStates.topGame}
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue vs Reward Cost Table */}
        <RevenueVsRewardTable
          data={revenueByGame}
          pagination={dashboardData.revenuePagination}
          loading={loadingStates.revenue}
          filters={apiFilters}
          onPageChange={(page) => {
            if (apiFilters) {
              fetchRevenuePage(apiFilters, page);
            }
          }}
        />

        {/* Attribution Performance Table */}
        <AttributionPerformanceTable
          data={attributionData}
          loading={loadingStates.attribution}
        />
      </div>
    </div>
  );
};

export default Dashboard;
