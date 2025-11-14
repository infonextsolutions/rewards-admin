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

  const [defaultRule, setDefaultRule] = useState({
    xpPerRupee: 0,
    minRedemption: 0,
    maxRedemption: 0
  });

  // Load conversion settings from API
  useEffect(() => {
    const loadConversionSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await TRANSACTION_API.getConversionSettings();

        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          // API returns conversionRules array and defaultRule object
          setConversionRules(Array.isArray(data.conversionRules) ? data.conversionRules : []);
          setDefaultRule(data.defaultRule || {
            xpPerRupee: 0,
            minRedemption: 0,
            maxRedemption: 0
          });
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
          const data = response.data.data;
          setConversionRules(Array.isArray(data.conversionRules) ? data.conversionRules : []);
          setDefaultRule(data.defaultRule || {
            xpPerRupee: 0,
            minRedemption: 0,
            maxRedemption: 0
          });
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

      {/* Default Rule */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          Default Conversion Rule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">XP Per Rupee</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {defaultRule.xpPerRupee || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Min Redemption</div>
            <div className="text-2xl font-semibold text-gray-900">
              ₹{defaultRule.minRedemption || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Max Redemption</div>
            <div className="text-2xl font-semibold text-gray-900">
              ₹{defaultRule.maxRedemption || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      {conversionRules.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-md font-semibold text-gray-900">
              Custom Conversion Rules
            </h3>
          </div>
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
                {conversionRules.map((rule, index) => (
                  <tr key={rule.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {rule.xpTier || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-emerald-600">
                        {rule.conversionRule || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{rule.method || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <CogIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {rule.ruleSource || 'N/A'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">No custom conversion rules configured.</p>
        </div>
      )}
    </div>
  );
}
