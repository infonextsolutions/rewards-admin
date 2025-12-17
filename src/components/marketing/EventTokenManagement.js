"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../ui/Pagination";
import CreateEventTokenModal from "./modals/CreateEventTokenModal";
import BulkImportModal from "./modals/BulkImportModal";
import EventTokenAnalytics from "./EventTokenAnalytics";
import { useEventTokens } from "../../hooks/useEventTokens";
import toast from "react-hot-toast";

export default function EventTokenManagement() {
  const {
    eventTokens,
    categories,
    loading,
    error,
    pagination,
    fetchEventTokens,
    fetchCategories,
    createEventToken,
    updateEventToken,
    deleteEventToken,
    bulkImportEventTokens,
    setPage,
  } = useEventTokens();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    isS2S: "",
    isActive: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("tokens"); // 'tokens' or 'analytics'

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch event tokens when filters change (not on page change - handled client-side)
  useEffect(() => {
    const apiFilters = {};

    if (filters.category) apiFilters.category = filters.category;
    if (filters.isS2S !== "") apiFilters.isS2S = filters.isS2S === "true";
    if (filters.isActive !== "")
      apiFilters.isActive = filters.isActive === "true";
    if (searchTerm.trim()) apiFilters.search = searchTerm.trim();

    // Always fetch from page 1, pagination is handled client-side
    fetchEventTokens(1, apiFilters, itemsPerPage);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filters, searchTerm, itemsPerPage, fetchEventTokens]);

  // Handle pagination client-side when page changes (no API call needed)
  useEffect(() => {
    if (setPage) {
      setPage(currentPage);
    }
  }, [currentPage, setPage]);

  const handleCreateEventToken = async (eventData) => {
    try {
      await createEventToken(eventData);
      // Refresh the list
      const apiFilters = {};
      if (filters.category) apiFilters.category = filters.category;
      if (filters.isS2S !== "") apiFilters.isS2S = filters.isS2S === "true";
      if (filters.isActive !== "")
        apiFilters.isActive = filters.isActive === "true";
      if (searchTerm.trim()) apiFilters.search = searchTerm.trim();
      await fetchEventTokens(currentPage, apiFilters, itemsPerPage);
      setShowCreateModal(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditEventToken = (event) => {
    setEditData(event);
    setShowCreateModal(true);
  };

  const handleUpdateEventToken = async (eventData) => {
    try {
      await updateEventToken(editData._id || editData.id, eventData);
      // Refresh the list
      const apiFilters = {};
      if (filters.category) apiFilters.category = filters.category;
      if (filters.isS2S !== "") apiFilters.isS2S = filters.isS2S === "true";
      if (filters.isActive !== "")
        apiFilters.isActive = filters.isActive === "true";
      if (searchTerm.trim()) apiFilters.search = searchTerm.trim();
      await fetchEventTokens(currentPage, apiFilters, itemsPerPage);
      setShowCreateModal(false);
      setEditData(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteEventToken = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteEventToken(deleteConfirm._id || deleteConfirm.id);
      // Refresh the list
      const apiFilters = {};
      if (filters.category) apiFilters.category = filters.category;
      if (filters.isS2S !== "") apiFilters.isS2S = filters.isS2S === "true";
      if (filters.isActive !== "")
        apiFilters.isActive = filters.isActive === "true";
      if (searchTerm.trim()) apiFilters.search = searchTerm.trim();
      await fetchEventTokens(currentPage, apiFilters, itemsPerPage);
      setDeleteConfirm(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleBulkImport = async (events) => {
    try {
      await bulkImportEventTokens(events);
      // Refresh the list
      const apiFilters = {};
      if (filters.category) apiFilters.category = filters.category;
      if (filters.isS2S !== "") apiFilters.isS2S = filters.isS2S === "true";
      if (filters.isActive !== "")
        apiFilters.isActive = filters.isActive === "true";
      if (searchTerm.trim()) apiFilters.search = searchTerm.trim();
      await fetchEventTokens(currentPage, apiFilters, itemsPerPage);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      isS2S: "",
      isActive: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.category ||
    filters.isS2S !== "" ||
    filters.isActive !== "" ||
    searchTerm.trim();

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Event Token Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage Adjust event tokens for marketing attribution
          </p>
        </div>
        {activeTab === "tokens" && (
          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => setShowBulkImportModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389]"
            >
              Bulk Import
            </button> */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#00a389] rounded-md hover:bg-[#008a73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389] flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Event Token
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("tokens")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tokens"
                ? "border-[#00a389] text-[#00a389]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-[#00a389] text-[#00a389]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" ? (
        <EventTokenAnalytics />
      ) : (
        <>
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    showFilters
                      ? "bg-[#00a389] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filters
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name or token..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
                />
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                {/* Category Filter */}
                {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.category || cat} value={cat.category || cat}>
                      {cat.category || cat} {cat.count ? `(${cat.count})` : ''}
                    </option>
                  ))
                ) : null}
              </select>
            </div> */}

                {/* S2S Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    S2S Events
                  </label>
                  <select
                    value={filters.isS2S}
                    onChange={(e) =>
                      handleFilterChange("isS2S", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
                  >
                    <option value="">All Events</option>
                    <option value="true">S2S Events Only</option>
                    <option value="false">Non-S2S Events</option>
                  </select>
                </div>

                {/* Active Filter */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.isActive}
                    onChange={(e) =>
                      handleFilterChange("isActive", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </select>
                </div> */}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Loading event tokens...</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-red-400 mb-2">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Error loading event tokens
                  </h3>
                  <p className="text-sm text-gray-500">{error}</p>
                </div>
              </div>
            ) : eventTokens.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No event tokens found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Get started by creating your first event token
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#ecf8f1]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Category
                        </th> */}
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Unique
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          S2S
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {eventTokens.map((event) => (
                        <tr
                          key={event._id || event.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono font-medium text-gray-900">
                              {event.token}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {event.name}
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {event.category || "N/A"}
                            </div>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {event.unique ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {event.isS2S ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                S2S
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {event.isActive !== false ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {event.description || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditEventToken(event)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit event token"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(event)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete event token"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages || 1}
                      totalItems={pagination.totalItems || 0}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modals */}
          <CreateEventTokenModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setEditData(null);
            }}
            onSave={editData ? handleUpdateEventToken : handleCreateEventToken}
            categories={categories}
            editData={editData}
          />

          <BulkImportModal
            isOpen={showBulkImportModal}
            onClose={() => setShowBulkImportModal(false)}
            onSave={handleBulkImport}
          />

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Delete Event Token
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete the event token{" "}
                    <strong>{deleteConfirm.name}</strong> ({deleteConfirm.token}
                    )? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteEventToken}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
