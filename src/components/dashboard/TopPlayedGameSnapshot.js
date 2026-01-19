"use client";

import React, { useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Color palette for professional charts - moved outside component
const chartColors = {
  age: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
  gender: ["#06b6d4", "#22d3ee", "#67e8f9"],
  region: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
  tier: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"],
};

const TopPlayedGameSnapshot = memo(({ data, loading }) => {
  const router = useRouter();

  // Handler for game navigation
  const handleGameClick = () => {
    if (data?.gameId) {
      router.push(`/offers/tasks?game=${encodeURIComponent(data.gameId)}`);
    }
  };

  // Memoize normalized demographics to avoid recalculation on every render
  const normalizedDemographics = useMemo(() => {
    const gameData = data || {
      name: "N/A",
      banner: "https://c.animaapp.com/7TgsSdEJ/img/image-16@2x.png",
      avgXP: 0,
      rewardConversion: 0,
      demographics: {
        age: [],
        gender: [],
        region: [],
        tier: [],
      },
    };

    const demographics = gameData.demographics || {};

    // Normalize age data
    let normalizedAge = Array.isArray(demographics.age)
      ? demographics.age
      : demographics.age && typeof demographics.age === "object"
      ? Object.entries(demographics.age).map(([name, value], index) => ({
          name,
          value: value || 0,
          color: chartColors.age[index % chartColors.age.length],
        }))
      : [];

    // Filter out unwanted age ranges (35-44, 45-54, 55+)
    normalizedAge = normalizedAge.filter(
      (item) =>
        item.name !== "35-44" && item.name !== "45-54" && item.name !== "55+"
    );

    // Normalize gender data
    let normalizedGender = Array.isArray(demographics.gender)
      ? demographics.gender
      : demographics.gender && typeof demographics.gender === "object"
      ? Object.entries(demographics.gender).map(([name, value], index) => ({
          name,
          value: value || 0,
          color: chartColors.gender[index % chartColors.gender.length],
        }))
      : [];

    // Filter out "Other" gender
    normalizedGender = normalizedGender.filter(
      (item) => item.name.toLowerCase() !== "other"
    );

    // Normalize region data
    let normalizedRegion = Array.isArray(demographics.region)
      ? demographics.region
      : demographics.region && typeof demographics.region === "object"
      ? Object.entries(demographics.region).map(([name, value], index) => ({
          name,
          value: value || 0,
          color: chartColors.region[index % chartColors.region.length],
        }))
      : [];

    // Normalize tier data
    let normalizedTier = Array.isArray(demographics.tier)
      ? demographics.tier
      : demographics.tier && typeof demographics.tier === "object"
      ? Object.entries(demographics.tier).map(([name, value], index) => ({
          name,
          value: value || 0,
          color: chartColors.tier[index % chartColors.tier.length],
        }))
      : [];

    return {
      age: normalizedAge,
      gender: normalizedGender,
      region: normalizedRegion,
      tier: normalizedTier,
    };
  }, [data]);

  // Memoize final game data
  const finalGameData = useMemo(() => {
    const gameData = data || {
      name: "N/A",
      banner: "https://c.animaapp.com/7TgsSdEJ/img/image-16@2x.png",
      avgXP: 0,
      rewardConversion: 0,
      demographics: {
        age: [],
        gender: [],
        region: [],
        tier: [],
      },
    };

    return {
      ...gameData,
      demographics: normalizedDemographics,
      rewardConversion: gameData.rewardConversion || 0,
    };
  }, [data, normalizedDemographics]);

  const statsData = useMemo(
    () => [
      {
        value: finalGameData.avgXP,
        label: "Avg. XP",
        color: "#00a389",
      },
      {
        value: `${finalGameData.rewardConversion}%`,
        label: "Reward\nConversion",
        color: "#00a389",
      },
    ],
    [finalGameData.avgXP, finalGameData.rewardConversion]
  );

  const DonutChart = ({ data, title }) => {
    const RADIAN = Math.PI / 180;

    // Ensure data is an array, default to empty array
    const chartData = Array.isArray(data) ? data : [];

    // If data is empty, show empty chart with a placeholder
    const isEmpty =
      chartData.length === 0 || chartData.every((item) => item.value === 0);

    // Calculate total for percentage calculation
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // For empty data, create a single segment to show empty state
    const displayData = isEmpty
      ? [{ name: "No Data", value: 100, color: "#6b7280" }]
      : chartData;

    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
    }) => {
      // Don't show labels for empty state
      if (isEmpty) return null;

      const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return percent > 0.05 ? (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight="bold"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      ) : null;
    };

    return (
      <div className="bg-[#02020280] rounded-[8px] p-4 shadow-[0px_0px_4px_#00000040] backdrop-blur-sm">
        <h3 className="text-center font-semibold text-white text-sm mb-3">
          {title}
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={50}
                innerRadius={25}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#020202"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  if (isEmpty) return ["No Data", "Empty"];
                  const percentage =
                    total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [`${value} (${percentage}%)`, props.payload.name];
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                  padding: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        {!isEmpty && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {chartData.map((item, index) => {
              const percentage =
                total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full mr-1.5 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-white truncate max-w-20 font-medium">
                    {item.name}
                  </span>
                  <span className="text-white/70 ml-1">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        )}
        {isEmpty && (
          <div className="mt-2 text-center">
            <span className="text-white text-xs opacity-70">
              No data available
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative w-full h-[299px] rounded-[10px] overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-800 animate-pulse">
        <div className="absolute w-full h-full bg-gray-200/20"></div>
      </div>
    );
  }

  // Show message when no data is available
  if (!data) {
    return (
      <div
        className="relative w-full min-h-[400px] rounded-[10px] overflow-hidden p-8"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(88,48,173,1) 0%, rgba(42,34,102,1) 100%)",
        }}
      >
        <h1 className="text-2xl font-semibold text-white mb-8">
          Top Played Game
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-white text-lg font-medium">No game data available</p>
            <p className="text-gray-300 text-sm mt-2">Data will appear once games are played</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-[400px] rounded-[10px] overflow-hidden p-8"
      style={{
        background:
          "radial-gradient(50% 50% at 50% 50%, rgba(88,48,173,1) 0%, rgba(42,34,102,1) 100%)",
      }}
    >
      <h1 className="text-2xl font-semibold text-white mb-8">
        Top Played Game
      </h1>

      {/* Game Banner & Title + Metrics Section */}
      <div className="flex items-start gap-8 mb-8">
        {/* Game Icon & Title */}
        <div
          className={`flex flex-col items-center gap-4 ${data?.gameId ? 'cursor-pointer group' : ''}`}
          onClick={handleGameClick}
          title={data?.gameId ? 'Click to view game details' : ''}
        >
          <div className={`relative w-[240px] h-[240px] bg-white rounded-[12px] overflow-hidden border-[3px] border-solid border-[#d3f8d2] shadow-lg ${data?.gameId ? 'group-hover:border-[#00a389] group-hover:shadow-xl transition-all duration-200' : ''}`}>
            <img
              className="w-full h-full object-cover"
              alt={finalGameData.name}
              src={finalGameData.banner}
              onError={(e) => {
                e.target.style.display = "none";
                const displayName = finalGameData.name.split(" - ")[0];
                e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">${displayName.charAt(
                  0
                )}</div>`;
              }}
            />
          </div>
          <h2 className={`font-bold text-[#fff2ab] text-2xl text-center leading-tight ${data?.gameId ? 'group-hover:text-[#00a389] transition-colors duration-200' : ''}`}>
            {finalGameData.name.split(" - ")[0]}
          </h2>
        </div>

        {/* Key Metrics Cards */}
        <div className="flex gap-6 flex-1">
          <div className="bg-[#02020280] rounded-[8px] p-6 shadow-[0px_0px_4px_#00000040] flex-1 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00a389] mb-2">
                {finalGameData.avgXP.toLocaleString()}
              </div>
              <div className="text-white font-medium text-sm">Avg. XP</div>
            </div>
          </div>

          <div className="bg-[#02020280] rounded-[8px] p-6 shadow-[0px_0px_4px_#00000040] flex-1 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00a389] mb-2">
                {finalGameData.rewardConversion}%
              </div>
              <div className="text-white font-medium text-sm whitespace-pre-line">
                Reward{"\n"}Conversion
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        {/* <div className="flex gap-4">
          <button className="inline-flex h-[30px] items-center gap-1.5 px-3 py-1.5 bg-[#fff2ab33] rounded-[20px] border border-solid border-[#ffde5b]">
            <span className="font-semibold text-[#fff2ab] text-sm">
              Age &amp; Gender
            </span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
            </svg>
          </button>

          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f1f133] rounded-[20px]">
            <span className="font-medium text-white text-sm">
              Region &amp; Tier
            </span>
          </button>
        </div> */}
      </div>

      {/* Donut Charts for Demographics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <DonutChart data={finalGameData.demographics.age} title="Age" />

        <DonutChart data={finalGameData.demographics.gender} title="Gender" />

        <DonutChart data={finalGameData.demographics.region} title="Region" />

        <DonutChart data={finalGameData.demographics.tier} title="Tier" />
      </div>
    </div>
  );
});

TopPlayedGameSnapshot.displayName = "TopPlayedGameSnapshot";

export default TopPlayedGameSnapshot;
