

"use client";

import { memo, useMemo } from "react";

const AttributionPerformanceTable = memo(({ data, loading }) => {
  // Map API data to table format
  const getSourceIcon = (source) => {
    const iconMap = {
      facebook: { icon: "📘", bg: "bg-blue-100" },
      google: { icon: "🔍", bg: "bg-green-100" },
      tiktok: { icon: "🎵", bg: "bg-pink-100" },
      instagram: { icon: "📷", bg: "bg-purple-100" },
      snapchat: { icon: "👻", bg: "bg-yellow-100" },
      direct: { icon: "🌱", bg: "bg-emerald-100" },
      organic: { icon: "🌱", bg: "bg-emerald-100" },
    };
    return iconMap[source?.toLowerCase()] || { icon: "📊", bg: "bg-gray-100" };
  };

  const tableData = useMemo(() => {
    return data && data.length > 0
      ? data.map((item, index) => {
          const sourceIcon = getSourceIcon(item.source);
          return {
            id: index + 1,
            source: item.source
              ? item.source.charAt(0).toUpperCase() + item.source.slice(1)
              : "Unknown",
            icon: sourceIcon.icon,
            iconBg: sourceIcon.bg,
            installs: item.installs || 0,
            d1Retention: item.d1Retention || 0,
            revenue: item.revenue || 0,
            rewardCost: item.rewardCost || 0,
            marginPercent: item.marginPercent || 0,
          };
        })
      : [];
  }, [data]);

  const displayData = tableData;
  const hasData = displayData.length > 0;

  // Memoize formatters to avoid recreation
  const formatCurrency = useMemo(
    () => (amount) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
    []
  );

  const formatNumber = useMemo(
    () => (num) => {
      return new Intl.NumberFormat("en-US").format(num);
    },
    []
  );

  // Memoize totals calculation
  const totals = useMemo(() => {
    if (!hasData) {
      return {
        totalInstalls: 0,
        totalRevenue: 0,
        totalRewardCost: 0,
        avgRetention: 0,
      };
    }
    return {
      totalInstalls: displayData.reduce((sum, item) => sum + item.installs, 0),
      totalRevenue: displayData.reduce((sum, item) => sum + item.revenue, 0),
      totalRewardCost: displayData.reduce(
        (sum, item) => sum + item.rewardCost,
        0
      ),
      avgRetention:
        displayData.reduce((sum, item) => sum + item.d1Retention, 0) /
        displayData.length,
    };
  }, [displayData, hasData]);

  // EXCLUDED: Red/green visual margin indicators & automatic underperformer flagging not supported per requirements
  // const getRetentionColor = (percent) => {
  //   if (percent >= 70) return 'text-green-600 bg-green-50';
  //   if (percent >= 60) return 'text-yellow-600 bg-yellow-50';
  //   return 'text-red-600 bg-red-50';
  // };
  //
  // const getMarginColor = (percent) => {
  //   if (percent >= 70) return 'text-green-600';
  //   if (percent >= 60) return 'text-yellow-600';
  //   return 'text-red-600';
  // };

  const getRetentionColor = (percent) => {
    return "text-gray-600 bg-gray-50";
  };

  const getMarginColor = (percent) => {
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
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
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
              Attribution Performance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Marketing channel effectiveness and ROI analysis
            </p>
          </div>
        </div>

        {/* Attribution Table */}
        {hasData ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                    Source
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    Installs
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    D1 Retention
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    Reward Cost
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayData.map((source) => (
                  <tr
                    key={source.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${source.iconBg} mr-3`}>
                          <span className="text-sm">{source.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {source.source}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatNumber(source.installs)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRetentionColor(
                          source.d1Retention
                        )}`}
                      >
                        {source.d1Retention.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(source.revenue)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="text-gray-700 text-sm">
                        {formatCurrency(source.rewardCost)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span
                        className={`font-semibold text-sm ${getMarginColor(
                          source.marginPercent
                        )}`}
                      >
                        {source.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                No attribution data available
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
});

AttributionPerformanceTable.displayName = "AttributionPerformanceTable";

export default AttributionPerformanceTable;
