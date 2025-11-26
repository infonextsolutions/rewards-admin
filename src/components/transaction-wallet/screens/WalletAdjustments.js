"use client";

import { useState, useEffect } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import {
  TRANSACTION_API,
  BALANCE_TYPES,
  ADJUSTMENT_TYPES,
} from "../../../data/transactions";
import toast from "react-hot-toast";

export default function WalletAdjustments({ onSneakPeek }) {
  const [formData, setFormData] = useState({
    userId: "",
    balanceType: "coins",
    adjustmentType: "add",
    amount: "",
    reason: "",
    adminId: "ADM-43", // Auto-filled from session
  });
  const [loading, setLoading] = useState(false);
  const [recentAdjustments, setRecentAdjustments] = useState([]);
  const [userBalance, setUserBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errors, setErrors] = useState({});

  // Load recent adjustments from API - only 5 most recent
  useEffect(() => {
    const loadRecentAdjustments = async () => {
      try {
        // Fetch recent adjustment transactions from backend API
        const response = await TRANSACTION_API.getAllTransactions({
          type: "adjustment",
          limit: 5,
          page: 1,
        });

        if (response.data?.success && response.data?.data?.transactions) {
          const adjustments = response.data.data.transactions
            .slice(0, 5) // Ensure only 5 items
            .map((tx) => ({
              id: tx.transactionId || tx.referenceId || tx._id,
              userId: tx.userId || tx.user?._id || "-",
              balanceType: tx.balanceType || "coins",
              adjustmentType: tx.adjustment?.adjustmentType || "add",
              amount: `${tx.adjustment?.adjustmentType === "add" ? "+" : "-"}${
                tx.amount || 0
              } ${tx.balanceType || "coins"}`,
              reason:
                tx.description || tx.adjustment?.reason || "Wallet adjustment",
              adminId: tx.adjustment?.adminId || tx.metadata?.adminId || "-",
              timestamp: new Date(
                tx.createdAt || tx.createdOn
              ).toLocaleString(),
              status: tx.status || "Completed",
            }));
          setRecentAdjustments(adjustments);
        }
      } catch (error) {
        console.error("Failed to load recent adjustments:", error);
        // Set empty array if API fails
        setRecentAdjustments([]);
      }
    };

    loadRecentAdjustments();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Fetch user wallet details when userId changes
    if (field === "userId" && value.trim() && /^[a-f\d]{24}$/i.test(value)) {
      fetchUserWallet(value);
    } else if (field === "userId") {
      setUserBalance(null);
    }
  };

  const fetchUserWallet = async (userId) => {
    setLoadingBalance(true);
    try {
      const response = await TRANSACTION_API.getUserWallet(userId);
      if (response.data?.success) {
        console.log("User wallet response:", response.data.data);
        setUserBalance(response.data.data);
      } else {
        setUserBalance(null);
        toast.error("User not found. Please check the User ID.");
      }
    } catch (error) {
      console.error("Failed to fetch user wallet:", error);
      setUserBalance(null);
      if (error.response?.status === 404) {
        toast.error("User not found. Please check the User ID.");
      } else {
        toast.error("Failed to fetch user wallet details.");
      }
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation as per requirements
    const errors = [];

    if (!formData.userId.trim()) {
      errors.push("User ID is required");
    } else if (!/^[a-f\d]{24}$/i.test(formData.userId)) {
      errors.push("User ID must be a valid MongoDB ObjectId (24 characters)");
    }

    if (!formData.balanceType) {
      errors.push("Balance Type is required");
    }

    if (!formData.adjustmentType) {
      errors.push("Adjustment Type is required");
    }

    if (!formData.amount) {
      errors.push("Amount is required");
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.push("Amount must be a positive number");
    }

    if (!formData.reason.trim()) {
      errors.push("Reason is required");
    } else if (formData.reason.trim().length < 10) {
      errors.push("Reason must be at least 10 characters long");
    }

    if (errors.length > 0) {
      alert("Please fix the following errors:\n" + errors.join("\n"));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare API payload
      const payload = {
        userId: formData.userId,
        balanceType: formData.balanceType,
        adjustmentType: formData.adjustmentType,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
      };

      console.log("Sending wallet adjustment request:", payload);

      // Make real API call
      const response = await TRANSACTION_API.adjustWallet(payload);

      if (response.data?.success) {
        // Reload recent adjustments from API to get the latest 5
        const loadRecentAdjustments = async () => {
          try {
            const adjustmentsResponse =
              await TRANSACTION_API.getAllTransactions({
                type: "adjustment",
                limit: 5,
                page: 1,
              });

            if (
              adjustmentsResponse.data?.success &&
              adjustmentsResponse.data?.data?.transactions
            ) {
              const adjustments = adjustmentsResponse.data.data.transactions
                .slice(0, 5)
                .map((tx) => ({
                  id: tx.transactionId || tx.referenceId || tx._id,
                  userId: tx.userId || tx.user?._id || "-",
                  balanceType: tx.balanceType || "coins",
                  adjustmentType: tx.adjustment?.adjustmentType || "add",
                  amount: `${
                    tx.adjustment?.adjustmentType === "add" ? "+" : "-"
                  }${tx.amount || 0} ${tx.balanceType || "coins"}`,
                  reason:
                    tx.description ||
                    tx.adjustment?.reason ||
                    "Wallet adjustment",
                  adminId:
                    tx.adjustment?.adminId || tx.metadata?.adminId || "-",
                  timestamp: new Date(
                    tx.createdAt || tx.createdOn
                  ).toLocaleString(),
                  status: tx.status || "Completed",
                }));
              setRecentAdjustments(adjustments);
            }
          } catch (error) {
            console.error("Failed to reload recent adjustments:", error);
          }
        };

        // Reload adjustments from API
        await loadRecentAdjustments();

        // Reset form
        setFormData({
          userId: "",
          balanceType: "coins",
          adjustmentType: "add",
          amount: "",
          reason: "",
          adminId: "ADM-43",
        });
        setUserBalance(null);

        toast.success("Wallet adjustment completed successfully!");
      } else {
        throw new Error(
          response.data?.message || "Failed to process adjustment"
        );
      }
    } catch (error) {
      console.error("Error processing adjustment:", error);

      let errorMessage = "Failed to process adjustment. Please try again.";

      if (error.response?.status === 404) {
        errorMessage =
          "User not found. Please check the User ID and try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message ||
          "Invalid request data. Please check your input.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Adjustment Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Make Wallet Adjustment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => handleInputChange("userId", e.target.value)}
                  placeholder="Enter User ID (e.g., 68ab70cb2293c4f47bafbc8b)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("userId", "68ab70cb2293c4f47bafbc8b")
                  }
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
                >
                  Test ID
                </button>
              </div>
            </div>

            {/* Balance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance Type *
              </label>
              <select
                value={formData.balanceType}
                onChange={(e) =>
                  handleInputChange("balanceType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Type</option>
                <option value="coins">Coins</option>
                <option value="xp">XP</option>
              </select>
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type *
              </label>
              <select
                value={formData.adjustmentType}
                onChange={(e) =>
                  handleInputChange("adjustmentType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Add/Subtract</option>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="Enter Amount"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Admin ID (Auto-filled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin ID
              </label>
              <input
                type="text"
                value={formData.adminId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="Provide justification for adjustment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing Adjustment..." : "Approve Adjustment"}
            </button>
          </div>
        </form>
      </div>

      {/* User Wallet Display */}
      {formData.userId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Wallet Details
          </h2>
          {loadingBalance ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-2 text-gray-600">
                Loading wallet details...
              </span>
            </div>
          ) : userBalance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Coins</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const coins = userBalance.coins;
                    if (typeof coins === "object" && coins !== null) {
                      return coins.current || coins.total || 0;
                    }
                    return coins || 0;
                  })()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">XP</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const xp = userBalance.xp;
                    if (typeof xp === "object" && xp !== null) {
                      return xp.current || xp.total || 0;
                    }
                    return xp || 0;
                  })()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Tier</div>
                <div className="text-2xl font-bold text-gray-900">
                  {userBalance.tier || "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Enter a valid User ID to view wallet details
            </div>
          )}
        </div>
      )}

      {/* Recent Adjustments */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Adjustments
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Adjustment ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  User ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Adjustment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Reason
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Admin
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAdjustments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <p className="text-gray-500">No recent adjustments found</p>
                  </td>
                </tr>
              ) : (
                recentAdjustments.map((adjustment) => (
                  <tr key={adjustment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="font-medium text-gray-900">
                        {adjustment.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <button
                        onClick={() =>
                          window.open(`/users/${adjustment.userId}`, "_blank")
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium mx-auto"
                      >
                        {adjustment.userId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="text-sm text-gray-900 capitalize">
                        {adjustment.balanceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="text-sm text-gray-900 capitalize">
                        {adjustment.adjustmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="font-medium text-gray-900">
                        {adjustment.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="text-sm text-gray-900">
                        {adjustment.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="text-sm text-gray-900">
                        {adjustment.adminId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                      <span className="text-sm text-gray-500">
                        {adjustment.timestamp}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
