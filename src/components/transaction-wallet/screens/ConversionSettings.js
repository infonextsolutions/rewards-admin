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
    minRedemption: 20,
    maxRedemption: 10000,
    defaultCurrency: "USD",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editFormData, setEditFormData] = useState({
    coinsPerUnit: 500,
    currencyAmount: 5,
  });
  const [saving, setSaving] = useState(false);
  const [redemptionForm, setRedemptionForm] = useState({
    minRedemption: 20,
    maxRedemption: 10000,
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
          setConversionRules(
            Array.isArray(data.conversionRules) ? data.conversionRules : []
          );
          setDefaultRule(
            data.defaultRule || {
              coinsPerDollar: 100,
              minRedemption: 20,
              maxRedemption: 10000,
              defaultCurrency: "USD",
            }
          );
          setRedemptionForm({
            minRedemption: data.defaultRule?.minRedemption || 20,
            maxRedemption: data.defaultRule?.maxRedemption || 10000,
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
        setConversionRules(
          Array.isArray(data.conversionRules) ? data.conversionRules : []
        );
        setDefaultRule(
          data.defaultRule || {
            coinsPerDollar: 100,
            minRedemption: 20,
            maxRedemption: 10000,
            defaultCurrency: "USD",
          }
        );
        setRedemptionForm({
          minRedemption: data.defaultRule?.minRedemption || 20,
          maxRedemption: data.defaultRule?.maxRedemption || 10000,
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

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setEditFormData({
      coinsPerUnit: rule.coinsPerUnit || 500,
      currencyAmount: rule.currencyAmount || 5,
    });
    setEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingRule(null);
    setEditFormData({
      coinsPerUnit: 500,
      currencyAmount: 5,
    });
  };

  const handleEditSave = async () => {
    if (!editingRule) return;

    // Validate form data
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
              minRedemption: 20,
              maxRedemption: 10000,
              defaultCurrency: "USD",
            }
          );
          setRedemptionForm({
            minRedemption: data.defaultRule?.minRedemption || 20,
            maxRedemption: data.defaultRule?.maxRedemption || 10000,
          });
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

  const handleSaveRedemption = async () => {
    if (!redemptionForm.minRedemption || redemptionForm.minRedemption <= 0) {
      toast.error("Min redemption must be a positive number");
      return;
    }
    if (!redemptionForm.maxRedemption || redemptionForm.maxRedemption <= 0) {
      toast.error("Max redemption must be a positive number");
      return;
    }
    if (Number(redemptionForm.minRedemption) >= Number(redemptionForm.maxRedemption)) {
      toast.error("Min redemption must be less than max redemption");
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.put(
        "/admin/transactions/conversion/settings",
        {
          currency: "USD",
          minRedemption: parseFloat(redemptionForm.minRedemption),
          maxRedemption: parseFloat(redemptionForm.maxRedemption),
        }
      );

      if (response.data?.success) {
        toast.success("Redemption limits updated successfully!");
        const reloadResponse = await TRANSACTION_API.getConversionSettings();
        if (reloadResponse.data?.success && reloadResponse.data?.data) {
          const data = reloadResponse.data.data;
          setDefaultRule(
            data.defaultRule || {
              coinsPerDollar: 100,
              minRedemption: 20,
              maxRedemption: 10000,
              defaultCurrency: "USD",
            }
          );
          setRedemptionForm({
            minRedemption: data.defaultRule?.minRedemption || 20,
            maxRedemption: data.defaultRule?.maxRedemption || 10000,
          });
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to update redemption limits"
        );
      }
    } catch (error) {
      console.error("Error updating redemption limits:", error);
      toast.error(
        error.response?.data?.message || "Failed to update redemption limits"
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
            currencies unless a custom rule is set below. If users&apos; currency
            does not match any custom rule, this rule applies.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Coins Per Dollar</div>
            <div className="text-2xl font-bold text-emerald-600">
              {defaultRule.coinsPerDollar || 100}
            </div>
            <div className="text-xs text-gray-400 mt-1">{defaultRule.coinsPerDollar || 100} Coins = $1</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm font-medium text-gray-700">Min Redemption</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">editable</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={redemptionForm.minRedemption}
                onChange={(e) =>
                  setRedemptionForm({ ...redemptionForm, minRedemption: e.target.value })
                }
                min="1"
                className="w-full px-3 py-2.5 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold text-gray-900"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-gray-400 font-medium">Coins</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm font-medium text-gray-700">Max Redemption</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">editable</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={redemptionForm.maxRedemption}
                onChange={(e) =>
                  setRedemptionForm({ ...redemptionForm, maxRedemption: e.target.value })
                }
                min="1"
                className="w-full px-3 py-2.5 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold text-gray-900"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-gray-400 font-medium">Coins</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveRedemption}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-700 hover:to-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Redemption Limits
              </>
            )}
          </button>
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
                    Coins <span className="text-red-500">*</span>
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
                    Number of coins shown in rule (e.g., 600 Coins)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dollar Amount <span className="text-red-500">*</span>
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
                    Dollar amount shown in rule (e.g., $6)
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Preview:</span>{" "}
                    {editFormData.coinsPerUnit} Coins = ${editFormData.currencyAmount}
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
