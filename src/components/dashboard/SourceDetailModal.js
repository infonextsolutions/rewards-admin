"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import apiClient from "../../lib/apiClient";

const COUNTRY_LIST = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "IN", name: "India" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "BG", name: "Bulgaria" },
  { code: "GR", name: "Greece" },
  { code: "HR", name: "Croatia" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },
  { code: "CY", name: "Cyprus" },
  { code: "MT", name: "Malta" },
  { code: "LU", name: "Luxembourg" },
  { code: "IS", name: "Iceland" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "EC", name: "Ecuador" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "IL", name: "Israel" },
  { code: "TR", name: "Turkey" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "CN", name: "China" },
  { code: "TW", name: "Taiwan" },
  { code: "HK", name: "Hong Kong" },
  { code: "MO", name: "Macau" },
];

const SourceDetailModal = ({ source, dateRange, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [availableCountries, setAvailableCountries] = useState([]);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange && dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange && dateRange.endDate) params.append("endDate", dateRange.endDate);
      if (selectedCountry && selectedCountry !== "all") params.append("country", selectedCountry);
      const queryString = params.toString();
      const url = "/admin/dashboard/attribution/" + encodeURIComponent(source) + "/details" + (queryString ? "?" + queryString : "");
      const response = await apiClient.get(url);
      if (response.data && response.data.success) {
        const data = response.data.data;
        setDetails(data);
        if (data.countries && data.countries.length > 0) {
          const countries = data.countries.map((c) => {
            const known = COUNTRY_LIST.find((x) => x.code === c.code);
            return { code: c.code, name: known ? known.name : c.code };
          });
          setAvailableCountries(countries);
        }
      }
    } catch (error) {
      console.error("Error fetching source details:", error);
    } finally {
      setLoading(false);
    }
  }, [source, dateRange, selectedCountry]);

  useEffect(() => {
    if (source) fetchDetails();
  }, [source, fetchDetails]);

  const filteredData = useMemo(() => {
    if (!details) return null;

    const s = details.summary || {};
    const totalInstalls = details.campaigns ? details.campaigns.reduce((sum, c) => sum + (c.installs || 0), 0) : 0;
    const totalRevenue = details.campaigns ? details.campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) : 0;
    const totalCost = details.campaigns ? details.campaigns.reduce((sum, c) => sum + (c.cost || 0), 0) : 0;

    return {
      ...details,
      summary: {
        ...s,
        totalInstalls,
        totalRevenue,
        totalCost,
        totalCampaigns: details.campaigns ? details.campaigns.length : 0,
        totalCountries: details.countries ? details.countries.length : 1,
        topCampaign: details.campaigns && details.campaigns.length > 0 ? details.campaigns.reduce((prev, curr) => (curr.installs > prev.installs ? curr : prev)) : null,
        topCountry: details.countries && details.countries.length > 0 ? details.countries.reduce((prev, curr) => (curr.installs > prev.installs ? curr : prev)) : null,
      },
    };
  }, [details]);

  if (!source) return null;

  const formatCurrency = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value || 0);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  const getTabClass = (tabId) => {
    const base = "px-4 py-3 text-sm font-medium border-b-2 transition-colors";
    if (activeTab === tabId) {
      return base + " border-blue-600 text-blue-600";
    }
    return base + " border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
  };

  const getCountryName = (code) => {
    const found = COUNTRY_LIST.find((c) => c.code === code);
    return found ? found.name : code;
  };

  const renderSummaryCards = () => {
    if (!filteredData || !filteredData.summary) return null;
    const s = filteredData.summary;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 border-b border-gray-200">
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Installs</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatNumber(s.totalInstalls)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(s.totalRevenue)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cost</p>
          <p className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(s.totalCost)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">ROAS</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{s.totalCost > 0 ? (s.totalRevenue / s.totalCost).toFixed(2) + "x" : "0.00x"}</p>
        </div>
      </div>
    );
  };

  const renderCampaignsTab = () => {
    if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!filteredData || !filteredData.campaigns || filteredData.campaigns.length === 0) {
      return <div className="flex items-center justify-center py-12"><p className="text-gray-500">No campaign data available</p></div>;
    }

    const campaigns = [...filteredData.campaigns].sort((a, b) => (b.installs || 0) - (a.installs || 0));
    const maxInstalls = Math.max(...campaigns.map((c) => c.installs || 0));

    return (
      <div>
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Campaign Breakdown by Installs</h4>
          <div className="space-y-2">
            {campaigns.map((c, i) => {
              const width = maxInstalls > 0 ? ((c.installs || 0) / maxInstalls) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-40 truncate" title={c.name}>{c.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: Math.max(width, 8) + "%" }}
                    >
                      <span className="text-xs text-white font-medium">{formatNumber(c.installs)}</span>
                    </div>
                  </div>
                  {/* <span className="text-sm text-gray-600 w-24 text-right">{formatCurrency(c.revenue)}</span>
                  <span className="text-sm text-gray-600 w-24 text-right">{formatCurrency(c.cost)}</span>
                  <span className="text-sm font-medium text-blue-600 w-16 text-right">{c.roas && c.roas !== '∞' ? parseFloat(c.roas).toFixed(2) + "x" : c.roas === '∞' ? '∞' : "N/A"}</span> */}
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-600">Campaign</th>
                <th className="text-right p-3 font-medium text-gray-600">Installs</th>
                <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                <th className="text-right p-3 font-medium text-gray-600">Cost</th>
                <th className="text-right p-3 font-medium text-gray-600">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{c.name}</td>
                  <td className="p-3 text-right text-gray-900">{formatNumber(c.installs)}</td>
                  <td className="p-3 text-right text-green-600 font-medium">{formatCurrency(c.revenue)}</td>
                  <td className="p-3 text-right text-orange-600 font-medium">{formatCurrency(c.cost)}</td>
                  <td className="p-3 text-right text-blue-600 font-medium">{c.roas && c.roas !== '∞' ? parseFloat(c.roas).toFixed(2) + "x" : c.roas === '∞' ? '∞' : "N/A"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="p-3 font-semibold text-gray-900">Total</td>
                <td className="p-3 text-right font-semibold text-gray-900">{formatNumber(filteredData.summary.totalInstalls)}</td>
                <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(filteredData.summary.totalRevenue)}</td>
                <td className="p-3 text-right font-semibold text-orange-600">{formatCurrency(filteredData.summary.totalCost)}</td>
                <td className="p-3 text-right font-semibold text-blue-600">{filteredData.summary.totalCost > 0 ? (filteredData.summary.totalRevenue / filteredData.summary.totalCost).toFixed(2) + "x" : "0.00x"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderCountriesTab = () => {
    if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!filteredData || !filteredData.countries || filteredData.countries.length === 0) {
      return <div className="flex items-center justify-center py-12"><p className="text-gray-500">No country data available</p></div>;
    }

    const countries = [...filteredData.countries].sort((a, b) => (b.installs || 0) - (a.installs || 0));
    const maxInstalls = Math.max(...countries.map((c) => c.installs || 0));

    return (
      <div>
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Countries by Installs</h4>
          <div className="space-y-2">
            {countries.map((c, i) => {
              const width = maxInstalls > 0 ? ((c.installs || 0) / maxInstalls) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{i + 1}</span>
                  <span className="text-sm text-gray-600 w-16 font-mono">{c.code}</span>
                  <span className="text-sm text-gray-700 w-32 truncate" title={getCountryName(c.code)}>{getCountryName(c.code)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: Math.max(width, 8) + "%" }}
                    >
                      <span className="text-xs text-white font-medium">{formatNumber(c.installs)}</span>
                    </div>
                  </div>
                  {/* <span className="text-sm text-gray-600 w-24 text-right">{formatCurrency(c.revenue)}</span>
                  <span className="text-sm text-gray-600 w-24 text-right">{formatCurrency(c.cost)}</span> */}
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-600">Rank</th>
                <th className="text-left p-3 font-medium text-gray-600">Code</th>
                <th className="text-left p-3 font-medium text-gray-600">Country</th>
                <th className="text-right p-3 font-medium text-gray-600">Installs</th>
                <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                <th className="text-right p-3 font-medium text-gray-600">Cost</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3 font-mono text-sm text-gray-600">{c.code}</td>
                  <td className="p-3 font-medium text-gray-900">{getCountryName(c.code)}</td>
                  <td className="p-3 text-right text-gray-900">{formatNumber(c.installs)}</td>
                  <td className="p-3 text-right text-green-600 font-medium">{formatCurrency(c.revenue)}</td>
                  <td className="p-3 text-right text-orange-600 font-medium">{formatCurrency(c.cost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="p-3" colSpan={3}></td>
                <td className="p-3 text-right font-semibold text-gray-900">{formatNumber(filteredData.summary.totalInstalls)}</td>
                <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(filteredData.summary.totalRevenue)}</td>
                <td className="p-3 text-right font-semibold text-orange-600">{formatCurrency(filteredData.summary.totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderTrendTab = () => {
    if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!filteredData || !filteredData.dailyTrend || filteredData.dailyTrend.length === 0) {
      return <div className="flex items-center justify-center py-12"><p className="text-gray-500">No daily trend data available</p></div>;
    }

    const trend = [...filteredData.dailyTrend].sort((a, b) => new Date(a.date) - new Date(b.date));
    const maxInstalls = Math.max(...trend.map((d) => d.installs || 0));
    const totalInstalls = trend.reduce((s, d) => s + (d.installs || 0), 0);
    const totalRevenue = trend.reduce((s, d) => s + (d.revenue || 0), 0);
    const totalCost = trend.reduce((s, d) => s + (d.cost || 0), 0);

    return (
      <div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 uppercase tracking-wide">Avg Daily Installs</p>
            <p className="text-lg font-bold text-blue-700 mt-1">{formatNumber(totalInstalls / trend.length)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 uppercase tracking-wide">Avg Daily Revenue</p>
            <p className="text-lg font-bold text-green-700 mt-1">{formatCurrency(totalRevenue / trend.length)}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-orange-600 uppercase tracking-wide">Avg Daily Cost</p>
            <p className="text-lg font-bold text-orange-700 mt-1">{formatCurrency(totalCost / trend.length)}</p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Daily Installs</h4>
          <div className="flex items-end gap-1 h-40 border-b border-gray-200 pb-2">
            {trend.map((d, i) => {
              const height = maxInstalls > 0 ? ((d.installs || 0) / maxInstalls) * 100 : 0;
              const day = d.date ? new Date(d.date).getDate() : "";
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex justify-center mb-1">
                    <div
                      className="w-full max-w-[20px] bg-blue-500 rounded-t group-hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: Math.max((height / 100) * 140, 4) + "px" }}
                      title={d.date + ": " + formatNumber(d.installs) + " installs, " + formatCurrency(d.revenue) + " revenue"}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      {formatNumber(d.installs)} installs
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{trend[0] && trend[0].date}</span>
            <span>{trend[trend.length - 1] && trend[trend.length - 1].date}</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-600">Date</th>
                <th className="text-right p-3 font-medium text-gray-600">Installs</th>
                <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                <th className="text-right p-3 font-medium text-gray-600">Cost</th>
                <th className="text-right p-3 font-medium text-gray-600">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((d, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{d.date}</td>
                  <td className="p-3 text-right text-gray-900">{formatNumber(d.installs)}</td>
                  <td className="p-3 text-right text-green-600 font-medium">{formatCurrency(d.revenue)}</td>
                  <td className="p-3 text-right text-orange-600 font-medium">{formatCurrency(d.cost)}</td>
                  <td className="p-3 text-right text-blue-600 font-medium">{d.cost > 0 ? (parseFloat(d.revenue || 0) / parseFloat(d.cost || 0)).toFixed(2) + "x" : "0.00x"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "campaigns":
        return renderCampaignsTab();
      case "countries":
        return renderCountriesTab();
      case "trend":
        return renderTrendTab();
      default:
        return renderCampaignsTab();
    }
  };

  const countryLabel = selectedCountry === "all" ? "All Countries" : getCountryName(selectedCountry);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{source} Performance</h2>
            <p className="text-sm text-gray-500 mt-1">
              {details && details.dateRange ? details.dateRange.start + " to " + details.dateRange.end : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {availableCountries.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Country:</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Countries</option>
                  {availableCountries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {renderSummaryCards()}

        <div className="flex border-b border-gray-200 px-6 flex-shrink-0">
          <button onClick={() => setActiveTab("campaigns")} className={getTabClass("campaigns")}>
            Campaigns
          </button>
          <button onClick={() => setActiveTab("countries")} className={getTabClass("countries")}>
            Countries
          </button>
          <button onClick={() => setActiveTab("trend")} className={getTabClass("trend")}>
            Daily Trend
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "50vh" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SourceDetailModal;
