"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import EditProgressionRuleModal from "./modals/EditProgressionRuleModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import LoadingSpinner from "../common/LoadingSpinner";
import { useProgressionRules } from "../../hooks/useProgressionRules";
import apiClient from "../../lib/apiClient";
import toast from "react-hot-toast";

export default function TaskProgressionRulesModule() {
  const {
    rules: progressionRules,
    loading: loadingRules,
    error: rulesError,
    pagination: rulesPagination,
    fetchProgressionRules,
    deleteProgressionRule,
  } = useProgressionRules();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgressionRule, setSelectedProgressionRule] = useState(null);

  // Pagination state for progression rules
  const [rulesCurrentPage, setRulesCurrentPage] = useState(1);

  // Fetch progression rules on component mount
  useEffect(() => {
    fetchProgressionRules({ page: rulesCurrentPage, limit: 100 });
  }, [rulesCurrentPage]);

  // Refetch when search changes (reset to page 1)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRulesCurrentPage(1);
      fetchProgressionRules({ page: 1, limit: 100 });
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Refetch when filter status changes (reset to page 1)
  useEffect(() => {
    setRulesCurrentPage(1);
    fetchProgressionRules({ page: 1, limit: 100 });
  }, [filterStatus]);

  // Filter progression rules
  const filteredRules = progressionRules.filter((rule) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      rule.ruleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.xpTier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.membershipTier?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && rule.isActive) ||
      (filterStatus === "inactive" && !rule.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination handlers
  const handleRulesPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= rulesPagination.pages && !loadingRules) {
      setRulesCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditRule = (rule) => {
    setSelectedProgressionRule(rule);
    setShowEditModal(true);
  };

  const handleCreateRule = () => {
    setSelectedProgressionRule(null);
    setShowEditModal(true);
  };

  const handleDeleteRule = (rule) => {
    setSelectedProgressionRule(rule);
    setShowDeleteModal(true);
  };

  const confirmDeleteRule = async () => {
    if (!selectedProgressionRule) return;

    try {
      await apiClient.delete(
        `/admin/game-offers/progression-rules/${selectedProgressionRule._id}?confirm=true`
      );
      toast.success("Progression rule deleted successfully");
      setShowDeleteModal(false);
      setSelectedProgressionRule(null);
      // Refetch progression rules
      await fetchProgressionRules({ page: rulesCurrentPage, limit: 100 });
    } catch (error) {
      console.error("Failed to delete progression rule:", error);
      toast.error("Failed to delete progression rule");
    }
  };

  const handleSaveRule = async () => {
    try {
      // Refetch progression rules
      await fetchProgressionRules({ page: rulesCurrentPage, limit: 100 });
      // Close modal
      setShowEditModal(false);
      setSelectedProgressionRule(null);
    } catch (error) {
      console.error("Failed to refresh after saving rule:", error);
      toast.error("Rule saved but failed to refresh the list");
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[80px] px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const formatTier = (tier) => {
    if (!tier) return "—";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  if (loadingRules) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
        <p className="ml-3 text-sm text-gray-500">
          Loading progression rules...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/offers"
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h2 className="text-lg font-semibold text-gray-900">
                  Task Progression Rules
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Configure user-based progression rules with batch unlocking.
                Rules are matched to users based on their XP tier and membership
                tier.
              </p>
              {rulesPagination.total > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Total Progression Rules:{" "}
                  <span className="font-semibold text-gray-700">
                    {rulesPagination.total}
                  </span>
                  {rulesPagination.pages > 1 && (
                    <span className="ml-2">
                      (Page {rulesCurrentPage} of {rulesPagination.pages})
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {rulesPagination.pages > 1 && (
                <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 bg-white">
                  <button
                    onClick={() => {
                      const newPage = rulesCurrentPage - 1;
                      if (newPage >= 1) {
                        setRulesCurrentPage(newPage);
                      }
                    }}
                    disabled={rulesCurrentPage === 1 || loadingRules}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-700 px-2">
                    {rulesCurrentPage} / {rulesPagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = rulesCurrentPage + 1;
                      if (newPage <= rulesPagination.pages) {
                        setRulesCurrentPage(newPage);
                      }
                    }}
                    disabled={
                      rulesCurrentPage >= rulesPagination.pages || loadingRules
                    }
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
              <button
                onClick={handleCreateRule}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Progression Rule
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rules by name, XP tier, or membership tier..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Reset to page 1 when search changes
                    if (rulesCurrentPage !== 1) {
                      setRulesCurrentPage(1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchProgressionRules({ page: 1, limit: 100 });
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Rules</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progression Rules Table */}
        {rulesError ? (
          <div className="px-6 py-8 text-center text-red-600">{rulesError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Sizes
                  </th>
                  {/* Max Batches column - commented out */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Batches
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm || filterStatus !== "all"
                        ? "No progression rules match your current filters."
                        : "No progression rules found. Click 'Add Progression Rule' to create one."}
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => {
                    return (
                      <tr key={rule._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {rule.ruleName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTier(rule.xpTier)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTier(rule.membershipTier)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {rule.priority || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            First: {rule.firstBatchSize}, Next:{" "}
                            {rule.nextBatchSize}
                          </div>
                        </td>
                        {/* Max Batches column data - commented out */}
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {rule.maxBatches || "Unlimited"}
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(rule.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit progression rule"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete progression rule"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls - Bottom */}
        {!loadingRules && rulesPagination.total > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(rulesCurrentPage - 1) * rulesPagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    rulesCurrentPage * rulesPagination.limit,
                    rulesPagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{rulesPagination.total}</span>{" "}
                progression rules
                {filteredRules.length < progressionRules.length && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({filteredRules.length} shown after filter)
                  </span>
                )}
              </div>
              {rulesPagination.pages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRulesPageChange(rulesCurrentPage - 1)}
                    disabled={rulesCurrentPage === 1 || loadingRules}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(rulesPagination.pages, 5) },
                      (_, i) => {
                        let pageNum;
                        if (rulesPagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (rulesCurrentPage <= 3) {
                          pageNum = i + 1;
                        } else if (
                          rulesCurrentPage >=
                          rulesPagination.pages - 2
                        ) {
                          pageNum = rulesPagination.pages - 4 + i;
                        } else {
                          pageNum = rulesCurrentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleRulesPageChange(pageNum)}
                            disabled={loadingRules}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              rulesCurrentPage === pageNum
                                ? "bg-purple-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <button
                    onClick={() => handleRulesPageChange(rulesCurrentPage + 1)}
                    disabled={
                      rulesCurrentPage >= rulesPagination.pages || loadingRules
                    }
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Progression Rule Modal */}
      <EditProgressionRuleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProgressionRule(null);
        }}
        progressionRule={selectedProgressionRule}
        onSave={handleSaveRule}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProgressionRule(null);
        }}
        onConfirm={confirmDeleteRule}
        title="Delete Progression Rule"
        message={`Are you sure you want to delete the progression rule "${selectedProgressionRule?.ruleName}"? This action cannot be undone.`}
        confirmText="Delete Rule"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
