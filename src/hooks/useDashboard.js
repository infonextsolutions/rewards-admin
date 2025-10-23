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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await DASHBOARD_API.getDashboardData();
      if (response.data?.success) {
        setDashboardData(response.data.data);
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch dashboard data"
        );
      }
    } catch (err) {
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

  // Auto-fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    clearError: () => setError(null),
  };
}
