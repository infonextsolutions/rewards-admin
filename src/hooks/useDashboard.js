"use client";

import { useState, useCallback } from "react";
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
    revenuePagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 50,
    },
    attribution: [],
    alerts: [],
    search: null,
    filters: null,
  });

  const [loading, setLoading] = useState({
    kpis: false,
    retention: false,
    topGame: false,
    revenue: false,
    attribution: false,
  });
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch all dashboard data in parallel for faster loading
  const fetchDashboardData = useCallback(
    async (filters = {}, signal = null) => {
      if (signal?.aborted) {
        return;
      }

      // Set loading states
      const shouldShowLoading = isInitialLoad;
      if (shouldShowLoading) {
        setLoading({
          kpis: true,
          retention: true,
          topGame: true,
          revenue: true,
          attribution: true,
        });
        setIsInitialLoad(false);
      }
      setError(null);

      try {
        const filtersToUse = filters;

        // Load KPIs first (fastest), then load others in parallel
        const kpisPromise = DASHBOARD_API.getKPIs(filtersToUse, signal)
          .then((response) => {
            if (response.data?.success) {
              const apiData = response.data.data;
              setDashboardData((prev) => ({
                ...prev,
                kpis: apiData.kpis || prev.kpis,
                overview: apiData.overview || prev.overview,
              }));
              setLoading((prev) => ({ ...prev, kpis: false }));
            }
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              setLoading((prev) => ({ ...prev, kpis: false }));
            }
          });

        // Load other sections in parallel after KPIs start
        const otherSectionsPromise = Promise.allSettled([
          // Retention
          DASHBOARD_API.getRetention(filtersToUse, signal)
            .then((response) => {
              if (response.data?.success) {
                setDashboardData((prev) => ({
                  ...prev,
                  retention: response.data.data.retention || prev.retention,
                }));
              }
            })
            .finally(() => {
              setLoading((prev) => ({ ...prev, retention: false }));
            }),

          // Top Game
          DASHBOARD_API.getTopGame(filtersToUse, signal)
            .then((response) => {
              if (response.data?.success) {
                setDashboardData((prev) => ({
                  ...prev,
                  topPlayedGame: response.data.data.topPlayedGame || null,
                }));
              }
            })
            .finally(() => {
              setLoading((prev) => ({ ...prev, topGame: false }));
            }),

          // Revenue - Load first page initially (always page 1 when filters change)
          DASHBOARD_API.getRevenue(filtersToUse, 1, 50, signal)
            .then((response) => {
              if (response.data?.success) {
                const revenueData = response.data.data.revenueByGame || [];
                const pagination = response.data.data.pagination || {
                  currentPage: 1,
                  totalPages: 1,
                  totalItems: 0,
                  itemsPerPage: 50,
                };
                setDashboardData((prev) => ({
                  ...prev,
                  revenueByGame: revenueData,
                  revenuePagination: {
                    ...pagination,
                    currentPage: 1, // Always reset to page 1 on filter change
                  },
                  revenue: {
                    totalRevenue: revenueData.reduce(
                      (sum, game) => sum + (game.revenue || 0),
                      0
                    ),
                    monthlyRevenue: 0,
                  },
                }));
              }
            })
            .finally(() => {
              setLoading((prev) => ({ ...prev, revenue: false }));
            }),

          // Attribution
          DASHBOARD_API.getAttribution(filtersToUse, signal)
            .then((response) => {
              if (response.data?.success) {
                setDashboardData((prev) => ({
                  ...prev,
                  attribution: response.data.data.attribution || [],
                }));
              }
            })
            .finally(() => {
              setLoading((prev) => ({ ...prev, attribution: false }));
            }),
        ]);

        // Wait for KPIs first, then other sections
        await kpisPromise;
        await otherSectionsPromise;
      } catch (err) {
        if (
          err.name === "AbortError" ||
          err.code === "ERR_CANCELED" ||
          err.message === "canceled"
        ) {
          setLoading({
            kpis: false,
            retention: false,
            topGame: false,
            revenue: false,
            attribution: false,
          });
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("[Dashboard] Error fetching data:", {
            message: err.message,
            status: err.response?.status,
          });
        }

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    []
  );

  // Check if any section is still loading
  const isLoading = Object.values(loading).some((val) => val === true);

  // Fetch revenue data for specific page (for pagination)
  const fetchRevenuePage = useCallback(
    async (filters = {}, page = 1, signal = null) => {
      if (signal?.aborted) {
        return;
      }

      setLoading((prev) => ({ ...prev, revenue: true }));

      try {
        const response = await DASHBOARD_API.getRevenue(
          filters,
          page,
          50,
          signal
        );

        if (response.data?.success) {
          const revenueData = response.data.data.revenueByGame || [];
          const pagination = response.data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 50,
          };
          setDashboardData((prev) => ({
            ...prev,
            revenueByGame: revenueData,
            revenuePagination: pagination,
          }));
        }
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          err.code !== "ERR_CANCELED" &&
          err.message !== "canceled"
        ) {
          if (process.env.NODE_ENV === "development") {
            console.error(
              "[Dashboard] Error fetching revenue page:",
              err.message
            );
          }
          toast.error("Failed to fetch revenue data");
        }
      } finally {
        setLoading((prev) => ({ ...prev, revenue: false }));
      }
    },
    []
  );

  return {
    dashboardData,
    loading: isLoading,
    loadingStates: loading, // Individual loading states for progressive rendering
    error,
    fetchDashboardData,
    fetchRevenuePage, // New function for pagination
    clearError: () => setError(null),
  };
}
