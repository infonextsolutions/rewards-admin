"use client";

import { useState, useCallback, useEffect } from "react";
import { DASHBOARD_API } from "../data/dashboard";
import toast from "react-hot-toast";

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 0,
      vipUsers: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      totalTiers: 0,
      vipConversionRate: "0.00",
    },
    revenue: {
      totalRevenue: 0,
      monthlyRevenue: 0,
    },
    tierDistribution: [],
    kpis: {
      totalRegisteredUsers: 0,
      activeUsersToday: 0,
      totalRewardsIssued: 0,
      totalRedemptions: 0,
      avgXPPerUser: 0,
    },
    retention: {
      current: {
        d1: 0,
        d7: 0,
        d14: 0,
        d30: 0,
      },
      trend: [],
      totalCohort: 0,
    },
    topPlayedGame: null,
    revenueByGame: [],
    attribution: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (filters = {}, signal = null) => {
    setLoading(true);
    setError(null);

    try {
      const filtersToUse = filters;
      const response = await DASHBOARD_API.getDashboardData(filtersToUse, signal);
      if (response.data?.success) {
        const apiData = response.data.data;
        
        // Map API response to existing data structure
        const mappedData = {
          overview: {
            totalUsers: apiData.overview?.totalUsers || apiData.kpis?.totalRegisteredUsers || 0,
            vipUsers: apiData.overview?.vipUsers || 0,
            totalSubscriptions: apiData.overview?.totalSubscriptions || 0,
            activeSubscriptions: apiData.overview?.activeSubscriptions || 0,
            totalTiers: apiData.overview?.totalTiers || 0,
            vipConversionRate: apiData.overview?.vipUsers && apiData.overview?.totalUsers
              ? ((apiData.overview.vipUsers / apiData.overview.totalUsers) * 100).toFixed(2)
              : "0.00",
          },
          revenue: {
            totalRevenue: apiData.revenueByGame?.reduce((sum, game) => sum + (game.revenue || 0), 0) || 0,
            monthlyRevenue: 0, // Not provided in API
          },
          tierDistribution: [],
          kpis: apiData.kpis || {
            totalRegisteredUsers: 0,
            activeUsersToday: 0,
            totalRewardsIssued: 0,
            totalRedemptions: 0,
            avgXPPerUser: 0,
          },
          retention: apiData.retention || {
            current: { d1: 0, d7: 0, d14: 0, d30: 0 },
            trend: [],
            totalCohort: 0,
          },
          topPlayedGame: apiData.topPlayedGame || null,
          revenueByGame: apiData.revenueByGame || [],
          attribution: apiData.attribution || [],
        };
        
        setDashboardData(mappedData);
        return mappedData;
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch dashboard data"
        );
      }
    } catch (err) {
      // Don't show error for aborted requests
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch dashboard data";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    clearError: () => setError(null),
  };
}
