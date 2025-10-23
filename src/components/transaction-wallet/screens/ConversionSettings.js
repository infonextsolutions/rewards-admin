"use client";

import { useState, useEffect } from "react";
import { CogIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { TRANSACTION_API } from "../../../data/transactions";
import toast from "react-hot-toast";

export default function ConversionSettings() {
  const [conversionRules, setConversionRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null);

  // Load conversion settings from API
  useEffect(() => {
    const loadConversionSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await TRANSACTION_API.getConversionSettings();

        if (response.data?.success && response.data?.data) {
          const rules = response.data.data.rules || response.data.data;
          setConversionRules(Array.isArray(rules) ? rules : []);
          setLastUpdated(new Date().toLocaleString());
        } else {
          throw new Error("Failed to load conversion settings");
        }
      } catch (error) {
        console.error("Failed to load conversion settings:", error);
        setError(
          "Unable to load conversion settings. Please check your connection and try again."
        );
        setConversionRules([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversionSettings();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TRANSACTION_API.getConversionSettings();

      if (response.data?.success && response.data?.data) {
        const rules = response.data.data.rules || response.data.data;
        setConversionRules(Array.isArray(rules) ? rules : []);
        setLastUpdated(new Date().toLocaleString());
        toast.success("Conversion settings refreshed successfully!");
      } else {
        throw new Error("Failed to refresh conversion settings");
      }
    } catch (error) {
      console.error("Failed to refresh conversion settings:", error);
      toast.error("Failed to refresh conversion settings. Please try again.");
      setError(
        "Unable to refresh conversion settings. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            XP Conversion Rules
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configuration sourced from Rewards Config Module
          </p>
        </div>

        {/* <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync with Config'}
          </button>
        </div> */}
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rule Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conversionRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {rule.xpTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-emerald-600">
                      {rule.conversionRule}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{rule.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <CogIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {rule.ruleSource}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
