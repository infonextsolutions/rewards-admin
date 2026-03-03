"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../../lib/apiClient";

export default function TransactionDetails({ transactionId }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode the transaction ID in case it was URL encoded
  const decodedTransactionId = decodeURIComponent(transactionId);

  useEffect(() => {
    // Fetch transaction details from API
    const fetchTransactionDetails = async () => {
      setLoading(true);
      try {
        let t = null;
        
        // First, try to fetch by direct ID (MongoDB ObjectId)
        try {
          const directResponse = await apiClient.get(
            `/admin/transactions/${decodedTransactionId}`
          );
          if (directResponse.data?.success && directResponse.data?.data) {
            t = directResponse.data.data;
          }
        } catch (directError) {
          // If direct ID lookup fails, try search endpoint
          console.log("Direct ID lookup failed, trying search endpoint...");
          const searchResponse = await apiClient.get(
            `/admin/transactions?search=${encodeURIComponent(decodedTransactionId)}`
          );
          
          if (
            searchResponse.data?.success &&
            searchResponse.data?.data?.transactions?.length > 0
          ) {
            t = searchResponse.data.data.transactions[0]; // Get first transaction from search results
          }
        }

        if (t) {

          // Transform API data to component format
          const transformedTransaction = {
            id: t.transactionId || t.referenceId || t._id,
            userId: t.userId || t.user?._id || "-",
            userName:
              t.userName ||
              `${t.user?.firstName || ""} ${t.user?.lastName || ""}`.trim() ||
              "-",
            userEmail: t.userEmail || t.user?.email || "-",
            userMobile: t.user?.mobile || "-",
            type: t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1) : "Unknown",
            amount: (() => {
              const meta = t.metadata || {};
              const bt = t.balanceType || "coins";
              const coinsVal = meta.coins ?? (bt === "coins" ? t.amount : null);
              const finalXpVal = meta.finalXp ?? (bt === "xp" ? t.amount : null);
              const parts = [];
              if (coinsVal != null && Number(coinsVal) !== 0) parts.push(`${Number(coinsVal)} coins`);
              if (finalXpVal != null && Number(finalXpVal) !== 0) parts.push(`${Number(finalXpVal)} xp`);
              return parts.length ? parts.join(", ") : `${t.amount} ${bt === "xp" ? "xp" : bt}`;
            })(),
            description: t.description || "-",
            status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Unknown",
            approval: t.isApproved ? "Yes" : "No",
            createdOn: new Date(t.createdAt).toLocaleString("en-GB"),
            approvedOn:
              t.approval?.status === "approved" && t.updatedAt
                ? new Date(t.updatedAt).toLocaleString("en-GB")
                : "-",
            approvedBy: t.approval?.approvedBy || "-",
            adminName: t.approval?.approverName || "-",
            paymentMethod: t.paymentProvider || "Internal",
            referenceNumber: t.referenceId || t.transactionId || t._id,
            category: t.metadata?.category || "General",
            source: t.metadata?.source || "System",
            notes: t.metadata?.notes || "-",

            // Wallet info
            walletBalance: t.user?.wallet?.balance || 0,
            walletCurrency: t.user?.wallet?.currency || "coins",

            // XP info
            xpCurrent: t.user?.xp?.current || 0,
            xpTier: t.user?.xp?.tier || 0,
            xpStreak: t.user?.xp?.streak || 0,
            xpReward: t.metadata?.finalXp ?? t.metadata?.xp ?? 0,

            // Additional metadata
            metadata: t.metadata || {},

            // Timeline based on available data
            timeline: [
              {
                action: "Transaction Initiated",
                timestamp: new Date(t.createdAt).toLocaleString("en-GB"),
                description: `${
                  t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1) : "Transaction"
                } transaction created`,
              },
              ...(t.updatedAt && t.updatedAt !== t.createdAt
                ? [
                    {
                      action: "Transaction Updated",
                      timestamp: new Date(t.updatedAt).toLocaleString("en-GB"),
                      description: `Status: ${t.status}`,
                    },
                  ]
                : []),
              ...(t.approval?.status === "approved"
                ? [
                    {
                      action: "Transaction Approved",
                      timestamp: new Date(t.updatedAt).toLocaleString("en-GB"),
                      description: t.approval.approverName
                        ? `Approved by ${t.approval.approverName}`
                        : "Approved",
                    },
                  ]
                : []),
            ],
          };

          setTransaction(transformedTransaction);
        } else {
          setTransaction(null);
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        setTransaction(null);
        // Show error toast if needed
        if (error.response?.status !== 404) {
          console.error("Failed to load transaction:", error.response?.data?.error || error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId, decodedTransactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Transaction Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The transaction ID &quot;{decodedTransactionId}&quot; could not be
            found.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "Pending":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "Failed":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}
      >
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Transaction Log
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Transaction Details
              </h1>
              <p className="text-gray-600 mt-1">
                Transaction ID: {transaction.id}
              </p>
            </div>
            <div>{getStatusBadge(transaction.status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Transaction ID
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {transaction.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="text-sm text-gray-900">{transaction.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="text-sm font-semibold text-emerald-600">
                    {transaction.amount}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Category
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.category}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Source
                  </label>
                  <p className="text-sm text-gray-900">{transaction.source}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Payment Method
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.paymentMethod}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Reference Number
                  </label>
                  <p className="text-sm font-mono text-gray-900">
                    {transaction.referenceNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Created On
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.createdOn}
                  </p>
                </div>
                {transaction.approvedOn && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Approved On
                    </label>
                    <p className="text-sm text-gray-900">
                      {transaction.approvedOn}
                    </p>
                  </div>
                )}
              </div>

              {transaction.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.description}
                  </p>
                </div>
              )}

              {transaction.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900">{transaction.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Timeline
              </h2>
              <div className="space-y-4">
                {transaction.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {event.action}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Information
              </h2>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.userName}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.userId}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {transaction.userEmail && transaction.userEmail !== "-" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {transaction.userEmail}
                    </p>
                  </div>
                )}
                {transaction.userMobile && transaction.userMobile !== "-" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Mobile
                    </label>
                    <p className="text-sm text-gray-900">
                      {transaction.userMobile}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500">
                    Wallet Balance
                  </label>
                  <p className="text-sm font-semibold text-emerald-600">
                    {transaction.walletBalance} {transaction.walletCurrency}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">
                    XP Level
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.xpCurrent} XP (Tier {transaction.xpTier})
                  </p>
                </div>
                {transaction.xpReward > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      XP Reward (Xp)
                    </label>
                    <p className="text-sm text-emerald-600">
                      +{transaction.xpReward} Xp
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  window.open(`/users/${transaction.userId}`, "_blank")
                }
                className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                View User Profile
              </button>
            </div>

            {/* Admin Info */}
            {transaction.adminName && transaction.adminName !== "-" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Admin Information
                </h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Admin Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {transaction.adminName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Admin ID
                    </label>
                    <p className="text-sm text-gray-900">
                      {transaction.approvedBy}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Metadata */}
            {transaction.metadata &&
              Object.keys(transaction.metadata).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Details
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(transaction.metadata).map(
                      ([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </label>
                          <p className="text-sm text-gray-900">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
