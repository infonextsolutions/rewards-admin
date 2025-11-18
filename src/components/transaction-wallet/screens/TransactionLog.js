"use client";

import { useState, useEffect, useCallback } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import Pagination from "@/components/ui/Pagination";
import {
  CheckIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getDateRangeFilter } from "@/utils/dateFilters";
import toast from "react-hot-toast";

export default function TransactionLog({ onSneakPeek }) {
  const [filters, setFilters] = useState({
    dateRange: "",
    type: "",
    status: "",
    approval: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [approvalAction, setApprovalAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingOptions(true);
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch statuses
        const statusResponse = await fetch(
          "https://rewardsapi.hireagent.co/api/admin/transactions/meta/statuses",
          { headers }
        );
        const statusData = await statusResponse.json();
        if (statusData.success) {
          // Capitalize first letter for display
          setStatusOptions(
            statusData.data.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          );
        }

        // Fetch transaction types
        const typesResponse = await fetch(
          "https://rewardsapi.hireagent.co/api/admin/transactions/meta/types",
          { headers }
        );
        const typesData = await typesResponse.json();
        if (typesData.success) {
          // Capitalize first letter for display
          setTransactionTypes(
            typesData.data.map((t) => t.charAt(0).toUpperCase() + t.slice(1))
          );
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Fallback to default options
        setStatusOptions(["Completed", "Pending", "Failed"]);
        setTransactionTypes([
          "Credit",
          "Debit",
          "Reward",
          "Xp",
          "Redemption",
          "Spin",
          "Adjustment",
          "Refund",
          "Bonus",
          "Penalty",
        ]);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoadingTransactions(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm || "",
        type: filters.type ? filters.type.toLowerCase() : "",
        status: filters.status ? filters.status.toLowerCase() : "",
      });

      const response = await fetch(
        `https://rewardsapi.hireagent.co/api/admin/transactions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        // Transform API data to component format
        const transformedTransactions = result.data.transactions.map((t) => ({
          id: t.transactionId || t.referenceId || t._id,
          userId: t.userId || t.user?._id || "-",
          userName:
            t.userName ||
            `${t.user?.firstName || ""} ${t.user?.lastName || ""}`.trim() ||
            "-",
          userEmail: t.userEmail || t.user?.email || "-",
          type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
          amount: `${t.amount} ${t.balanceType || "coins"}`,
          description: t.description || "-",
          createdOn: new Date(t.createdAt).toLocaleDateString("en-GB"),
          approvedOn:
            t.approval?.status === "approved" && t.updatedAt
              ? new Date(t.updatedAt).toLocaleDateString("en-GB")
              : "-",
          status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
          approval: t.isApproved ? "Yes" : "No",
          approvalRequired: t.approval?.required || false,
          approvalStatus:
            t.approvalStatus || t.approval?.status || "not_required",
          rawData: t, // Store raw data for reference
        }));

        setTransactions(transformedTransactions);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [searchTerm, filters.type, filters.status]);

  // Fetch transactions on mount and when filters change
  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, fetchTransactions]);

  const handleFilterChange = (filterId, value) => {
    setFilters((prev) => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: "",
      type: "",
      status: "",
      approval: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Export functionality - exports current page transactions
    const csvContent = [
      ["Transaction ID", "User ID", "Type", "Amount", "Created On", "Status"],
      // ['Transaction ID', 'User ID', 'Type', 'Amount', 'Created On', 'Approved On', 'Status', 'Approval'],
      ...displayTransactions.map((t) => [
        t.id,
        t.userId,
        t.type,
        t.amount,
        t.createdOn,
        t.status,
        // t.id, t.userId, t.type, t.amount, t.createdOn, t.approvedOn, t.status, t.approval
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApprovalClick = (transaction, action) => {
    setSelectedTransaction(transaction);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const confirmApproval = () => {
    if (!selectedTransaction) return;

    setIsLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === selectedTransaction.id
            ? {
                ...t,
                approval: approvalAction === "approve" ? "Yes" : "No",
                approvedOn:
                  approvalAction === "approve"
                    ? new Date().toLocaleDateString("en-GB")
                    : "-",
                status: approvalAction === "approve" ? "Completed" : "Failed",
              }
            : t
        )
      );

      // Show success feedback
      toast.success(
        `Transaction ${
          approvalAction === "approve" ? "approved" : "rejected"
        } successfully!`
      );

      setIsLoading(false);
      setShowApprovalModal(false);
      setSelectedTransaction(null);
      setApprovalAction("");
    }, 1000);
  };

  const cancelApproval = () => {
    setShowApprovalModal(false);
    setSelectedTransaction(null);
    setApprovalAction("");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions(currentPage);
    setIsRefreshing(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full min-w-[80px] ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  // No client-side filtering needed - API handles it
  // Use transactions directly as they're already filtered by the API
  const displayTransactions = transactions;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            filterId="dateRange"
            label="Date Range"
            options={["Last 7 days", "Last 30 days", "Last 3 months"]}
            value={filters.dateRange}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="type"
            label="Type"
            options={transactionTypes}
            value={filters.type}
            onChange={handleFilterChange}
            disabled={loadingOptions}
          />
          <FilterDropdown
            filterId="status"
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={handleFilterChange}
            disabled={loadingOptions}
          />
          <FilterDropdown
            filterId="approval"
            label="Approval"
            options={["Yes", "No"]}
            value={filters.approval}
            onChange={handleFilterChange}
          />

          {/* Clear Filters Button */}
          {(filters.dateRange ||
            filters.type ||
            filters.status ||
            filters.approval ||
            searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Clear all filters"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID or User ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh transaction list"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved On
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingTransactions ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-600">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-600">No transactions found</p>
                  </td>
                </tr>
              ) : (
                displayTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          window.open(
                            `/transactions/${encodeURIComponent(
                              transaction.id
                            )}`,
                            "_blank"
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {transaction.id}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          window.open(`/users/${transaction.userId}`, "_blank")
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {transaction.userId}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">
                        {transaction.createdOn}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                    <span className="text-gray-900">{transaction.approvedOn}</span>
                  </td> */}
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    {/* <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.approval === 'Yes' ? (
                        <div className="flex items-center">
                          <CheckIcon className="w-5 h-5 text-green-500" />
                          <span className="ml-2 text-sm text-gray-600">Approved</span>
                        </div>
                      ) : transaction.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprovalClick(transaction, 'approve')}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition-colors"
                            title="Approve transaction"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApprovalClick(transaction, 'reject')}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-colors"
                            title="Reject transaction"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XMarkIcon className="w-5 h-5 text-red-500" />
                          <span className="ml-2 text-sm text-gray-600">Rejected</span>
                        </div>
                      )}
                    </div>
                  </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {loadingTransactions
          ? "Loading transactions..."
          : `Showing ${
              (pagination.currentPage - 1) * pagination.itemsPerPage + 1
            }-${Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )} of ${pagination.totalItems} transactions`}
      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm{" "}
                {approvalAction === "approve" ? "Approval" : "Rejection"}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transaction ID:</span>
                  <span className="text-sm font-medium">
                    {selectedTransaction.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-sm font-medium">
                    {selectedTransaction.userId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">
                    {selectedTransaction.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">
                    {selectedTransaction.amount}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to{" "}
                {approvalAction === "approve" ? "approve" : "reject"} this
                transaction? This action will update the transaction status and
                log the admin action.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelApproval}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                    approvalAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `${
                      approvalAction === "approve" ? "Approve" : "Reject"
                    } Transaction`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
