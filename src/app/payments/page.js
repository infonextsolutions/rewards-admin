"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearch } from "../../contexts/SearchContext";
import Pagination from "../../components/ui/Pagination";
import apiClient from "../../lib/apiClient";
import toast from "react-hot-toast";

const Frame = ({
  filters,
  setFilters,
  onFilterChange,
  typeOptions = [],
  statusOptions = [],
}) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Helper function to get date range label
  const getDateRangeLabel = () => {
    if (!filters.dateRange) return "Date Range";
    return filters.dateRange;
  };

  const filterOptions = [
    {
      id: "dateRange",
      label: getDateRangeLabel(),
      isOpen: dateRangeOpen,
      setOpen: setDateRangeOpen,
      options: null,
    },
    {
      id: "type",
      label: filters.type || "Type",
      isOpen: typeOpen,
      setOpen: setTypeOpen,
      options: typeOptions,
    },
    {
      id: "status",
      label: filters.status || "Status",
      isOpen: statusOpen,
      setOpen: setStatusOpen,
      options: statusOptions,
    },
  ];

  const handleFilterClick = (filterId) => {
    const filter = filterOptions.find((f) => f.id === filterId);
    if (filter) {
      filter.setOpen(!filter.isOpen);
    }
  };

  const handleFilterSelect = (filterId, value) => {
    onFilterChange(filterId, value);
    const filter = filterOptions.find((f) => f.id === filterId);
    if (filter) {
      filter.setOpen(false);
    }
  };

  const handleDateRangeSelect = (range) => {
    onFilterChange("dateRange", range);
    setDateRangeOpen(false);
  };

  return (
    <header
      className="flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6 mb-6"
      role="banner"
    >
      <div className="flex-shrink-0">
        <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
          Payments
        </h1>
        <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
          Track all payments from users
        </p>
      </div>

      <div
        className="flex flex-col gap-2 w-full lg:w-auto lg:max-w-4xl"
        role="toolbar"
        aria-label="Payment filters"
      >
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {filterOptions.map((filter) => (
            <div
              key={filter.id}
              className="relative min-w-[150px] flex-shrink-0"
            >
              <div className="relative h-[42px] bg-white rounded-[9.6px] shadow-[0px_3.2px_3.2px_#0000000a] border border-gray-200">
                <button
                  className="w-full h-full px-4 pr-10 bg-transparent border-none rounded-[9.6px] cursor-pointer [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14.4px] tracking-[0] leading-[normal] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-left"
                  onClick={() => handleFilterClick(filter.id)}
                  aria-expanded={filter.isOpen}
                  aria-haspopup="listbox"
                  aria-label={`Filter by ${filter.label}`}
                >
                  {filter.label}
                </button>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg
                    className="w-3 h-2 text-[#3e4954]"
                    fill="currentColor"
                    viewBox="0 0 12 7"
                  >
                    <path
                      d="M1 1L6 6L11 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Dropdown Options */}
              {filter.isOpen && filter.options && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[9.6px] shadow-lg border border-gray-200 z-10">
                  {filter.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14.4px] tracking-[0] leading-[normal] first:rounded-t-[9.6px] last:rounded-b-[9.6px]"
                      onClick={() => handleFilterSelect(filter.id, option)}
                    >
                      {option}
                    </button>
                  ))}
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] border-t border-gray-200 last:rounded-b-[9.6px]"
                    onClick={() => handleFilterSelect(filter.id, null)}
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Date Range Picker */}
              {filter.id === "dateRange" && filter.isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[9.6px] shadow-lg border border-gray-200 z-10 p-4 min-w-[300px]">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-[#333333] mb-2">
                      Select Date Range
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                        onClick={() => handleDateRangeSelect("Today")}
                      >
                        Today
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                        onClick={() => handleDateRangeSelect("Yesterday")}
                      >
                        Yesterday
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                        onClick={() => handleDateRangeSelect("Last 7 days")}
                      >
                        Last 7 days
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                        onClick={() => handleDateRangeSelect("Last 30 days")}
                      >
                        Last 30 days
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14px] border-t border-gray-200 mt-2 pt-3"
                        onClick={() => handleDateRangeSelect(null)}
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-[#d4f8d3] text-[#076758]";
    case "pending":
      return "bg-[#fff2ab] text-[#6f631b]";
    case "rejected":
      return "bg-[#fee2e2] text-[#991b1b]";
    case "failed":
      return "bg-[#fee2e2] text-[#991b1b]";
    default:
      return "bg-[#d4f8d3] text-[#076758]";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

const Table = ({
  data,
  onApprove,
  onReject,
  loading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  return (
    <div className="bg-white rounded-[10px] border border-gray-200 w-full">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: "800px" }}>
          <thead>
            <tr className="bg-[#ecf8f1]">
              <th
                className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "120px" }}
              >
                Redemption ID
              </th>
              <th
                className="text-left py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "100px" }}
              >
                User ID
              </th>
              <th
                className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "120px" }}
              >
                Payout Method
              </th>
              <th
                className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "100px" }}
              >
                Amount
              </th>
              <th
                className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "90px" }}
              >
                Status
              </th>
              <th
                className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "150px" }}
              >
                Requested At
              </th>
              <th
                className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]"
                style={{ minWidth: "100px" }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center">
                  <div className="text-gray-500">Loading payouts...</div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center">
                  <div className="text-gray-500">No payouts found</div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${
                    index === data.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-4 px-3">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                      {row.metadata?.externalId ||
                        row._id?.slice(-8) ||
                        row.redemptionId ||
                        row.id ||
                        "N/A"}
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                      {row.userId?._id ||
                        row.userId ||
                        row.user?._id ||
                        row.user?.userId ||
                        "N/A"}
                    </div>
                  </td>

                  <td className="py-4 px-2 text-center">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                      {row.reward?.delivery?.method ||
                        row.payoutMethod ||
                        row.method ||
                        "N/A"}
                    </div>
                  </td>

                  <td className="py-4 px-2 text-center">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                      {row.payment?.amount
                        ? `${row.payment.currency || "USD"} ${
                            row.payment.amount
                          }`
                        : row.amount
                        ? `₹${row.amount}`
                        : "N/A"}
                    </div>
                  </td>

                  <td className="py-4 px-2 text-center">
                    <div
                      className={`inline-flex items-center justify-center px-2 py-1.5 rounded-full min-w-0 ${getStatusStyles(
                        row.status
                      )}`}
                    >
                      <div className="font-medium text-sm tracking-[0.1px] leading-4 whitespace-nowrap">
                        {formatStatus(row.status)}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-2 text-center">
                    <div className="font-medium text-[#7f7f7f] text-sm tracking-[0.1px] leading-5">
                      {formatDate(row.createdAt || row.requestedAt)}
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className="flex items-center justify-center gap-2">
                      {row.status?.toLowerCase() === "pending" ? (
                        <>
                          <button
                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-[#00a389] rounded-full hover:bg-[#008a73] transition-colors cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onApprove(row._id || row.id)}
                            disabled={loading}
                          >
                            <div className="font-medium text-white text-xs tracking-[0] leading-4">
                              Approve
                            </div>
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 rounded-full hover:bg-red-700 transition-colors cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onReject(row._id || row.id)}
                            disabled={loading}
                          >
                            <div className="font-medium text-white text-xs tracking-[0] leading-4">
                              Reject
                            </div>
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-200 rounded-full text-xs cursor-not-allowed">
                          <div className="font-medium text-gray-500 text-xs tracking-[0] leading-4">
                            {formatStatus(row.status)}
                          </div>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default function PaymentsPage() {
  const { searchTerm, registerSearchHandler } = useSearch();
  const [filters, setFilters] = useState({
    dateRange: null,
    type: null,
    status: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
  });
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const itemsPerPage = 20;

  // Helper function to calculate date range
  const getDateRange = (range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate, endDate;

    switch (range) {
      case "Today":
        startDate = today;
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Yesterday":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Last 7 days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(now);
        break;
      case "Last 30 days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date(now);
        break;
      default:
        return null;
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    registerSearchHandler((query) => {
      setCurrentPage(1); // Reset to first page when searching
    });
  }, [registerSearchHandler]);

  // Fetch payouts from API
  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      // Add status filter if selected
      if (filters.status) {
        params.status = filters.status;
      }

      // Add date range filter if selected
      if (filters.dateRange) {
        const dateRange = getDateRange(filters.dateRange);
        if (dateRange) {
          params.startDate = dateRange.startDate.toISOString();
          params.endDate = dateRange.endDate.toISOString();
        }
      }

      const response = await apiClient.get("/admin/payouts", { params });

      if (response.data?.success) {
        const data = response.data.data || response.data;

        // API returns data.requests array
        const requests = Array.isArray(data.requests)
          ? data.requests
          : Array.isArray(data.payouts)
          ? data.payouts
          : Array.isArray(data)
          ? data
          : [];

        setPaymentsData(requests);

        // Extract unique statuses and types from the data
        const uniqueStatuses = [
          ...new Set(
            requests.map((req) => req.status).filter((status) => status != null)
          ),
        ].sort();

        const uniqueTypes = [
          ...new Set(
            requests
              .map((req) => req.reward?.delivery?.method)
              .filter((type) => type != null)
          ),
        ].sort();

        // Update options if we have new data
        if (uniqueStatuses.length > 0) {
          setStatusOptions(uniqueStatuses);
        }
        if (uniqueTypes.length > 0) {
          setTypeOptions(uniqueTypes);
        }

        // Update pagination - API uses 'pages' and 'total'
        if (data.pagination) {
          setPagination({
            totalPages:
              data.pagination.pages || data.pagination.totalPages || 1,
            totalItems:
              data.pagination.total || data.pagination.totalItems || 0,
          });
        } else if (Array.isArray(requests)) {
          // If response is just an array, calculate pagination
          setPagination({
            totalPages: Math.ceil(requests.length / itemsPerPage),
            totalItems: requests.length,
          });
        }
      } else {
        throw new Error(response.data?.message || "Failed to fetch payouts");
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error(error.response?.data?.message || "Failed to load payouts");
      setPaymentsData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.status, filters.dateRange, itemsPerPage]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleFilterChange = (filterId, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
    setCurrentPage(1);
  };

  const handleApprove = async (payoutId) => {
    if (!payoutId) {
      toast.error("Invalid payout ID");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        `/admin/payouts/${payoutId}/approve`
      );

      if (response.data?.success) {
        toast.success("Payout approved successfully");
        // Refresh the list
        await fetchPayouts();
      } else {
        throw new Error(response.data?.message || "Failed to approve payout");
      }
    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error(error.response?.data?.message || "Failed to approve payout");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (payoutId) => {
    if (!payoutId) {
      toast.error("Invalid payout ID");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        `/admin/payouts/${payoutId}/reject`
      );

      if (response.data?.success) {
        toast.success("Payout rejected successfully");
        // Refresh the list
        await fetchPayouts();
      } else {
        throw new Error(response.data?.message || "Failed to reject payout");
      }
    } catch (error) {
      console.error("Error rejecting payout:", error);
      toast.error(error.response?.data?.message || "Failed to reject payout");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Client-side filtering for type, search, and date (if API doesn't support it)
  const filteredData = paymentsData.filter((payment) => {
    // Search filter
    const searchableText = [
      payment.metadata?.externalId || "",
      payment._id || "",
      payment.userId?._id || "",
      payment.userId?.firstName || "",
      payment.userId?.lastName || "",
      payment.userId?.email || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !searchTerm || searchableText.includes(searchTerm.toLowerCase());

    // Type filter
    const payoutMethod =
      payment.reward?.delivery?.method ||
      payment.payoutMethod ||
      payment.method ||
      "";
    const matchesType =
      !filters.type ||
      payoutMethod.toLowerCase() === filters.type.toLowerCase();

    // Date range filter (client-side fallback if API doesn't support it)
    let matchesDate = true;
    if (filters.dateRange) {
      const dateRange = getDateRange(filters.dateRange);
      if (dateRange && payment.createdAt) {
        const paymentDate = new Date(payment.createdAt);
        matchesDate =
          paymentDate >= dateRange.startDate &&
          paymentDate <= dateRange.endDate;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="w-full p-6">
      <Frame
        filters={filters}
        setFilters={setFilters}
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        typeOptions={typeOptions}
      />
      <Table
        data={filteredData}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems || filteredData.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
