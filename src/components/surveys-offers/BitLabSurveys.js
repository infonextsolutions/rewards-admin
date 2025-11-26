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

  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [configuredSurveys, setConfiguredSurveys] = useState([]);
  const [showConfigured, setShowConfigured] = useState(false);
  const [countryFilter, setCountryFilter] = useState("US"); // Country code filter (default: US)

  // Fetch surveys
  const fetchSurveys = async (page = pagination.currentPage) => {
    console.log("BitLabSurveys: fetchSurveys called", { page });
    setLoading(true);
    try {
      // Use admin route for non-game offers with type=survey filter
      const response = await surveyAPIs.getBitLabNonGameOffers({
        type: "survey",
        page,
        limit: pagination.itemsPerPage,
        country: countryFilter,
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
          estimatedTime: survey.estimatedTime || survey.duration || 0,
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
            estimatedTime: survey.estimatedTime || survey.duration || 0,
            clickUrl: survey.clickUrl || survey.surveyUrl || survey.url || "",
            isAvailable: survey.isAvailable !== false,
            provider: survey.provider || "bitlabs",
            category:
              typeof survey.category === "string"
                ? survey.category
                : survey.category?.name || "Survey",
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

  useEffect(() => {
    setSelectedSurveys([]); // Clear selection when filter changes
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

  // Handle survey selection
  const handleSelectSurvey = (surveyId) => {
    setSelectedSurveys((prev) =>
      prev.includes(surveyId)
        ? prev.filter((id) => id !== surveyId)
        : [...prev, surveyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSurveys.length === surveys.length) {
      setSelectedSurveys([]);
    } else {
      setSelectedSurveys(surveys.map((s) => s.id));
    }
  };

  // Sync selected surveys to database
  const handleSyncSelected = async () => {
    if (selectedSurveys.length === 0) {
      toast.error("Please select at least one survey to sync");
      return;
    }

    setSyncing(true);
    try {
      const response = await surveyAPIs.syncBitLabOffers({
        offerIds: selectedSurveys,
        offerType: "survey",
        autoActivate: true,
        country: countryFilter,
      });

      if (response.success) {
        toast.success(
          `Successfully synced ${response.data.syncedCount} survey(s)! ${
            response.data.updatedCount > 0
              ? `${response.data.updatedCount} updated.`
              : ""
          }`
        );
        setSelectedSurveys([]);
        // Refresh surveys and configured list
        fetchSurveys();
        fetchConfiguredSurveys();
      }
    } catch (error) {
      console.error("Error syncing surveys:", error);
      toast.error(error.message || "Failed to sync surveys");
    } finally {
      setSyncing(false);
    }
  };

  // Sync all surveys to database
  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const response = await surveyAPIs.syncBitLabOffers({
        offerType: "survey",
        autoActivate: true,
        country: countryFilter,
      });

      if (response.success) {
        toast.success(
          `Successfully synced ${response.data.syncedCount} survey(s)! ${
            response.data.updatedCount > 0
              ? `${response.data.updatedCount} updated.`
              : ""
          }`
        );
        setSelectedSurveys([]);
        // Refresh surveys and configured list
        fetchSurveys();
        fetchConfiguredSurveys();
      }
    } catch (error) {
      console.error("Error syncing all surveys:", error);
      toast.error(error.message || "Failed to sync surveys");
    } finally {
      setSyncing(false);
    }
  };

  // Check if survey is already configured
  const isConfigured = (surveyId) => {
    return configuredSurveys.some((c) => c.externalId === surveyId);
  };

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
          {selectedSurveys.length > 0 && (
            <button
              onClick={handleSyncSelected}
              disabled={syncing}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Sync Selected ({selectedSurveys.length})</span>
            </button>
          )}
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>{syncing ? "Syncing..." : "Sync All Surveys"}</span>
          </button>
          <button
            onClick={() => setShowConfigured(!showConfigured)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Configured ({configuredSurveys.length})</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Country Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Filter by Country
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

        {/* Filter Results Summary */}
        <div className="text-sm text-gray-600 lg:ml-auto">
          Showing {surveys.length} surveys
        </div>
      </div>

      {/* Configured Surveys Section */}
      {showConfigured && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configured Surveys (Shown to Users)
            </h3>
            <span className="text-sm text-gray-600">
              {configuredSurveys.length} surveys configured
            </span>
          </div>
          {configuredSurveys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No surveys configured yet. Select and sync surveys from the list
              below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Survey
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reward
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Synced
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configuredSurveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {survey.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {survey.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {survey.coinReward} coins
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            survey.status === "live"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {survey.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedSurveys.length === surveys.length &&
                          surveys.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Survey
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {surveys.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No surveys found
                      </td>
                    </tr>
                  ) : (
                    surveys.map((survey) => {
                      const configured = isConfigured(survey.id);
                      return (
                        <tr
                          key={survey.id}
                          className={`hover:bg-gray-50 ${
                            configured ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedSurveys.includes(survey.id)}
                              onChange={() => handleSelectSurvey(survey.id)}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {survey.icon && (
                                <img
                                  src={survey.icon}
                                  alt={survey.title}
                                  className="w-10 h-10 rounded-lg mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                  <span>{survey.title}</span>
                                  {configured && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                      ✓ Configured
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {survey.reward?.coins || 0} coins
                            </div>
                            {survey.reward?.xp > 0 && (
                              <div className="text-xs text-gray-500">
                                +{survey.reward.xp} XP
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {survey.estimatedTime
                              ? `${survey.estimatedTime} min`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                survey.isAvailable !== false
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {survey.isAvailable !== false
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {selectedSurveys.includes(survey.id) && (
                              <span className="text-xs text-emerald-600 font-medium">
                                Selected
                              </span>
                            )}
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
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
