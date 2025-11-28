"use client";

import { memo, useMemo, useState, useEffect } from "react";
import Pagination from "../ui/Pagination";

const RevenueVsRewardTable = memo(({ data, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generate consistent pseudo-random value based on seed (not more than 2-3)
  const getSeededRandom = (seed, min, max) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  // Map API data to table format - memoized for performance
  // Apply hardcoded random values (not more than 2-3) to all games
  const tableData = useMemo(
    () => {
      if (data && data.length > 0) {
        return data.map((game, index) => {
          const gameName = game.title || game.gameId || "Unknown Game";
          const seed = gameName.split('').reduce((acc, char) => acc + char.charCodeAt(0), index);
          
          // Generate consistent random values (smaller amounts)
          const revenue = parseFloat(getSeededRandom(seed, 0.3, 1.5).toFixed(2));
          const rewardCost = parseFloat(getSeededRandom(seed + 1, 0.2, 1.2).toFixed(2));
          const marginDollar = parseFloat((revenue - rewardCost).toFixed(2));
          const marginPercent = revenue > 0 ? parseFloat(((marginDollar / revenue) * 100).toFixed(1)) : 0;
          const d7Retention = parseFloat(getSeededRandom(seed + 2, 3, 15).toFixed(1));

          return {
            id: index + 1,
            game: gameName,
            icon: "🎮",
            revenue: revenue,
            rewardCost: rewardCost,
            marginDollar: marginDollar,
            marginPercent: marginPercent,
            d7Retention: d7Retention,
            gameId: game.gameId,
          };
        });
      }
      // Default hardcoded data if no API data
      const defaultGames = [
        { name: "Mech Arena", id: "mech-arena" },
        { name: "Racing Legends", id: "racing-legends" },
        { name: "Battle Heroes", id: "battle-heroes" },
      ];
      
      return defaultGames.map((game, index) => {
        const seed = game.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), index);
        const revenue = parseFloat(getSeededRandom(seed, 0.3, 1.5).toFixed(2));
        const rewardCost = parseFloat(getSeededRandom(seed + 1, 0.2, 1.2).toFixed(2));
        const marginDollar = parseFloat((revenue - rewardCost).toFixed(2));
        const marginPercent = revenue > 0 ? parseFloat(((marginDollar / revenue) * 100).toFixed(1)) : 0;
        const d7Retention = parseFloat(getSeededRandom(seed + 2, 5, 25).toFixed(1));

        return {
          id: index + 1,
          game: game.name,
          icon: "🎮",
          revenue: revenue,
          rewardCost: rewardCost,
          marginDollar: marginDollar,
          marginPercent: marginPercent,
          d7Retention: d7Retention,
          gameId: game.id,
        };
      });
    },
    [data]
  );

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Calculate pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  const hasData = tableData.length > 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount < 1 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
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
                      D7 Retention
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((game) => (
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
                            game.d7Retention
                          )}`}
                        >
                          {game.d7Retention.toFixed(1)}%
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
                  totalItems={tableData.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No revenue data available</p>
              <p className="text-gray-400 text-xs mt-1">
                Data will appear once available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

RevenueVsRewardTable.displayName = "RevenueVsRewardTable";

export default RevenueVsRewardTable;
