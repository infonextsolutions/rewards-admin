"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function SneakPeekModal({ userId, isOpen, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) {
      setUserData(null);
      return;
    }

    const fetchUserSneakPeek = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://rewardsuatapi.hireagent.co/api/admin/transactions/users/${userId}/sneak-peek`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const result = await response.json();

        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          toast.error("Failed to load user data");
        }
      } catch (error) {
        console.error("Error fetching user sneak peek:", error);
        toast.error("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSneakPeek();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const getTransactionTypeColor = (type) => {
    const colors = {
      credit: "bg-green-100 text-green-800",
      debit: "bg-red-100 text-red-800",
      redemption: "bg-purple-100 text-purple-800",
      adjustment: "bg-blue-100 text-blue-800",
      reward: "bg-yellow-100 text-yellow-800",
      spin: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              User Activity - Sneak Peek
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time activity timeline for {userId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3 mx-auto"></div>
              <p className="text-gray-600">Loading user data...</p>
            </div>
          </div>
        ) : !userData ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-600">Failed to load user data</p>
          </div>
        ) : (
          <div className="flex h-[calc(90vh-88px)]">
            {/* Left Panel - User Summary */}
            <div className="w-1/3 border-r border-gray-200 p-6 bg-gray-50 overflow-y-auto">
              {/* User Profile */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userData.user.name}
                    </h3>
                    <p className="text-sm text-gray-600">{userData.user.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm text-gray-900 break-all">
                        {userData.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Mobile</p>
                      <p className="text-sm text-gray-900">
                        {userData.user.mobile}
                      </p>
                    </div>
                  </div>
                  {userData.user.location && (
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="text-sm text-gray-900">
                          {userData.user.location.city},{" "}
                          {userData.user.location.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet & XP */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Wallet & XP</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        {userData.user.wallet.balance}{" "}
                        {userData.user.wallet.currency}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">XP</span>
                      <span className="text-sm font-medium">
                        {userData.user.xp.current} XP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">
                        Tier {userData.user.xp.tier}
                      </span>
                      <span className="text-xs text-gray-500">
                        Streak: {userData.user.streak.current}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Transactions
                    </span>
                    <span className="text-sm font-medium">
                      {userData.statistics.totalTransactions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Earned</span>
                    <span className="text-sm font-medium text-green-600">
                      +{userData.statistics.totalEarned}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="text-sm font-medium text-red-600">
                      -{userData.statistics.totalSpent}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Activity Timeline */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Recent Activity
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {userData.recentActivity.transactions.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">
                      No recent transactions
                    </p>
                  </div>
                ) : (
                  userData.recentActivity.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(
                                transaction.type,
                              )}`}
                            >
                              {transaction.type.charAt(0).toUpperCase() +
                                transaction.type.slice(1)}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                transaction.status,
                              )}`}
                            >
                              {transaction.status.charAt(0).toUpperCase() +
                                transaction.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {transaction.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p
                            className={`text-sm font-semibold ${
                              transaction.type === "credit" ||
                              transaction.type === "reward"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "credit" ||
                            transaction.type === "reward"
                              ? "+"
                              : "-"}
                            {(() => {
                              const meta = transaction.metadata || {};
                              const bt = transaction.balanceType || "coins";
                              const coinsVal =
                                meta.coins ??
                                (bt === "coins" ? transaction.amount : null);
                              const finalXpVal =
                                meta.finalXp ??
                                (bt === "xp" ? transaction.amount : null);
                              const parts = [];
                              if (coinsVal != null && Number(coinsVal) !== 0)
                                parts.push(`${Number(coinsVal)} coins`);
                              if (
                                finalXpVal != null &&
                                Number(finalXpVal) !== 0
                              )
                                parts.push(`${Number(finalXpVal)} xp`);
                              return parts.length
                                ? parts.join(", ")
                                : `${transaction.amount} ${bt === "xp" ? "xp" : bt}`;
                            })()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      {transaction.metadata &&
                        Object.keys(transaction.metadata).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              {transaction.metadata.orderId && (
                                <span>
                                  Order: {transaction.metadata.orderId}
                                </span>
                              )}
                              {transaction.metadata.recipient && (
                                <span>
                                  To: {transaction.metadata.recipient.email}
                                </span>
                              )}
                              {transaction.adjustment?.isAdjustment && (
                                <span className="text-blue-600">
                                  Admin Adjustment
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      {transaction.referenceId && (
                        <div className="mt-2 text-xs text-gray-400 font-mono">
                          Ref: {transaction.referenceId}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* View Full Profile Link */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    window.open(`/users/${userId}`, "_blank");
                    onClose();
                  }}
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Full User Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
