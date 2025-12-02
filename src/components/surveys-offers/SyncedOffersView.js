"use client";

import { useState, useEffect } from "react";
import Pagination from "../ui/Pagination";
import LoadingSpinner from "../ui/LoadingSpinner";
import surveyAPIs from "../../data/surveys/surveyAPI";
import toast from "react-hot-toast";

export default function SyncedOffersView() {
  const [syncedOffers, setSyncedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all synced offers
  const fetchSyncedOffers = async (page = 1) => {
    setLoading(true);
    try {
      console.log("Fetching synced offers...", {
        typeFilter,
        statusFilter,
        page,
      });
      const response = await surveyAPIs.getConfiguredBitLabOffers({
        offerType: typeFilter,
        status: statusFilter,
      });
      console.log("Synced offers response:", response);

      if (response.success) {
        let offers = response.data.configuredOffers || [];
        console.log("Total offers received:", offers.length);

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          offers = offers.filter(
            (offer) =>
              offer.title?.toLowerCase().includes(query) ||
              offer.description?.toLowerCase().includes(query) ||
              offer.externalId?.toLowerCase().includes(query)
          );
          console.log("Offers after search filter:", offers.length);
        }

        // Pagination
        const startIndex = (page - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        const paginatedOffers = offers.slice(startIndex, endIndex);

        setSyncedOffers(paginatedOffers);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(offers.length / pagination.itemsPerPage),
          totalItems: offers.length,
          itemsPerPage: pagination.itemsPerPage,
        });
        console.log("Pagination set:", {
          page,
          totalPages: Math.ceil(offers.length / pagination.itemsPerPage),
          totalItems: offers.length,
        });
      }
    } catch (error) {
      console.error("Error fetching synced offers:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
        stack: error.stack,
      });
      toast.error(error.message || "Failed to load synced offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncedOffers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchSyncedOffers(1);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    fetchSyncedOffers(newPage);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm("Are you sure you want to delete this synced offer?")) {
      return;
    }

    try {
      await surveyAPIs.deleteConfiguredOffer(offerId);
      toast.success("Offer deleted successfully");
      fetchSyncedOffers(pagination.currentPage);
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error(error.message || "Failed to delete offer");
    }
  };

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "survey", label: "Surveys" },
    { value: "cashback", label: "Cashback" },
    { value: "shopping", label: "Shopping" },
    { value: "magic_receipt", label: "Magic Receipts" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "live", label: "Live" },
    { value: "paused", label: "Paused" },
    { value: "expired", label: "Expired" },
  ];

  // Calculate statistics
  const stats = {
    total: syncedOffers.length,
    live: syncedOffers.filter((o) => o.status === "live").length,
    paused: syncedOffers.filter((o) => o.status === "paused").length,
    totalReward: syncedOffers.reduce((sum, o) => sum + (o.coinReward || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            All Synced Offers
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage all offers synced to the database
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Synced</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Live</div>
          <div className="text-2xl font-bold text-green-600">{stats.live}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Paused</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.paused}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Reward</div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.totalReward.toLocaleString()} coins
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex gap-4 flex-1">
          {/* Search */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or ID..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Type
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

          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner message="Loading synced offers..." />
      ) : (
        <>
          {/* Offers Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      XP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time (min)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Synced Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {syncedOffers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No offers found matching your search"
                          : "No synced offers found"}
                      </td>
                    </tr>
                  ) : (
                    syncedOffers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {offer.title || "Untitled Offer"}
                          </div>
                          {offer.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {offer.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {offer.offerType || "survey"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-emerald-600">
                            {offer.coinReward || offer.userRewardCoins || offer.reward?.coins || 0} coins
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {offer.userRewardXP || offer.reward?.xp || 0} XP
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {offer.estimatedTime || offer.loi || 0} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              offer.status === "live"
                                ? "bg-green-100 text-green-800"
                                : offer.status === "paused"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {offer.status || "paused"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500 font-mono break-all max-w-xs">
                            {offer.externalId || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {offer.createdAt
                            ? new Date(offer.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
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
