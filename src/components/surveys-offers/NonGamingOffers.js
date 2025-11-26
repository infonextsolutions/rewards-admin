"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "../ui/Pagination";
import LoadingSpinner from "../ui/LoadingSpinner";
import surveyAPIs from "../../data/surveys/surveyAPI";
import toast from "react-hot-toast";

export default function NonGamingOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [typeFilter, setTypeFilter] = useState("all"); // all, surveys, cashback, magic-receipts, shopping
  const [deviceFilter, setDeviceFilter] = useState("all"); // all, android, iphone, ipad
  const [countryFilter, setCountryFilter] = useState("US"); // Country code filter (default: US)
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [configuredOffers, setConfiguredOffers] = useState([]);
  const [showConfigured, setShowConfigured] = useState(false);
  const [togglingOffers, setTogglingOffers] = useState(new Set()); // Track which offers are being toggled

  // Fetch non-game offers
  const fetchOffers = async (
    page = pagination.currentPage,
    type = typeFilter
  ) => {
    console.log("NonGamingOffers: fetchOffers called", {
      page,
      type,
      country: countryFilter,
    });
    setLoading(true);
    try {
      let response;

      if (type === "surveys") {
        // Use admin route with type filter
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "survey",
          page,
          limit: pagination.itemsPerPage,
          country: countryFilter,
          devices: devices,
        });

        if (response.success && response.categorized) {
          const surveys = response.categorized.surveys || [];
          const mappedOffers = surveys.map((offer) => ({
            id: offer.id || offer.offerId || offer.surveyId,
            offerId: offer.offerId || offer.id || offer.surveyId,
            title: offer.title || offer.name || "Untitled Survey",
            description: offer.description || "",
            type: "survey",
            category:
              typeof offer.category === "string"
                ? offer.category
                : offer.category?.name || "Survey",
            icon: offer.icon || offer.banner || "",
            banner: offer.banner || offer.icon || "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            estimatedTime: offer.estimatedTime || offer.duration || 0,
            clickUrl: offer.clickUrl || offer.surveyUrl || offer.url || "",
            isAvailable: offer.isAvailable !== false,
            provider: offer.provider || "bitlabs",
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.surveys?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.surveys?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else if (type === "cashback") {
        // Use admin route with type filter
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "cashback",
          page,
          limit: pagination.itemsPerPage,
          country: countryFilter,
          devices: devices,
        });

        if (response.success && response.categorized) {
          const cashbackOffers = response.categorized.cashback || [];
          const mappedOffers = cashbackOffers.map((offer) => ({
            id: offer.id || offer.offerId,
            offerId: offer.offerId || offer.id,
            title: offer.title || offer.name || "Untitled Cashback Offer",
            description: offer.description || "",
            type: "cashback",
            category:
              typeof offer.category === "string"
                ? offer.category
                : offer.category?.name || "Cashback",
            icon: offer.icon || offer.banner || "",
            banner: offer.banner || offer.icon || "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            clickUrl: offer.clickUrl || offer.url || "",
            provider: offer.provider || "bitlabs",
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.cashback?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.cashback?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else if (type === "magic-receipts") {
        // Use admin route with type filter
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "magic_receipt",
          page,
          limit: pagination.itemsPerPage,
          country: countryFilter,
          devices: devices,
        });

        if (response.success && response.categorized) {
          const magicReceipts = response.categorized.magicReceipts || [];
          const mappedOffers = magicReceipts.map((offer) => ({
            id: offer.id || offer.offerId,
            offerId: offer.offerId || offer.id,
            title: offer.title || offer.name || "Untitled Magic Receipt",
            description: offer.description || "",
            type: "magic-receipt",
            category:
              typeof offer.category === "string"
                ? offer.category
                : offer.category?.name || "Magic Receipt",
            icon: offer.icon || offer.banner || "",
            banner: offer.banner || offer.icon || "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            clickUrl: offer.clickUrl || offer.url || "",
            provider: offer.provider || "bitlabs",
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.magicReceipts?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.magicReceipts?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else if (type === "shopping") {
        // Use admin route with type filter
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "shopping",
          page,
          limit: pagination.itemsPerPage,
          country: countryFilter,
          devices: devices,
        });

        if (response.success && response.categorized) {
          const shoppingOffers = response.categorized.shopping || [];
          const mappedOffers = shoppingOffers.map((offer) => ({
            id: offer.id || offer.offerId,
            offerId: offer.offerId || offer.id,
            title: offer.title || offer.name || "Untitled Shopping Offer",
            description: offer.description || "",
            type: "shopping",
            category:
              typeof offer.category === "string"
                ? offer.category
                : offer.category?.name || "Shopping",
            icon: offer.icon || offer.banner || "",
            banner: offer.banner || offer.icon || "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            clickUrl: offer.clickUrl || offer.url || "",
            provider: offer.provider || "bitlabs",
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.shopping?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.shopping?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else {
        // Get all non-game offers from admin route
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "all",
          page,
          limit: pagination.itemsPerPage,
          country: countryFilter,
          devices: devices,
        });

        if (response.success && response.data) {
          // Admin route returns: { data: offers[], categorized: {}, breakdown: {}, total: number, estimatedEarnings: number }
          const allOffers = response.data || [];
          const mappedOffers = allOffers.map((offer) => ({
            id: offer.id || offer.offerId || offer.surveyId,
            offerId: offer.offerId || offer.id || offer.surveyId,
            title: offer.title || offer.name || "Untitled Offer",
            description: offer.description || "",
            type: offer.type || "other",
            category:
              typeof offer.category === "string"
                ? offer.category
                : offer.category?.name || "General",
            icon: offer.icon || offer.banner || "",
            banner: offer.banner || offer.icon || "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            clickUrl:
              offer.clickUrl ||
              offer.surveyUrl ||
              offer.downloadUrl ||
              offer.url ||
              "",
            provider: offer.provider || "bitlabs",
            estimatedTime: offer.estimatedTime || offer.duration || 0,
            isAvailable: offer.isAvailable !== false,
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.total || mappedOffers.length) / pagination.itemsPerPage
            ),
            totalItems: response.total || mappedOffers.length,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching non-game offers:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
      });
      toast.error(error.message || "Failed to load non-game offers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch configured offers from database
  const fetchConfiguredOffers = async () => {
    try {
      console.log("Fetching configured offers...");
      const response = await surveyAPIs.getConfiguredBitLabOffers({
        offerType: "all",
        status: "all",
      });
      console.log("Configured offers response:", response);
      if (response.success) {
        setConfiguredOffers(response.data.configuredOffers || []);
        console.log(
          "Configured offers set:",
          response.data.configuredOffers?.length || 0
        );
      }
    } catch (error) {
      console.error("Error fetching configured offers:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
      });
      // Show error to user
      if (error.message && !error.message.includes("404")) {
        toast.error("Failed to load configured offers: " + error.message);
      }
    }
  };

  useEffect(() => {
    console.log("NonGamingOffers: Component mounted, fetching offers...");
    fetchOffers(1, "all");
    fetchConfiguredOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("NonGamingOffers: Filter changed, fetching offers...", {
      typeFilter,
      countryFilter,
      deviceFilter,
    });
    setSelectedOffers([]); // Clear selection when filter changes
    fetchOffers(1, typeFilter);
  }, [typeFilter, countryFilter, deviceFilter]);

  const handlePageChange = (newPage) => {
    fetchOffers(newPage, typeFilter);
  };

  // Check if offer is already configured
  const isConfigured = (offerId) => {
    return configuredOffers.some((c) => c.externalId === offerId);
  };

  // Get configured offer by external ID
  const getConfiguredOffer = (offerId) => {
    return configuredOffers.find((c) => c.externalId === offerId);
  };

  // Handle toggle for individual offer
  const handleToggleOffer = async (offer) => {
    const offerId = offer.id;
    const isCurrentlyConfigured = isConfigured(offerId);

    console.log("Toggle offer clicked:", {
      offerId,
      isCurrentlyConfigured,
      offer,
    });

    setTogglingOffers((prev) => new Set(prev).add(offerId));

    try {
      if (isCurrentlyConfigured) {
        // Unsync/Delete the offer
        const configuredOffer = getConfiguredOffer(offerId);
        console.log("Deleting offer:", configuredOffer);
        if (configuredOffer?.id) {
          const response = await surveyAPIs.deleteConfiguredOffer(
            configuredOffer.id
          );
          console.log("Delete response:", response);
          toast.success("Offer removed successfully");
        } else {
          console.warn("No configured offer ID found for:", offerId);
          toast.error("Could not find offer to delete");
        }
      } else {
        // Sync the offer with device and country filter
        const backendType = getBackendOfferType(offer.type || typeFilter);
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        const country = countryFilter;
        console.log("Syncing offer:", {
          offerId,
          backendType,
          devices,
          country,
        });
        const response = await surveyAPIs.syncSingleBitLabOffer(
          offerId,
          backendType === "all" ? "survey" : backendType,
          devices,
          country
        );
        console.log("Sync response:", response);
        toast.success("Offer added successfully");
      }

      // Refresh configured offers list
      await fetchConfiguredOffers();
    } catch (error) {
      console.error("Error toggling offer:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
        stack: error.stack,
      });
      toast.error(
        error.message || error.data?.message || "Failed to toggle offer"
      );
    } finally {
      setTogglingOffers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  // Handle offer selection
  const handleSelectOffer = (offerId) => {
    setSelectedOffers((prev) =>
      prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(offers.map((o) => o.id));
    }
  };

  // Map frontend type to backend type
  const getBackendOfferType = (frontendType) => {
    const typeMap = {
      surveys: "survey",
      cashback: "cashback",
      shopping: "shopping",
      "magic-receipts": "magic_receipt",
      all: "all",
    };
    return typeMap[frontendType] || "all";
  };

  // Sync selected offers to database
  const handleSyncSelected = async () => {
    if (selectedOffers.length === 0) {
      toast.error("Please select at least one offer to sync");
      return;
    }

    setSyncing(true);
    try {
      const backendType = getBackendOfferType(typeFilter);
      const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
      const country = countryFilter;
      const response = await surveyAPIs.syncBitLabOffers({
        offerIds: selectedOffers,
        offerType: backendType === "all" ? "all" : backendType,
        autoActivate: true,
        devices: devices,
        country: country,
      });

      if (response.success) {
        toast.success(
          `Successfully synced ${response.data.syncedCount} offer(s)! ${
            response.data.updatedCount > 0
              ? `${response.data.updatedCount} updated.`
              : ""
          }`
        );
        setSelectedOffers([]);
        // Refresh offers and configured list
        fetchOffers(1, typeFilter);
        fetchConfiguredOffers();
      }
    } catch (error) {
      console.error("Error syncing offers:", error);
      toast.error(error.message || "Failed to sync offers");
    } finally {
      setSyncing(false);
    }
  };

  // Sync all offers of current type to database
  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const backendType = getBackendOfferType(typeFilter);
      const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
      const country = countryFilter;
      const response = await surveyAPIs.syncBitLabOffers({
        offerType: backendType === "all" ? "all" : backendType,
        autoActivate: true,
        devices: devices,
        country: country,
      });

      if (response.success) {
        toast.success(
          `Successfully synced ${response.data.syncedCount} offer(s)! ${
            response.data.updatedCount > 0
              ? `${response.data.updatedCount} updated.`
              : ""
          }`
        );
        setSelectedOffers([]);
        // Refresh offers and configured list
        fetchOffers(1, typeFilter);
        fetchConfiguredOffers();
      }
    } catch (error) {
      console.error("Error syncing all offers:", error);
      toast.error(error.message || "Failed to sync offers");
    } finally {
      setSyncing(false);
    }
  };

  const typeOptions = [
    { value: "all", label: "All Offers" },
    { value: "surveys", label: "Surveys" },
    { value: "cashback", label: "Cashback" },
    { value: "magic-receipts", label: "Magic Receipts" },
    { value: "shopping", label: "Shopping" },
  ];

  const deviceOptions = [
    { value: "all", label: "All Devices" },
    { value: "android", label: "Android" },
    { value: "iphone", label: "iPhone" },
    { value: "ipad", label: "iPad" },
  ];

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Non-Gaming Offers
          </h2>
          <p className="text-gray-600 mt-1">
            Toggle offers to show on user side
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* COMMENTED OUT: Sync Selected button (checkboxes are hidden) */}
          {/* {selectedOffers.length > 0 && (
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
              <span>Sync Selected ({selectedOffers.length})</span>
            </button>
          )} */}
          {/* COMMENTED OUT: Sync All Offers button */}
          {/* <button
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
            <span>
              {syncing
                ? "Syncing..."
                : `Sync All ${
                    typeFilter === "all"
                      ? "Offers"
                      : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
                  }`}
            </span>
          </button> */}
          {/* COMMENTED OUT: Configured button */}
          {/* <button
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
            <span>Configured ({configuredOffers.length})</span>
          </button> */}
        </div>
      </div>

      {/* COMMENTED OUT: Configured Offers Section */}
      {/* {showConfigured && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configured Offers (Shown to Users)
            </h3>
            <span className="text-sm text-gray-600">
              {configuredOffers.length} offers configured
            </span>
          </div>
          {configuredOffers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No offers configured yet. Select and sync offers from the list
              below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Offer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
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
                  {configuredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.title || "Untitled"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {offer.description || ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {typeof offer.offerType === "string"
                            ? offer.offerType
                            : "survey"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {typeof offer.coinReward === "number"
                          ? offer.coinReward
                          : 0}{" "}
                        coins
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            offer.status === "live"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {typeof offer.status === "string"
                            ? offer.status
                            : "paused"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {offer.createdAt
                          ? new Date(offer.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )} */}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex gap-4">
          {/* Type Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Device Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Filter by Device
            </label>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {deviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Filter by Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="text-sm text-gray-600 lg:ml-auto">
          Showing {offers.length} offers
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner message="Loading non-gaming offers..." />
      ) : (
        <>
          {/* Offers Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* HIDDEN: Checkbox column */}
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedOffers.length === offers.length &&
                          offers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer ID
                    </th>
                    {/* HIDDEN: Offer column */}
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Add/Remove
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No offers found
                      </td>
                    </tr>
                  ) : (
                    offers.map((offer) => {
                      const configured = isConfigured(offer.id);
                      return (
                        <tr
                          key={offer.id}
                          className={`hover:bg-gray-50 ${
                            configured ? "bg-green-50" : ""
                          }`}
                        >
                          {/* HIDDEN: Checkbox cell */}
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedOffers.includes(offer.id)}
                              onChange={() => handleSelectOffer(offer.id)}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="text-xs font-mono text-gray-600 max-w-xs truncate"
                              title={offer.id}
                            >
                              {offer.id}
                            </div>
                          </td>
                          {/* HIDDEN: Offer cell */}
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {offer.icon && (
                                <img
                                  src={offer.icon}
                                  alt={offer.title}
                                  className="w-10 h-10 rounded-lg mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                  <span>{offer.title}</span>
                                  {configured && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                      ✓ Configured
                                    </span>
                                  )}
                                </div>
                                {offer.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {offer.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {offer.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof offer.category === "string"
                              ? offer.category
                              : offer.category?.name || "other"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {offer.reward?.coins || 0} coins
                            </div>
                            {offer.reward?.xp > 0 && (
                              <div className="text-xs text-gray-500">
                                +{offer.reward.xp} XP
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  offer.isAvailable !== false
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {offer.isAvailable !== false
                                  ? "Available"
                                  : "Unavailable"}
                              </span>
                              {selectedOffers.includes(offer.id) && (
                                <span className="text-xs text-emerald-600 font-medium">
                                  Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleOffer(offer)}
                                disabled={togglingOffers.has(offer.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                  configured ? "bg-emerald-600" : "bg-gray-200"
                                } ${
                                  togglingOffers.has(offer.id)
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    configured
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                              {togglingOffers.has(offer.id) && (
                                <span className="text-xs text-gray-500">
                                  Syncing...
                                </span>
                              )}
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
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
