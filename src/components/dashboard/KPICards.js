"use client";

import { memo, useMemo } from "react";

// Memoize formatters outside component to avoid recreation
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const formatValue = (val, type) => {
  if (type === "currency") {
    return currencyFormatter.format(val);
  }

  if (type === "number") {
    return numberFormatter.format(val);
  }

  return val;
};

const KPICard = memo(({ title, value, icon, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className={`p-2 lg:p-3 rounded-lg ${icon.bgColor} flex-shrink-0`}>
          <span className="text-xl lg:text-2xl">{icon.emoji}</span>
        </div>
        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium text-gray-600 leading-tight">
            {title}
          </p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate mt-1">
            {formatValue(value, icon.type)}
          </p>
        </div>
      </div>
    </div>
  );
});

KPICard.displayName = "KPICard";

const KPICards = ({ data, loading }) => {
  const kpiConfig = useMemo(
    () => [
      {
        key: "totalRegisteredUsers",
        title: "Total Registered Users",
        icon: { emoji: "👥", bgColor: "bg-blue-100", type: "number" },
        value:
          data?.kpis?.totalRegisteredUsers || data?.overview?.totalUsers || 0,
      },
      {
        key: "activeUsersToday",
        title: "Active Users Today",
        icon: { emoji: "👑", bgColor: "bg-purple-100", type: "number" },
        value: data?.kpis?.activeUsersToday || 0,
      },
      {
        key: "totalRewardsIssued",
        title: "Total Rewards Issued",
        icon: { emoji: "🎁", bgColor: "bg-green-100", type: "number" },
        value: data?.kpis?.totalRewardsIssued || 0,
      },
      {
        key: "totalRedemptions",
        title: "Total Redemptions",
        icon: { emoji: "✅", bgColor: "bg-emerald-100", type: "number" },
        value: data?.kpis?.totalRedemptions || 0,
      },
      {
        key: "avgXPPerUser",
        title: "Avg XP Per User",
        icon: { emoji: "💰", bgColor: "bg-yellow-100", type: "number" },
        value: data?.kpis?.avgXPPerUser || 0,
      },
    ],
    [data]
  );

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {kpiConfig.map((config) => (
          <KPICard
            key={config.key}
            title={config.title}
            value={config.value}
            icon={config.icon}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default KPICards;
