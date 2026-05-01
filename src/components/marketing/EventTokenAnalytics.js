"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { eventTokensAPI } from "../../data/eventTokens";

const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "in", name: "India" },
  { code: "gb", name: "United Kingdom" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "jp", name: "Japan" },
  { code: "br", name: "Brazil" },
  { code: "cn", name: "China" },
  { code: "kr", name: "South Korea" },
  { code: "mx", name: "Mexico" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "nl", name: "Netherlands" },
  { code: "se", name: "Sweden" },
  { code: "no", name: "Norway" },
  { code: "dk", name: "Denmark" },
  { code: "fi", name: "Finland" },
  { code: "pl", name: "Poland" },
  { code: "ru", name: "Russia" },
  { code: "tr", name: "Turkey" },
  { code: "za", name: "South Africa" },
  { code: "ng", name: "Nigeria" },
  { code: "eg", name: "Egypt" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "id", name: "Indonesia" },
  { code: "th", name: "Thailand" },
  { code: "vn", name: "Vietnam" },
  { code: "ph", name: "Philippines" },
  { code: "my", name: "Malaysia" },
  { code: "sg", name: "Singapore" },
  { code: "pk", name: "Pakistan" },
  { code: "bd", name: "Bangladesh" },
  { code: "ar", name: "Argentina" },
  { code: "co", name: "Colombia" },
  { code: "cl", name: "Chile" },
  { code: "pe", name: "Peru" },
  { code: "nz", name: "New Zealand" },
];

const toRows = (report) => report?.rows || report?.result_set || [];
const num = (value) => Number(value || 0).toLocaleString();

function extractEventValue(row, eventMetric) {
  if (!eventMetric) return 0;
  return parseInt(row[eventMetric] || 0, 10);
}

function MetricCard({ label, value, subtitle, tone = "blue" }) {
  const tones = {
    blue: "border-t-4 border-blue-500 bg-blue-50/50",
    green: "border-t-4 border-green-500 bg-green-50/50",
    purple: "border-t-4 border-purple-500 bg-purple-50/50",
    yellow: "border-t-4 border-yellow-500 bg-yellow-50/50",
    indigo: "border-t-4 border-indigo-500 bg-indigo-50/50",
  };

  return (
    <div className={`${tones[tone]} p-3 sm:p-4 rounded-lg text-center`}>
      <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{value}</div>
      {subtitle && <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{subtitle}</div>}
    </div>
  );
}

function DateRangePicker({ dateRange, onChange, layout = "row" }) {
  const isStacked = layout === "stack";

  return (
    <div className={isStacked ? "flex flex-col gap-2" : "flex flex-col sm:flex-row sm:gap-2 gap-2"}>
      <input
        type="date"
        value={dateRange.startDate}
        onChange={(e) => onChange("startDate", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-sm"
      />
      {!isStacked && (
        <span className="self-center text-gray-400 text-xs hidden sm:block">to</span>
      )}
      <input
        type="date"
        value={dateRange.endDate}
        onChange={(e) => onChange("endDate", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-sm"
      />
    </div>
  );
}

function DataTable({ title, rows, columns, eventMetric }) {
  if (!rows?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6 sm:p-8 text-center text-sm text-gray-400">No data</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        <span className="text-[10px] sm:text-xs text-gray-400 ml-2 shrink-0">{rows.length} rows</span>
      </div>
      <div className="overflow-x-auto -webkit-overflow-scrolling touch">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map(([key, label]) => (
                <th key={key} className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                {columns.map(([key, , render]) => (
                  <td key={key} className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                    {render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarBar({ rows, eventMetric }) {
  const data = rows.filter((r) => extractEventValue(r, eventMetric) > 0).map((r) => ({
    date: r.day,
    value: extractEventValue(r, eventMetric),
  }));

  if (!data.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Daily Events</h3>
        </div>
        <div className="p-6 sm:p-8 text-center text-sm text-gray-400">No events recorded</div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Daily Events Timeline</h3>
        <span className="text-[10px] sm:text-xs text-gray-400 ml-2 shrink-0">{data.length} active days</span>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-end gap-0.5 sm:gap-1 h-24 sm:h-32">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div
                className="w-full bg-[#00a389] rounded-t hover:bg-[#008a73] transition-colors min-h-[2px]"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {d.date}: {d.value}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] sm:text-[10px] text-gray-400">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}

function TokenAnalyticsTab({ analytics, loading, dateRange, onDateChange, onRefresh }) {
  const [breakdownTab, setBreakdownTab] = useState("network");

  if (!analytics) {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="text-sm text-gray-500">Loading analytics...</div>
        </div>
      );
    }
    return null;
  }

  const kpiRows = toRows(analytics.analytics?.kpis?.data);
  const networkRows = toRows(analytics.analytics?.byNetwork?.data);
  const countryRows = toRows(analytics.analytics?.byCountry?.data);
  const deviceRows = toRows(analytics.analytics?.byDevice?.data);
  const sourceRows = toRows(analytics.analytics?.bySource?.data);
  const eventMetric = analytics.eventMetric;
  const totalEvents = analytics.summary?.totalEvents || 0;

  const breakdownTabs = [
    { key: "network", label: "Network" },
    { key: "country", label: "Country" },
    { key: "device", label: "Device" },
    { key: "source", label: "Source" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Token header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{analytics.eventToken?.name}</h2>
            <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
              <span className="text-xs sm:text-sm font-mono text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded truncate">{analytics.eventToken?.token}</span>
              <span className="text-[10px] sm:text-xs text-gray-400">{analytics.eventToken?.category || "—"}</span>
              {analytics.eventToken?.isS2S && (
                <span className="text-[10px] sm:text-xs bg-[#ecf8f1] text-[#00a389] px-1.5 sm:px-2 py-0.5 rounded font-medium shrink-0">S2S</span>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <DateRangePicker dateRange={dateRange} onChange={onDateChange} compact />
            <button
              onClick={onRefresh}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#00a389] rounded-md hover:bg-[#008a73] transition-colors shrink-0"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <MetricCard label="Total Events" value={num(totalEvents)} subtitle={eventMetric?.split("_events")[0] || ""} tone="purple" />
        <MetricCard
          label="Active Days"
          value={num(kpiRows.filter((r) => extractEventValue(r, eventMetric) > 0).length)}
          subtitle={`of ${kpiRows.length} days`}
          tone="blue"
        />
        <MetricCard
          label="Top Country"
          value={countryRows.length > 0 ? countryRows[0]?.country || "—" : "—"}
          subtitle={countryRows.length > 0 ? `${extractEventValue(countryRows[0], eventMetric)} events` : ""}
          tone="green"
        />
        <MetricCard
          label="Top Network"
          value={networkRows.length > 0 ? networkRows[0]?.network || "—" : "—"}
          subtitle={networkRows.length > 0 ? `${extractEventValue(networkRows[0], eventMetric)} events` : ""}
          tone="yellow"
        />
      </div>

      {/* Daily timeline */}
      <BarBar rows={kpiRows} eventMetric={eventMetric} />

      {/* Breakdown tabs - scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit min-w-full sm:min-w-0">
          {breakdownTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBreakdownTab(tab.key)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                breakdownTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown tables */}
      {breakdownTab === "network" && (
        <DataTable
          title="Events by Network & Campaign"
          rows={networkRows}
          eventMetric={eventMetric}
          columns={[
            ["network", "Network", (r) => (
              <span className="font-medium">{r.network || "Organic"}</span>
            )],
            ["campaign", "Campaign", (r) => (
              <span className="text-gray-500">{r.campaign || "unknown"}</span>
            )],
            ["day", "Date", (r) => (
              <span className="text-gray-500 font-mono text-xs">{r.day || "—"}</span>
            )],
            ["events", "Events", (r) => (
              <span className="font-semibold text-[#00a389]">{num(extractEventValue(r, eventMetric))}</span>
            )],
          ]}
        />
      )}

      {breakdownTab === "country" && (
        <DataTable
          title="Events by Country"
          rows={countryRows}
          eventMetric={eventMetric}
          columns={[
            ["country", "Country", (r) => (
              <span className="font-medium">{r.country || "—"}</span>
            )],
            ["country_code", "Code", (r) => (
              <span className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase">{r.country_code || "—"}</span>
            )],
            ["events", "Events", (r) => (
              <span className="font-semibold text-[#00a389]">{num(extractEventValue(r, eventMetric))}</span>
            )],
          ]}
        />
      )}

      {breakdownTab === "device" && (
        <DataTable
          title="Events by Device & OS"
          rows={deviceRows}
          eventMetric={eventMetric}
          columns={[
            ["country", "Country", (r) => r.country || "—"],
            ["os_name", "OS", (r) => (
              <span className="capitalize">{r.os_name || "—"}</span>
            )],
            ["device_type", "Device", (r) => (
              <span className="capitalize">{r.device_type || "—"}</span>
            )],
            ["events", "Events", (r) => (
              <span className="font-semibold text-[#00a389]">{num(extractEventValue(r, eventMetric))}</span>
            )],
          ]}
        />
      )}

      {breakdownTab === "source" && (
        <DataTable
          title="Events by Source"
          rows={sourceRows}
          eventMetric={eventMetric}
          columns={[
            ["network", "Network", (r) => (
              <span className="font-medium">{r.network || "Organic"}</span>
            )],
            ["campaign", "Campaign", (r) => (
              <span className="text-gray-500">{r.campaign || "unknown"}</span>
            )],
            ["adgroup", "Ad Group", (r) => (
              <span className="text-gray-500">{r.adgroup || "unknown"}</span>
            )],
            ["creative", "Creative", (r) => (
              <span className="text-gray-500">{r.creative || "unknown"}</span>
            )],
            ["events", "Events", (r) => (
              <span className="font-semibold text-[#00a389]">{num(extractEventValue(r, eventMetric))}</span>
            )],
          ]}
        />
      )}
    </div>
  );
}

function TokenSelectorDropdown({ tokens, selectedToken, searchTerm, onSearch, onSelect, loading, showTokenList, onToggleList }) {
  const filtered = useMemo(
    () =>
      tokens.filter(
        (token) =>
          token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [tokens, searchTerm]
  );

  return (
    <div className="relative">
      <button
        onClick={onToggleList}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 transition-colors"
      >
        {selectedToken ? (
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{selectedToken.name}</div>
            <div className="text-xs text-gray-500 truncate">{selectedToken.token}</div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select a token...</span>
        )}
        <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
      </button>

      {showTokenList && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-7 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00a389]"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSearch(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No tokens found</div>
            ) : (
              filtered.map((token) => (
                <button
                  key={token._id || token.id || token.token}
                  onClick={() => onSelect(token)}
                  className={`w-full text-left px-3 py-2 border-b border-gray-50 last:border-b-0 transition-colors ${
                    selectedToken?.token === token.token
                      ? "bg-[#ecf8f1] text-[#00a389]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="text-xs font-medium truncate">{token.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {token.token} · {token.category || "other"} · {token.isS2S ? "S2S" : "SDK"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventTokenAnalytics() {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [callbacks, setCallbacks] = useState([]);
  const [callbacksPagination, setCallbacksPagination] = useState({});
  const [callbacksNote, setCallbacksNote] = useState("");
  const [fullAnalysis, setFullAnalysis] = useState(null);
  const [selectedClickDetails, setSelectedClickDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [callbacksLoading, setCallbacksLoading] = useState(false);
  const [fullAnalysisLoading, setFullAnalysisLoading] = useState(false);
  const [clickDetailsLoading, setClickDetailsLoading] = useState(false);
  const [showClickModal, setShowClickModal] = useState(false);

  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [networkFilter, setNetworkFilter] = useState("");
  const [callbacksPage, setCallbacksPage] = useState(1);
  const [breakdownView, setBreakdownView] = useState("network");
  const [showTokenList, setShowTokenList] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showTokenList && !e.target.closest("[data-token-selector]")) {
        setShowTokenList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTokenList]);

  const availableNetworks = useMemo(() => {
    const set = new Set();
    for (const row of callbacks || []) {
      const network = row.source?.network;
      if (network) set.add(network);
    }
    return Array.from(set).sort();
  }, [callbacks]);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await eventTokensAPI.getEventTokens({});
      setTokens(response.data || []);
    } catch (error) {
      toast.error("Failed to load event tokens");
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (token = selectedToken?.token) => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const response = await eventTokensAPI.getTokenAnalytics(token, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: "complete",
      });
      setAnalytics(response.data || null);
    } catch (error) {
      toast.error("Failed to load token analytics");
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCallbacks = async (page = 1) => {
    setCallbacksLoading(true);
    try {
      const response = await eventTokensAPI.getCallbacks({
        page,
        limit: 50,
        country: countryFilter,
        network: networkFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setCallbacks(response.data || []);
      setCallbacksPagination(response.pagination || {});
      setCallbacksNote(response.note || "");
      setCallbacksPage(page);
    } catch (error) {
      toast.error("Failed to load Adjust tracking rows");
      console.error("Error fetching callbacks:", error);
    } finally {
      setCallbacksLoading(false);
    }
  };

  const fetchFullAnalysis = async () => {
    setFullAnalysisLoading(true);
    try {
      const response = await eventTokensAPI.getAnalyticsOverview({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        country: countryFilter,
        eventToken: selectedToken?.token,
        network: networkFilter,
      });
      setFullAnalysis(response.data || null);
    } catch (error) {
      toast.error("Failed to load Adjust analysis");
      console.error("Error fetching full analysis:", error);
    } finally {
      setFullAnalysisLoading(false);
    }
  };

  const fetchClickDetails = async (clickId) => {
    setClickDetailsLoading(true);
    setShowClickModal(true);
    setSelectedClickDetails(null);
    try {
      const response = await eventTokensAPI.getClickDetails(clickId);
      setSelectedClickDetails(response.data || null);
    } catch (error) {
      toast.error("Failed to load row details");
      console.error("Error fetching click details:", error);
    } finally {
      setClickDetailsLoading(false);
    }
  };

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setShowTokenList(false);
    setAnalytics(null);
    fetchAnalytics(token.token);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Adjust Event Analytics</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Track event tokens, acquisition source, country, campaign, clicks, installs, events, revenue, and raw Adjust rows.
        </p>
      </div>

      {/* Tabs - scrollable on mobile */}
      <div className="border-b border-gray-200 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max">
          {[
            ["analytics", "Token Analytics", ChartBarIcon],
            ["clickTracking", "Tracking Rows", CursorArrowRaysIcon],
            ["fullAnalysis", "Full Analysis", ChartBarIcon],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                if (key === "clickTracking") fetchCallbacks(1);
                if (key === "fullAnalysis") fetchFullAnalysis();
              }}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === key
                  ? "border-[#00a389] text-[#00a389]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "analytics" && (
        <div>
          {/* Mobile: Token selector dropdown at top */}
          <div className="lg:hidden mb-4" data-token-selector>
            <TokenSelectorDropdown
              tokens={tokens}
              selectedToken={selectedToken}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              onSelect={handleTokenSelect}
              loading={loading}
              showTokenList={showTokenList}
              onToggleList={() => setShowTokenList(!showTokenList)}
            />
            <div className="mt-3">
              <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} layout="stack" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Token</h2>
                <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} layout="stack" />
                <div className="relative mt-4 mb-4">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, token, category..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
                  />
                </div>
                {loading ? (
                  <div className="text-center py-8 text-sm text-gray-600">Loading tokens...</div>
                ) : (
                  <div className="space-y-2 max-h-[34rem] overflow-y-auto">
                    {tokens
                      .filter(
                        (token) =>
                          token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          token.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          token.category?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((token) => (
                        <button
                          key={token._id || token.id || token.token}
                          type="button"
                          onClick={() => handleTokenSelect(token)}
                          className={`w-full text-left p-3 rounded-md border transition-colors ${
                            selectedToken?.token === token.token
                              ? "bg-[#00a389] text-white border-[#00a389]"
                              : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="font-medium text-sm truncate">{token.name}</div>
                          <div className={`text-xs mt-1 truncate ${selectedToken?.token === token.token ? "text-white/80" : "text-gray-500"}`}>
                            {token.token}
                          </div>
                          <div className={`text-xs mt-1 truncate ${selectedToken?.token === token.token ? "text-white/80" : "text-gray-500"}`}>
                            {token.category || "other"} | {token.isS2S ? "S2S" : "SDK"} | {token.environment || "production"}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content area */}
            <div className="lg:col-span-2">
              {!selectedToken ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                  <ChartBarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a Token</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Choose an Adjust event token to view its report data.</p>
                </div>
              ) : (
                <TokenAnalyticsTab
                  analytics={analytics}
                  loading={analyticsLoading}
                  dateRange={dateRange}
                  onDateChange={handleDateRangeChange}
                  onRefresh={() => fetchAnalytics()}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "clickTracking" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
                >
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchCallbacks(1)}
                  disabled={callbacksLoading}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#00a389] rounded-md hover:bg-[#008a73] disabled:opacity-50 transition-colors"
                >
                  {callbacksLoading ? "Loading..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Network</label>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full sm:max-w-md px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
            >
              <option value="">All Networks</option>
              {availableNetworks.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Individual Click & Event Tracking</h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Each row represents a single user action (click, install, event, etc.) 
                        with full attribution details including network, campaign, country, device info, and revenue data.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Click any row to view full details
                        </span>
                       
                      </div>
                    </div>
                    
                  </div>
                  {/* {callbacksNote && (
                    <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
                      {callbacksNote}
                    </div>
                  )} */}
                  {!callbacks?.length && (
                    <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-700 font-medium mb-1">📋 How to enable tracking data:</p>
                      <ol className="text-xs text-blue-600 list-decimal list-inside space-y-0.5">
                        <li>Go to <strong>Adjust Dashboard</strong> → <strong>Settings</strong> → <strong>Raw Data Exports</strong></li>
                        <li>Add a new <strong>Server Callback</strong> with URL: <code className="bg-blue-100 px-1 rounded text-[10px]">https://your-domain.com/api/webhooks/adjust/callback</code></li>
                        <li>Select activities to track: <strong>Clicks, Installs, Events, Sessions</strong></li>
                        <li>Save and wait 5-10 minutes for data to appear here</li>
                      </ol>
                    </div>
                  )}
                </div>
             {callbacksLoading ? (
               <div className="p-6 sm:p-8 text-center text-xs sm:text-sm text-gray-600">Loading...</div>
             ) : !callbacks?.length ? (
               <div className="p-6 sm:p-8 text-center">
                 <CursorArrowRaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                 <p className="text-sm font-medium text-gray-900">No tracking data available</p>
                 <p className="mt-1 text-xs text-gray-500">Configure Raw Data Exports in Adjust Dashboard → Settings → Raw Data Exports to receive per-user click data.</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-[#ecf8f1]">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 16h12M4 8h16" />
                            </svg>
                            Click ID / Identifier
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Status
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Date/Time
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-8 5.636l-1.711-1.71A1 1 0 0112 14.566l-4.243 4.243a1 1 0 01-1.414-1.414l4.243-4.243a1 1 0 011.414 0l1.71 1.711" />
                            </svg>
                            Network
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Campaign</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Country</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.237M5.136 7.964l-2.285 1.793A1 1 0 003.469 9.96l2.853 2.853A1 1 0 007.96 12.469l2.853-2.853a1 1 0 00.227-1.397L9.373 5.124M7.188 2.239z" />
                            </svg>
                            Clicks
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Installs
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Events
                          </div>
                        </th>
                         <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Revenue
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ad Spend
                          </div>
                        </th>
                       </tr>
                    </thead>
                   <tbody className="divide-y divide-gray-200">
                     {callbacks.map((row, index) => {
                       const statusColors = {
                         'Installed': 'bg-green-100 text-green-800',
                         'Clicked': 'bg-blue-100 text-blue-800',
                         'No install': 'bg-gray-100 text-gray-600',
                         'Rejected': 'bg-red-100 text-red-800',
                         'Event': 'bg-purple-100 text-purple-800'
                       };
                       const statusColor = statusColors[row.installStatus] || 'bg-gray-100 text-gray-600';
                       return (
                         <tr key={index} className="hover:bg-gray-50">
                           <td
                             className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#00a389] whitespace-nowrap font-mono max-w-[120px] truncate cursor-pointer hover:underline text-center"
                             title={`Click: ${row.clickId}`}
                             onClick={() => fetchClickDetails(row.clickId)}
                           >
                             {row.clickId || 'N/A'}
                           </td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap text-center">
                             <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusColor}`}>
                               {row.installStatus || 'Unknown'}
                             </span>
                           </td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{row.timestamp ? new Date(row.timestamp).toLocaleDateString() : "N/A"}</td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{row.source?.network || "Organic"}</td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap text-center">{row.source?.campaign || "N/A"}</td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap font-mono uppercase text-center">{row.country || "N/A"}</td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.clicks)}</td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.installs)}</td>
                           <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.events)}</td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">${Number(row.revenue || 0).toFixed(2)}</td>
                          </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
            {callbacksPagination.totalPages > 1 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex items-center justify-between text-xs sm:text-sm">
                <span>Page {callbacksPage} of {callbacksPagination.totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={callbacksPage <= 1}
                    onClick={() => fetchCallbacks(callbacksPage - 1)}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={callbacksPage >= callbacksPagination.totalPages}
                    onClick={() => fetchCallbacks(callbacksPage + 1)}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "fullAnalysis" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
                >
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchFullAnalysis()}
                  disabled={fullAnalysisLoading}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#00a389] rounded-md hover:bg-[#008a73] disabled:opacity-50 transition-colors"
                >
                  {fullAnalysisLoading ? "Loading..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Network</label>
            <select
              value={networkFilter}
              onChange={(e) => { setNetworkFilter(e.target.value); fetchFullAnalysis(); }}
              className="w-full sm:max-w-md px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] text-xs sm:text-sm"
            >
              <option value="">All Networks</option>
              {(fullAnalysis?.byNetwork || [])
                .map((r) => r.network)
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .sort()
                .map((n) => (
                  <option key={n} value={n}>{n || "Organic"}</option>
                ))}
            </select>
          </div>
          {fullAnalysisLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center text-xs sm:text-sm text-gray-600">
              Loading full analysis...
            </div>
          ) : fullAnalysis ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                <MetricCard label="Clicks" value={num(fullAnalysis.summary?.totalClicks)} />
                <MetricCard label="Installs" value={num(fullAnalysis.summary?.totalInstalls)} tone="green" />
                <MetricCard label="Events" value={num(fullAnalysis.summary?.totalEvents)} tone="purple" />
                <MetricCard label="Revenue" value={`$${Number(fullAnalysis.summary?.totalRevenue || 0).toFixed(2)}`} tone="yellow" />
                <MetricCard label="Impressions" value={num(fullAnalysis.summary?.totalImpressions)} tone="indigo" className="hidden sm:block" />
              </div>
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setBreakdownView("network")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    breakdownView === "network"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Network
                </button>
                <button
                  onClick={() => setBreakdownView("country")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    breakdownView === "country"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Country
                </button>
              </div>

              {breakdownView === "network" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Network Breakdown</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Aggregated performance metrics by network and campaign.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#ecf8f1]">
                        <tr>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Network</th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Campaign</th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Clicks</th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Installs</th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Events</th>
                           <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Revenue</th>
                           <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Impressions</th>
                           <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Avg DAU</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200">
                         {(fullAnalysis.byNetwork || []).map((row, i) => (
                           <tr key={i} className="hover:bg-gray-50">
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{row.network || "Organic"}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{row.campaign || "N/A"}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.clicks)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.installs)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.events)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">${Number(row.revenue || 0).toFixed(2)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.impressions)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{row.daus != null ? parseFloat(row.daus || 0).toFixed(2) : "0.00"}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {breakdownView === "country" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Country Breakdown</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Aggregated performance metrics by country.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#ecf8f1]">
                        <tr>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Country</th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Installs</th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Events</th>
                           <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Revenue</th>
                           <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Impressions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200">
                         {(fullAnalysis.byCountry || []).map((row, i) => (
                           <tr key={i} className="hover:bg-gray-50">
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center font-mono uppercase">{row.country || "—"}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.installs)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.events)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">${Number(row.revenue || 0).toFixed(2)}</td>
                             <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap text-center">{num(row.impressions)}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center text-xs sm:text-sm text-gray-500">
              Apply filters to load complete Adjust analysis.
            </div>
          )}
        </div>
      )}

      {showClickModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Click Tracking Details</h2>
                <button onClick={() => { setShowClickModal(false); setSelectedClickDetails(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {clickDetailsLoading ? (
                <div className="p-8 sm:p-12 text-center text-xs sm:text-sm text-gray-600">Loading details...</div>
              ) : selectedClickDetails ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-gray-500">Clicks</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">{num(selectedClickDetails.summary?.totalClicks)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-gray-500">Installs</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">{num(selectedClickDetails.summary?.totalInstalls)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-gray-500">Events</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">{num(selectedClickDetails.summary?.totalEvents)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-gray-500">Revenue</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">${Number(selectedClickDetails.summary?.totalRevenue || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  {selectedClickDetails.reportingRevenue != null && selectedClickDetails.reportingRevenue > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
                      <span className="text-[10px] sm:text-xs text-blue-600">Dashboard Reporting Revenue:</span>
                      <span className="ml-2 text-base sm:text-lg font-bold text-blue-900">${Number(selectedClickDetails.reportingRevenue).toFixed(2)}</span>
                    </div>
                  )}

                  {selectedClickDetails.attributionInfo && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Attribution Info</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div><span className="text-gray-500">Network:</span> <span className="font-medium">{selectedClickDetails.attributionInfo.network || "N/A"}</span></div>
                        <div><span className="text-gray-500">Campaign:</span> <span className="font-medium">{selectedClickDetails.attributionInfo.campaign || "N/A"}</span></div>
                        <div><span className="text-gray-500">Ad Group:</span> <span className="font-medium">{selectedClickDetails.attributionInfo.adgroup || "N/A"}</span></div>
                        <div><span className="text-gray-500">Creative:</span> <span className="font-medium">{selectedClickDetails.attributionInfo.creative || "N/A"}</span></div>
                        <div><span className="text-gray-500">Tracker Token:</span> <span className="font-mono">{selectedClickDetails.attributionInfo.trackerToken || "N/A"}</span></div>
                        <div><span className="text-gray-500">Tracker Name:</span> <span className="font-medium">{selectedClickDetails.attributionInfo.trackerName || "N/A"}</span></div>
                        {selectedClickDetails.attributionInfo.matchType && (
                          <div className="col-span-2"><span className="text-gray-500">Match Type:</span> <span className="font-medium capitalize">{selectedClickDetails.attributionInfo.matchType}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedClickDetails.deviceInfo && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Device Info</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div><span className="text-gray-500">Platform:</span> <span className="font-medium capitalize">{selectedClickDetails.deviceInfo.platform || "N/A"}</span></div>
                        <div><span className="text-gray-500">OS:</span> <span className="font-medium">{selectedClickDetails.deviceInfo.osName || "N/A"}</span></div>
                        <div><span className="text-gray-500">Device:</span> <span className="font-medium">{selectedClickDetails.deviceInfo.deviceType || "N/A"}</span></div>
                        <div><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedClickDetails.deviceInfo.deviceName || "N/A"}</span></div>
                        <div><span className="text-gray-500">Manufacturer:</span> <span className="font-medium">{selectedClickDetails.deviceInfo.deviceManufacturer || "N/A"}</span></div>
                        <div><span className="text-gray-500">App Version:</span> <span className="font-medium">{selectedClickDetails.deviceInfo.appVersion || "N/A"}</span></div>
                        <div><span className="text-gray-500">Store:</span> <span className="font-medium">{selectedClickDetails.deviceInfo.store || "N/A"}</span></div>
                        {selectedClickDetails.deviceInfo.attStatus != null && (
                          <div><span className="text-gray-500">ATT Status:</span> <span className="font-medium">{["Denied", "Not Asked", "Authorized", "Restricted"][selectedClickDetails.deviceInfo.attStatus] || "Unknown"}</span></div>
                        )}
                        {selectedClickDetails.deviceInfo.nonce && (
                          <div className="col-span-2"><span className="text-gray-500">SKAd Nonce:</span> <span className="font-mono text-xs">{selectedClickDetails.deviceInfo.nonce}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedClickDetails.publisherParameter && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Publisher Parameters</h3>
                      <div className="font-mono text-xs text-gray-700 break-all">{selectedClickDetails.publisherParameter}</div>
                    </div>
                  )}

                  {selectedClickDetails.locationInfo && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
                      <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm text-center">
                        <div><span className="text-gray-500">Country:</span> <span className="font-medium uppercase">{selectedClickDetails.locationInfo.country || "N/A"}</span></div>
                        <div><span className="text-gray-500">Region:</span> <span className="font-medium">{selectedClickDetails.locationInfo.region || "N/A"}</span></div>
                        <div><span className="text-gray-500">City:</span> <span className="font-medium">{selectedClickDetails.locationInfo.city || "N/A"}</span></div>
                      </div>
                    </div>
                  )}

                  {selectedClickDetails.installStatus && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xs sm:text-sm text-gray-500">Install Status:</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedClickDetails.installStatus === 'Installed' ? 'bg-green-100 text-green-800' :
                          selectedClickDetails.installStatus === 'Clicked' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedClickDetails.installStatus}
                        </span>
                        {selectedClickDetails.timestamp && (
                          <span className="text-xs text-gray-500 ml-auto">{new Date(selectedClickDetails.timestamp).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedClickDetails.timeline && selectedClickDetails.timeline.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline ({selectedClickDetails.timeline.length} records)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Status</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Network</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Campaign</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Country</th>
                              <th className="px-3 py-2 text-right font-semibold text-gray-600">Events</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedClickDetails.timeline.map((t, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-900">{t.timestamp || t.date || "N/A"}</td>
                                <td className="px-3 py-2">{t.installStatus || "N/A"}</td>
                                <td className="px-3 py-2">{t.source?.network || "N/A"}</td>
                                <td className="px-3 py-2">{t.source?.campaign || "N/A"}</td>
                                <td className="px-3 py-2 uppercase">{t.country || "N/A"}</td>
                                <td className="px-3 py-2 text-right">{num(t.events)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-gray-400">
                    Source: {selectedClickDetails.source || "N/A"}
                  </div>
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center">
                  <XMarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-900">No details found</p>
                  <p className="mt-1 text-xs text-gray-500">No stored Adjust webhook data found for this Click ID.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
