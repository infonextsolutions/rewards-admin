"use client";

import { useState, useEffect } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import Pagination from "@/components/ui/Pagination";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TRANSACTION_API } from "../../../data/transactions";
import toast from "react-hot-toast";

export default function AuditTrails() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    admin: "",
    user: "",
    action: "",
    dateRange: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [availableActions, setAvailableActions] = useState([]);

  // Load audit logs from API
  useEffect(() => {
    const loadAuditLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await TRANSACTION_API.getAuditLogs({
          page: currentPage,
          limit: pagination.itemsPerPage,
          adminName: filters.admin || undefined,
          userName: filters.user || undefined,
          action: filters.action || undefined,
          startDate: filters.dateRange
            ? filters.dateRange.split(" to ")[0]
            : undefined,
          endDate: filters.dateRange
            ? filters.dateRange.split(" to ")[1]
            : undefined,
        });

        if (response.data?.success && response.data?.data) {
          const logs = response.data.data.logs || response.data.data;
          setAuditLogs(Array.isArray(logs) ? logs : []);

          // Update pagination
          if (response.data.data.pagination) {
            setPagination({
              currentPage:
                response.data.data.pagination.currentPage || currentPage,
              totalPages: response.data.data.pagination.totalPages || 1,
              totalItems: response.data.data.pagination.totalItems || 0,
              itemsPerPage: response.data.data.pagination.itemsPerPage || 10,
            });
          }
        } else {
          throw new Error("Failed to load audit logs");
        }
      } catch (error) {
        console.error("Failed to load audit logs:", error);
        setError(
          "Unable to load audit logs. Please check your connection and try again."
        );
        setAuditLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [currentPage, filters]);

  // Load available actions for filter dropdown
  useEffect(() => {
    const loadAvailableActions = async () => {
      try {
        const response = await TRANSACTION_API.getAuditActions();
        if (response.data?.success && response.data?.data) {
          setAvailableActions(response.data.data.actions || []);
        }
      } catch (error) {
        console.error("Failed to load available actions:", error);
      }
    };

    loadAvailableActions();
  }, []);

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
      admin: "",
      user: "",
      action: "",
      dateRange: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Helper function to map audit trail user IDs to actual user IDs
  const mapUserIdForNavigation = (targetUserId) => {
    // Map USR-XXXXX format to IDOXXXX format for existing user pages
    const userIdMappings = {
      "USR-38281": "IDO9012",
      "USR-202589": "IDO9013",
      "USR-202590": "IDO9014",
      "USR-202591": "IDO9015",
      "USR-202592": "IDO9016",
    };
    
    return userIdMappings[targetUserId] || targetUserId;
  };

  // Handle Entry ID navigation to audit detail
  const handleEntryIdClick = (auditLog) => {
    // For now, show audit details in a simple alert
    // In a real implementation, this would open an audit detail modal or page
    const details = `
Audit Entry: ${auditLog.entryId}
Admin: ${auditLog.adminName} (${auditLog.adminId})
Action: ${auditLog.action}
Target: ${auditLog.targetUserName || "System"}
Time: ${new Date(auditLog.timestamp).toLocaleString()}
    `.trim();
    
    alert(`Audit Details:\n\n${details}`);
  };

  // Helper function to parse audit trail timestamp format
  const parseAuditTimestamp = (timestamp) => {
    try {
      // Handle format like "2025-05-28 12:01 PM"
      return new Date(timestamp);
    } catch (error) {
      console.error("Error parsing timestamp:", timestamp);
      return new Date(0); // Return epoch time if parsing fails
    }
  };

  // Helper function to filter by date range
  const matchesDateRange = (log) => {
    if (!filters.dateRange) return true;
    
    const logDate = parseAuditTimestamp(log.timestamp);
    const now = new Date();
    let startDate;
    
    switch (filters.dateRange) {
      case "Last 24 hours":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "Last 7 days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "Last 30 days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return true;
    }
    
    return logDate >= startDate && logDate <= now;
  };

  const getActionBadge = (action) => {
    const styles = {
      APPROVE_REDEMPTION: "bg-green-100 text-green-800",
      REJECT_REDEMPTION: "bg-red-100 text-red-800",
      ADD_COINS: "bg-blue-100 text-blue-800",
      SUBTRACT_COINS: "bg-orange-100 text-orange-800",
      ADD_XP: "bg-purple-100 text-purple-800",
      SUBTRACT_XP: "bg-pink-100 text-pink-800",
      ADJUST_BALANCE: "bg-indigo-100 text-indigo-800",
      FREEZE_WALLET: "bg-red-100 text-red-800",
      UNFREEZE_WALLET: "bg-green-100 text-green-800",
      VIEW_TRANSACTION: "bg-gray-100 text-gray-800",
      VIEW_USER_WALLET: "bg-gray-100 text-gray-800",
    };

    // Convert action to readable format
    const readableAction = action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full w-[140px] ${
          styles[action] || "bg-gray-100 text-gray-800"
        }`}
      >
        {readableAction}
      </span>
    );
  };

  // Use auditLogs directly since filtering is handled by API
  const paginatedLogs = auditLogs;

  // Get unique admin names, users, and actions for filters
  const uniqueAdmins = [...new Set(auditLogs.map((log) => log.adminName))];
  const uniqueUsers = [
    ...new Set(auditLogs.map((log) => log.targetUserName).filter(Boolean)),
  ];
  const uniqueActions =
    availableActions.length > 0
      ? availableActions
      : [...new Set(auditLogs.map((log) => log.action))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            filterId="admin"
            label="Admin"
            options={uniqueAdmins}
            value={filters.admin}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="user"
            label="User"
            options={uniqueUsers}
            value={filters.user}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="action"
            label="Action"
            options={uniqueActions}
            value={filters.action}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="dateRange"
            label="Date Range"
            options={["Last 24 hours", "Last 7 days", "Last 30 days"]}
            value={filters.dateRange}
            onChange={handleFilterChange}
          />

          {/* Clear Filters Button */}
          {(filters.admin ||
            filters.user ||
            filters.action ||
            filters.dateRange ||
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
        
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-emerald-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-gray-600">
                        Loading audit logs...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Audit Logs
                      </h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Audit Logs Found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {filters.admin ||
                        filters.user ||
                        filters.action ||
                        filters.dateRange ||
                        searchTerm
                          ? "No audit logs match your current filters. Try adjusting your search criteria."
                          : "No audit logs have been recorded yet. Admin actions and system events will appear here once they occur."}
                      </p>
                      {(filters.admin ||
                        filters.user ||
                        filters.action ||
                        filters.dateRange ||
                        searchTerm) && (
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.entryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEntryIdClick(log)}
                      className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                      title="View audit details"
                    >
                        {log.entryId}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {log.adminId}
                      </span>
                  </td>
                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                  <td className="px-6 py-4">
                      {log.targetUserId ? (
                      <button
                        onClick={() => {
                            window.open(`/users/${log.targetUserId}`, "_blank");
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                          title={`View user profile for ${log.targetUserName}`}
                      >
                          {log.targetUserName}
                      </button>
                    ) : (
                        <span className="font-medium text-gray-900">
                          System
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                    </div>
                  </td>
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
        Showing{" "}
        {pagination.totalItems > 0
          ? `${
              (pagination.currentPage - 1) * pagination.itemsPerPage + 1
            }-${Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}`
          : "0-0"}{" "}
        of {pagination.totalItems} audit entries
      </div>
    </div>
  );
}
