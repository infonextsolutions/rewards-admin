"use client";

import { useState, useEffect } from "react";
import {
  CogIcon,
  ArrowPathIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { TRANSACTION_API } from "../../../data/transactions";
import toast from "react-hot-toast";
import apiClient from "../../../lib/apiClient";

export default function ConversionSettings() {
  const [conversionRules, setConversionRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null);

  const [defaultRule, setDefaultRule] = useState({
    coinsPerDollar: 100,
    minRedemption: 100,
    maxRedemption: 10000,
    defaultCurrency: "USD",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editFormData, setEditFormData] = useState({
    coinsPerDollar: 100,
    coinsPerUnit: 500,
    currencyAmount: 5,
  });
  const [saving, setSaving] = useState(false);

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
          setConversionRules(
            Array.isArray(data.conversionRules) ? data.conversionRules : []
          );
          setDefaultRule(
            data.defaultRule || {
              coinsPerDollar: 100,
              minRedemption: 100,
              maxRedemption: 10000,
              defaultCurrency: "USD",
            }
          );
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
        setConversionRules(
          Array.isArray(data.conversionRules) ? data.conversionRules : []
        );
        setDefaultRule(
          data.defaultRule || {
            coinsPerDollar: 100,
            minRedemption: 100,
            maxRedemption: 10000,
            defaultCurrency: "USD",
          }
        );
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

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setEditFormData({
      coinsPerDollar: rule.coinsPerDollar || 100,
      coinsPerUnit: rule.coinsPerUnit || 500,
      currencyAmount: rule.currencyAmount || 5,
    });
    setEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingRule(null);
    setEditFormData({
      coinsPerDollar: 100,
      coinsPerUnit: 500,
      currencyAmount: 5,
    });
  };

  const handleEditSave = async () => {
    if (!editingRule) return;

    // Validate form data
    if (!editFormData.coinsPerDollar || editFormData.coinsPerDollar <= 0) {
      toast.error("Coins per dollar must be a positive number");
      return;
    }
    if (!editFormData.coinsPerUnit || editFormData.coinsPerUnit <= 0) {
      toast.error("Coins per unit must be a positive number");
      return;
    }
    if (!editFormData.currencyAmount || editFormData.currencyAmount <= 0) {
      toast.error("Currency amount must be a positive number");
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.put(
        "/admin/transactions/conversion/settings",
        {
          currency: editingRule.currency,
          coinsPerDollar: parseFloat(editFormData.coinsPerDollar),
          coinsPerUnit: parseFloat(editFormData.coinsPerUnit),
          currencyAmount: parseFloat(editFormData.currencyAmount),
        }
      );

      if (response.data?.success) {
        toast.success("Conversion rate updated successfully!");
        setEditModalOpen(false);
        setEditingRule(null);
        // Reload conversion settings
        const response = await TRANSACTION_API.getConversionSettings();
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          setConversionRules(
            Array.isArray(data.conversionRules) ? data.conversionRules : []
          );
          setDefaultRule(
            data.defaultRule || {
              coinsPerDollar: 100,
              minRedemption: 100,
              maxRedemption: 10000,
              defaultCurrency: "USD",
            }
          );
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to update conversion rate"
        );
      }
    } catch (error) {
      console.error("Error updating conversion rate:", error);
      toast.error(
        error.response?.data?.message || "Failed to update conversion rate"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Coin Conversion Rules
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure coin-to-currency conversion rates and redemption limits
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
        <div className="mb-3">
          <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
            This is the default conversion rule that will be used for all
            currencies unless a custom rule is set below. If users' currency
            does not match any custom rule, this rule applies.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Coins Per Dollar</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {defaultRule.coinsPerDollar || 100}
            </div>
            <div className="text-xs text-gray-500 mt-1">100 Coins = $1</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Min Redemption</div>
            <div className="text-2xl font-semibold text-gray-900">
              {defaultRule.minRedemption || 100} Coins
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Max Redemption</div>
            <div className="text-2xl font-semibold text-gray-900">
              {defaultRule.maxRedemption || 10000} Coins
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
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rule
                  </th>
                  {/* Payment Methods column commented out */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Methods
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Source
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversionRules.map((rule, index) => (
                  <tr key={rule.currency || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {rule.currency || "N/A"} {rule.currencySymbol || ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-emerald-600">
                        {rule.conversionRule || "N/A"}
                      </div>
                    </td>
                    {/* Payment Methods column commented out */}
                    {/* <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(rule.method) ? (
                          rule.method.map((method, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {method}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-900">
                            {rule.method || "N/A"}
                          </span>
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <CogIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {rule.ruleSource || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="inline-flex items-center justify-center p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit conversion rate"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            No custom conversion rules configured.
          </p>
        </div>
      )}

      {/* Edit Conversion Rate Modal */}
      {editModalOpen && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Conversion Rate - {editingRule.currency}{" "}
                {editingRule.currencySymbol}
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coins Per Dollor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editFormData.coinsPerUnit}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        coinsPerUnit: e.target.value,
                      })
                    }
                    placeholder="500"
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of coins per Dollor
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editFormData.currencyAmount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        currencyAmount: e.target.value,
                      })
                    }
                    placeholder="5"
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dollar amount for the conversion unit
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Preview:</span>{" "}
                    {editFormData.coinsPerUnit} Coins = $
                    {editFormData.currencyAmount}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleEditCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
