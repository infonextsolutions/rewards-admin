"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearch } from "../../contexts/SearchContext";
import Pagination from "../../components/ui/Pagination";
import apiClient from "../../lib/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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

  // SW-40: Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".filter-dropdown-container") &&
        !event.target.closest("button")
      ) {
        setDateRangeOpen(false);
        setTypeOpen(false);
        setStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    // Type filter commented out for now
    // {
    //   id: "type",
    //   label: filters.type || "Type",
    //   isOpen: typeOpen,
    //   setOpen: setTypeOpen,
    //   options: typeOptions,
    // },
    {
      id: "status",
      label: filters.status
        ? filters.status.charAt(0).toUpperCase() +
          filters.status.slice(1).toLowerCase()
        : "Status",
      isOpen: statusOpen,
      setOpen: setStatusOpen,
      options: statusOptions.map(
        (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      ),
    },
  ];

  const handleFilterClick = (filterId) => {
    const filter = filterOptions.find((f) => f.id === filterId);
    if (filter) {
      filter.setOpen(!filter.isOpen);
    }
  };

  const handleFilterSelect = (filterId, value) => {
    // For status filter, convert displayed value back to lowercase for API
    const actualValue =
      filterId === "status" && value ? value.toLowerCase() : value;
    onFilterChange(filterId, actualValue);
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
              className="relative min-w-[150px] flex-shrink-0 filter-dropdown-container"
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
  const router = useRouter();

  const handleUserIdClick = (row) => {
    const userId =
      row.userId?._id || row.userId || row.user?._id || row.user?.userId;
    if (userId && userId !== "N/A") {
      router.push(`/users/${userId}`);
    }
  };

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
                    <div
                      className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 cursor-pointer hover:text-[#00a389] transition-colors"
                      onClick={() => handleUserIdClick(row)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleUserIdClick(row);
                        }
                      }}
                    >
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

      {/* Pagination - SW-41: Always show pagination if there are items */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
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
  // Maintain all possible status options - don't reset when filtering
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  // Define all possible status values to ensure they're always available
  const allPossibleStatuses = ["pending", "completed", "failed"];
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
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

        // Extract unique statuses from the data
        // Always merge with existing options to ensure all status options remain available
        // even after a filter is applied
        const uniqueStatuses = [
          ...new Set(
            requests.map((req) => req.status).filter((status) => status != null)
          ),
        ];

        // Merge with existing options and all possible statuses to ensure complete list
        setStatusOptions((prevOptions) => {
          const merged = [
            ...new Set([
              ...allPossibleStatuses,
              ...prevOptions,
              ...uniqueStatuses,
            ]),
          ]
            .filter((status) => status != null)
            .sort();
          // Only update if we have new statuses or if this is the first load
          return prevOptions.length === 0 || merged.length > prevOptions.length
            ? merged
            : prevOptions;
        });

        // SW-39: Filter out "link" and other invalid types
        // Type filter commented out for now
        // const validTypes = [
        //   "UPI",
        //   "Paytm",
        //   "Gift Card",
        //   "Bank Transfer",
        //   "PayPal",
        //   "Amazon Pay",
        // ];
        // const uniqueTypes = [
        //   ...new Set(
        //     requests
        //       .map((req) => req.reward?.delivery?.method)
        //       .filter(
        //         (type) =>
        //           type != null && type !== "link" && validTypes.includes(type)
        //       )
        //   ),
        // ].sort();

        // Type options commented out
        // if (uniqueTypes.length > 0) {
        //   setTypeOptions(uniqueTypes);
        // }

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

  const handleReject = (payoutId) => {
    // SW-42: Open modal to collect rejection reason
    setSelectedPayoutId(payoutId);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPayoutId) {
      toast.error("Invalid payout ID");
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        `/admin/payouts/${selectedPayoutId}/reject`,
        { reason: rejectionReason.trim() }
      );

      if (response.data?.success) {
        toast.success("Payout rejected successfully");
        setRejectModalOpen(false);
        setSelectedPayoutId(null);
        setRejectionReason("");
        // Refresh the list
        await fetchPayouts();
      } else {
        throw new Error(response.data?.message || "Failed to reject payout");
      }
    } catch (error) {
      console.error("Error rejecting payout:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to reject payout";
      toast.error(errorMessage);
      // If error is about missing reason, keep modal open
      if (!errorMessage.includes("reason")) {
        setRejectModalOpen(false);
        setSelectedPayoutId(null);
        setRejectionReason("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectModalOpen(false);
    setSelectedPayoutId(null);
    setRejectionReason("");
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

    // Type filter - commented out for now
    // const payoutMethod =
    //   payment.reward?.delivery?.method ||
    //   payment.payoutMethod ||
    //   payment.method ||
    //   "";
    // const matchesType =
    //   !filters.type ||
    //   payoutMethod.toLowerCase() === filters.type.toLowerCase();
    const matchesType = true; // Always match since type filter is disabled

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

    return matchesSearch && matchesType && matchesDate; // matchesType always true since type filter is disabled
  });

  return (
    <div className="w-full p-6">
      <Frame
        filters={filters}
        setFilters={setFilters}
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        typeOptions={[]} // Type filter commented out
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

      {/* SW-42: Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Payout Request
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this payout request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be sent to the user
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleRejectCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={loading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Rejecting..." : "Reject Payout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
