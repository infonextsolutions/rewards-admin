"use client";

import { memo, useMemo, useEffect } from "react";
import Pagination from "../ui/Pagination";

const RevenueVsRewardTable = memo(
  ({
    data = [],
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 50,
    },
    loading = false,
    filters = null,
    selectedRetentionDay = "D7",
    onRetentionDayChange = () => {},
    onPageChange = () => {},
  }) => {
    // Map API data to table format - memoized for performance
    // Use real data from backend API (already paginated from server)
    const tableData = useMemo(() => {
      if (data && data.length > 0) {
        return data.map((game, index) => {
          const gameName = game.title || game.gameId || "Unknown Game";

          // Use real data from API
          const revenue = game.revenue || 0;
          const rewardCost = game.rewardCost || 0;
          const marginDollar = game.margin || revenue - rewardCost;
          const marginPercent =
            game.marginPercent ||
            (revenue > 0 ? (marginDollar / revenue) * 100 : 0);
          
          // Use generic retention field (supports any retention day)
          const retention = game.retention || game.d7Retention || 0;

          return {
            id: index + 1,
            game: gameName,
            icon: "🎮",
            revenue: revenue,
            rewardCost: rewardCost,
            marginDollar: marginDollar,
            marginPercent: marginPercent,
            retention: retention,
            gameId: game.gameId,
          };
        });
      }
      // Return empty array if no data
      return [];
    }, [data]);

    // Reset to page 1 when filters change (handled by parent component)
    useEffect(() => {
      // When filters change, parent will reset page to 1 and fetch new data
    }, [filters]);

    const hasData = tableData.length > 0;

    // Use pagination from API response
    const currentPage = pagination?.currentPage || 1;
    const totalPages = pagination?.totalPages || 1;
    const totalItems = pagination?.totalItems || 0;

    // Memoize currency formatter instance to avoid recreation
    const currencyFormatter = useMemo(
      () =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }),
      []
    );

    const formatCurrency = (amount) => {
      return currencyFormatter.format(amount);
    };

    // EXCLUDED: Red/green visual margin indicators & automatic underperformer flagging not supported per requirements
    // const getMarginColor = (percent) => {
    //   if (percent >= 75) return 'text-green-600 bg-green-50';
    //   if (percent >= 60) return 'text-yellow-600 bg-yellow-50';
    //   return 'text-red-600 bg-red-50';
    // };
    //
    // const getRetentionColor = (percent) => {
    //   if (percent >= 50) return 'text-green-600';
    //   if (percent >= 35) return 'text-yellow-600';
    //   return 'text-red-600';
    // };

    const getMarginColor = (percent) => {
      return "text-gray-600 bg-gray-50";
    };

    const getRetentionColor = (percent) => {
      return "text-gray-600";
    };

    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue vs Reward Cost
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Profitability analysis by game performance
              </p>
            </div>
            
            {/* Retention Day Dropdown */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Retention Metric
              </label>
              <select
                value={selectedRetentionDay}
                onChange={(e) => onRetentionDayChange(e.target.value)}
                disabled={loading}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                <option value="D1">D1 Retention</option>
                <option value="D3">D3 Retention</option>
                <option value="D4">D4 Retention</option>
                <option value="D5">D5 Retention</option>
                <option value="D6">D6 Retention</option>
                <option value="D7">D7 Retention</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 mt-5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Table */}
          {hasData ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Game
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                        Revenue
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                        Reward Cost
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                        Margin $
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                        Margin %
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                        {selectedRetentionDay} Retention
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tableData.map((game) => (
                      <tr
                        key={game.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">{game.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {game.game}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(game.revenue)}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="text-gray-700 text-sm">
                            {formatCurrency(game.rewardCost)}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="font-semibold text-gray-600 text-sm">
                            {formatCurrency(game.marginDollar)}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMarginColor(
                              game.marginPercent
                            )}`}
                          >
                            {game.marginPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span
                            className={`font-semibold text-sm ${getRetentionColor(
                              game.retention
                            )}`}
                          >
                            {game.retention.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  No revenue data available
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Data will appear once available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RevenueVsRewardTable.displayName = "RevenueVsRewardTable";

export default RevenueVsRewardTable;
