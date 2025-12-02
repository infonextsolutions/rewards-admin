"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "../ui/Pagination";
import LoadingSpinner from "../ui/LoadingSpinner";
import surveyAPIs from "../../data/surveys/surveyAPI";
import toast from "react-hot-toast";

export default function BitLabSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [configuredSurveys, setConfiguredSurveys] = useState([]);
  const [countryFilter, setCountryFilter] = useState("US"); // Country code filter (default: US)

  // Sort filter states (dropdown for ascending/descending)
  const [sortFilters, setSortFilters] = useState({
    value: "", // "asc", "desc", or ""
    cpi: "",
    loi: "",
  });

  // Toggle states for surveys (sync/unsync operations)
  const [syncingSurveys, setSyncingSurveys] = useState(new Set());

  // Fetch surveys
  const fetchSurveys = async (page = pagination.currentPage) => {
    console.log("🔵 [ADMIN FRONTEND] BitLabSurveys: fetchSurveys called", {
      page,
      countryFilter,
      itemsPerPage: pagination.itemsPerPage,
    });
    setLoading(true);
    try {
      // Use admin route for non-game offers with type=survey filter
      const queryParams = {
        type: "survey",
        page,
        limit: pagination.itemsPerPage,
        country: countryFilter,
      };
      console.log("🔵 [ADMIN FRONTEND] Sending query to backend:", queryParams);
      const response = await surveyAPIs.getBitLabNonGameOffers(queryParams);
      console.log("🔵 [ADMIN FRONTEND] Received response from backend:", {
        success: response.success,
        hasCategorized: !!response.categorized,
        surveysCount: response.categorized?.surveys?.length || 0,
        totalOffers: response.total || 0,
      });

      if (response.success && response.categorized) {
        const surveys = response.categorized.surveys || [];
        const mappedSurveys = surveys.map((survey) => ({
          id: survey.id || survey.surveyId || survey.offerId,
          surveyId: survey.surveyId || survey.id || survey.offerId,
          offerId: survey.offerId || survey.id || survey.surveyId,
          title: survey.title || survey.name || "Untitled Survey",
          description: survey.description || "",
          icon: survey.icon || survey.banner || "",
          banner: survey.banner || survey.icon || "",
          reward: survey.reward || { coins: 0, currency: "points", xp: 0 },
          estimatedTime:
            survey.estimatedTime || survey.duration || survey.loi || 0,
          clickUrl: survey.clickUrl || survey.surveyUrl || survey.url || "",
          confirmationTime: survey.confirmationTime || "",
          pendingTime: survey.pendingTime || 0,
          isAvailable: survey.isAvailable !== false,
          provider: survey.provider || "bitlabs",
          requirements: survey.requirements || "",
          thingsToKnow: survey.thingsToKnow || [],
          category:
            typeof survey.category === "string"
              ? survey.category
              : survey.category?.name || "Survey",
          // Bitlabs specific fields
          value: survey.value ? parseFloat(survey.value) : 0, // Publisher reward value
          cpi: survey.cpi ? parseFloat(survey.cpi) : 0, // USD payment to publisher
          loi: survey.loi ? parseFloat(survey.loi) : survey.estimatedTime || 0, // Length of interview (minutes)
          cr: survey.cr || 0, // Conversion rate
          rating: survey.rating || 0, // Survey rating
          country: survey.country || "",
          language: survey.language || "",
          // User reward fields (calculated with 20% margin)
          userRewardCoins: survey.userRewardCoins || survey.reward?.coins || 0, // User gets 20% of value as coins
          userRewardXP: survey.userRewardXP || survey.reward?.xp || 0, // User gets 50% of coins as XP
        }));

        setSurveys(mappedSurveys);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(surveys.length / pagination.itemsPerPage),
          totalItems: surveys.length,
          itemsPerPage: pagination.itemsPerPage,
        });
      } else if (response.success && !response.categorized) {
        // Fallback: if categorized is not available, try data array
        const surveys = response.data || [];
        const mappedSurveys = surveys
          .filter((s) => s.type === "survey" || s.offerType === "survey")
          .map((survey) => ({
            id: survey.id || survey.surveyId || survey.offerId,
            surveyId: survey.surveyId || survey.id || survey.offerId,
            offerId: survey.offerId || survey.id || survey.surveyId,
            title: survey.title || survey.name || "Untitled Survey",
            description: survey.description || "",
            icon: survey.icon || survey.banner || "",
            banner: survey.banner || survey.icon || "",
            reward: survey.reward || { coins: 0, currency: "points", xp: 0 },
            estimatedTime:
              survey.estimatedTime || survey.duration || survey.loi || 0,
            clickUrl: survey.clickUrl || survey.surveyUrl || survey.url || "",
            isAvailable: survey.isAvailable !== false,
            provider: survey.provider || "bitlabs",
            category:
              typeof survey.category === "string"
                ? survey.category
                : survey.category?.name || "Survey",
            // Bitlabs specific fields
            value: survey.value ? parseFloat(survey.value) : 0,
            cpi: survey.cpi ? parseFloat(survey.cpi) : 0,
            loi: survey.loi
              ? parseFloat(survey.loi)
              : survey.estimatedTime || 0,
            cr: survey.cr || 0,
            rating: survey.rating || 0,
            country: survey.country || "",
            language: survey.language || "",
            // User reward fields (calculated with 20% margin)
            userRewardCoins:
              survey.userRewardCoins || survey.reward?.coins || 0, // User gets 20% of value as coins
            userRewardXP: survey.userRewardXP || survey.reward?.xp || 0, // User gets 50% of coins as XP
          }));
        setSurveys(mappedSurveys);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(mappedSurveys.length / pagination.itemsPerPage),
          totalItems: mappedSurveys.length,
          itemsPerPage: pagination.itemsPerPage,
        });
      }
    } catch (error) {
      console.error("Error fetching BitLab surveys:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
      });
      toast.error(error.message || "Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  // Fetch configured surveys from database
  const fetchConfiguredSurveys = async () => {
    try {
      const response = await surveyAPIs.getConfiguredBitLabOffers({
        offerType: "survey",
        status: "all",
      });
      if (response.success) {
        setConfiguredSurveys(response.data.configuredOffers || []);
      }
    } catch (error) {
      console.error("Error fetching configured surveys:", error);
    }
  };

  useEffect(() => {
    console.log("BitLabSurveys: Component mounted, fetching surveys...");
    fetchSurveys(1);
    fetchConfiguredSurveys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    fetchSurveys(newPage);
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    return {
      totalSurveys: surveys.length,
      totalReward: surveys.reduce((sum, s) => sum + (s.reward?.coins || 0), 0),
      totalXP: surveys.reduce((sum, s) => sum + (s.reward?.xp || 0), 0),
      avgEstimatedTime:
        surveys.length > 0
          ? Math.round(
              surveys.reduce((sum, s) => sum + (s.estimatedTime || 0), 0) /
                surveys.length
            )
          : 0,
      availableSurveys: surveys.filter((s) => s.isAvailable !== false).length,
    };
  }, [surveys]);

  // Get configured survey database ID
  const getConfiguredSurveyId = (surveyId) => {
    const configured = configuredSurveys.find((c) => c.externalId === surveyId);
    return configured ? configured._id || configured.id : null;
  };

  // Check if survey is already configured
  const isConfigured = (surveyId) => {
    return configuredSurveys.some((c) => c.externalId === surveyId);
  };

  // Get configured survey status
  const getConfiguredSurveyStatus = (surveyId) => {
    const configured = configuredSurveys.find((c) => c.externalId === surveyId);
    return configured ? configured.status : null;
  };

  // Toggle survey sync/unsync (sync if not synced, unsync if synced)
  const handleToggleSync = async (surveyId) => {
    const isCurrentlySynced = isConfigured(surveyId);
    setSyncingSurveys((prev) => new Set(prev).add(surveyId));

    try {
      if (isCurrentlySynced) {
        // Unsync: Delete the configured survey
        const dbId = getConfiguredSurveyId(surveyId);
        if (!dbId) {
          throw new Error("Survey ID not found in configured surveys");
        }
        const response = await surveyAPIs.deleteConfiguredOffer(dbId);
        if (response.success) {
          toast.success("Survey unsynced successfully");
          fetchConfiguredSurveys(); // Refresh configured surveys
        }
      } else {
        // Sync: Add survey to database
        const response = await surveyAPIs.syncSingleBitLabOffer(
          surveyId,
          "survey",
          undefined,
          countryFilter
        );
        if (response.success) {
          toast.success("Survey synced successfully");
          fetchConfiguredSurveys(); // Refresh configured surveys
        }
      }
    } catch (error) {
      console.error("Error toggling survey sync:", error);
      toast.error(error.message || "Failed to sync/unsync survey");
    } finally {
      setSyncingSurveys((prev) => {
        const next = new Set(prev);
        next.delete(surveyId);
        return next;
      });
    }
  };

  // Sort surveys based on dropdown filters (ascending/descending)
  const filteredSurveys = useMemo(() => {
    let sorted = [...surveys];

    // Sort by Value
    if (sortFilters.value === "asc") {
      sorted.sort((a, b) => (a.value || 0) - (b.value || 0));
    } else if (sortFilters.value === "desc") {
      sorted.sort((a, b) => (b.value || 0) - (a.value || 0));
    }

    // Sort by CPI
    if (sortFilters.cpi === "asc") {
      sorted.sort((a, b) => (a.cpi || 0) - (b.cpi || 0));
    } else if (sortFilters.cpi === "desc") {
      sorted.sort((a, b) => (b.cpi || 0) - (a.cpi || 0));
    }

    // Sort by LOI (Time)
    if (sortFilters.loi === "asc") {
      sorted.sort(
        (a, b) =>
          (a.loi || a.estimatedTime || 0) - (b.loi || b.estimatedTime || 0)
      );
    } else if (sortFilters.loi === "desc") {
      sorted.sort(
        (a, b) =>
          (b.loi || b.estimatedTime || 0) - (a.loi || a.estimatedTime || 0)
      );
    }

    return sorted;
  }, [surveys, sortFilters]);

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BitLab Surveys</h2>
          <p className="text-gray-600 mt-1">
            Select surveys to show on user side
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {configuredSurveys.length} surveys synced
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Country Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                fetchSurveys(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value Sort Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Sort by Value (Points)
            </label>
            <select
              value={sortFilters.value}
              onChange={(e) =>
                setSortFilters({ ...sortFilters, value: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">No Sort</option>
              <option value="asc">Ascending (Low to High)</option>
              <option value="desc">Descending (High to Low)</option>
            </select>
          </div>

          {/* CPI Sort Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Sort by CPI (USD)
            </label>
            <select
              value={sortFilters.cpi}
              onChange={(e) =>
                setSortFilters({ ...sortFilters, cpi: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">No Sort</option>
              <option value="asc">Ascending (Low to High)</option>
              <option value="desc">Descending (High to Low)</option>
            </select>
          </div>

          {/* LOI Sort Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Sort by Time (LOI - min)
            </label>
            <select
              value={sortFilters.loi}
              onChange={(e) =>
                setSortFilters({ ...sortFilters, loi: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">No Sort</option>
              <option value="asc">Ascending (Low to High)</option>
              <option value="desc">Descending (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(sortFilters.value || sortFilters.cpi || sortFilters.loi) && (
          <div className="mt-4">
            <button
              onClick={() =>
                setSortFilters({
                  value: "",
                  cpi: "",
                  loi: "",
                })
              }
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear All Sorts
            </button>
          </div>
        )}

        {/* Filter Results Summary */}
        <div className="text-sm text-gray-600 mt-4">
          Showing {filteredSurveys.length} of {surveys.length} surveys
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner message="Loading BitLab surveys..." />
      ) : (
        <>
          {/* Surveys Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Survey ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Survey Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPI (USD)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value (Points)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Reward (Coins)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Reward (XP)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time (LOI - min)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sync Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSurveys.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No surveys found
                      </td>
                    </tr>
                  ) : (
                    filteredSurveys.map((survey) => {
                      const configured = isConfigured(survey.id);
                      const configuredStatus = getConfiguredSurveyStatus(
                        survey.id
                      );
                      const isActive = configuredStatus === "live";
                      const isSyncing = syncingSurveys.has(survey.id);

                      return (
                        <tr
                          key={survey.id}
                          className={`hover:bg-gray-50 ${
                            configured && isActive
                              ? "bg-green-50"
                              : configured
                              ? "bg-yellow-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="text-xs font-mono text-gray-600 break-all">
                              {survey.id?.toString() || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              {survey.icon && (
                                <img
                                  src={survey.icon}
                                  alt={survey.title}
                                  className="w-8 h-8 rounded-lg mr-2"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                  <span className="max-w-xs truncate">
                                    {survey.title}
                                  </span>
                                  {configured && (
                                    <span
                                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                        isActive
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {isActive ? "✓ Active" : "⏸ Paused"}
                                    </span>
                                  )}
                                </div>
                                {survey.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {survey.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${survey.cpi > 0 ? survey.cpi.toFixed(2) : "0.00"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Publisher
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {survey.value > 0 ? survey.value : "0"}
                            </div>
                            <div className="text-xs text-gray-500">Points</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-emerald-600">
                              {survey.userRewardCoins ||
                                survey.reward?.coins ||
                                0}{" "}
                              coins
                            </div>
                            <div className="text-xs text-gray-500">
                              20% of value
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {survey.userRewardXP || survey.reward?.xp || 0} XP
                            </div>
                            <div className="text-xs text-gray-500">
                              50% of coins
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {survey.loi > 0
                              ? `${survey.loi} min`
                              : survey.estimatedTime
                              ? `${survey.estimatedTime} min`
                              : "N/A"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={configured}
                                    onChange={() => handleToggleSync(survey.id)}
                                    disabled={isSyncing}
                                  />
                                  <div
                                    className={`block w-10 h-6 rounded-full transition-colors ${
                                      configured
                                        ? "bg-emerald-600"
                                        : "bg-gray-300"
                                    } ${
                                      isSyncing
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  ></div>
                                  <div
                                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                      configured ? "translate-x-full" : ""
                                    }`}
                                  ></div>
                                </div>
                                {isSyncing ? (
                                  <span className="ml-3 text-xs text-gray-500">
                                    {configured ? "Unsyncing..." : "Syncing..."}
                                  </span>
                                ) : (
                                  <span className="ml-3 text-xs text-gray-700 font-medium">
                                    {configured ? "Synced" : "Not Synced"}
                                  </span>
                                )}
                              </label>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={filteredSurveys.length}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
