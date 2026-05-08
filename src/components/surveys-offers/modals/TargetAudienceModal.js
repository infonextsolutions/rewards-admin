"use client";

import { useState, useEffect, useMemo } from "react";

export default function TargetAudienceModal({
  isOpen,
  onClose,
  onConfirm,
  offerCount = 1,
  offerTitle = "offers",
  surveyData,
  coinsPerDollar = 100,
}) {
  const [selectedAges, setSelectedAges] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [rewardPercentage, setRewardPercentage] = useState(20);
  const [rewardXP, setRewardXP] = useState(0);

  const baseValue = surveyData
    ? surveyData.cpi > 0
      ? surveyData.cpi
      : surveyData.value || 0
    : 0;

  const calculatedCoins = useMemo(() => {
    if (!surveyData || !baseValue) return 0;
    return Math.round(baseValue * coinsPerDollar * (rewardPercentage / 100));
  }, [surveyData, baseValue, coinsPerDollar, rewardPercentage]);

  const ageOptions = [
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55-64", label: "55-64" },
    { value: "65+", label: "65+" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAges([]);
      setSelectedGenders([]);
      setRewardPercentage(20);
      setRewardXP(0);
    }
  }, [isOpen]);

  const handleAgeToggle = (age) => {
    if (age === "all") {
      setSelectedAges(selectedAges.length === ageOptions.length ? [] : ageOptions.map(a => a.value));
    } else {
      setSelectedAges((prev) =>
        prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]
      );
    }
  };

  const handleGenderToggle = (gender) => {
    if (gender === "all") {
      setSelectedGenders(selectedGenders.length === genderOptions.length ? [] : genderOptions.map(g => g.value));
    } else {
      setSelectedGenders((prev) =>
        prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
      );
    }
  };

  const handleSelectAllAges = () => {
    setSelectedAges(ageOptions.map((a) => a.value));
  };

  const handleSelectAllGenders = () => {
    setSelectedGenders(genderOptions.map((g) => g.value));
  };

  const handleConfirm = () => {
    const targetAudience = {
      age: selectedAges.length === 0 || selectedAges.length === ageOptions.length ? ["all"] : selectedAges,
      gender: selectedGenders.length === 0 || selectedGenders.length === genderOptions.length ? ["all"] : selectedGenders,
    };
    onConfirm({
      targetAudience,
      userRewardCoins: surveyData ? calculatedCoins : null,
      userRewardXP: surveyData ? Number(rewardXP) || 0 : null,
    });
    onClose();
  };

  if (!isOpen) return null;

  const allAgesSelected = selectedAges.length === ageOptions.length;
  const allGendersSelected = selectedGenders.length === genderOptions.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Sync Survey
              </h2>
              <p className="text-sm text-gray-500">
                Configure target audience and rewards for {offerCount} {offerTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6 space-y-6 max-h-[65vh] overflow-y-auto">

          {/* ── Audience Section ── */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-5">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-800">Target Audience</h3>
            </div>

            {/* Age Range Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Age Range
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllAges}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {allAgesSelected ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {ageOptions.map((age) => (
                  <button
                    key={age.value}
                    type="button"
                    onClick={() => handleAgeToggle(age.value)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${
                      selectedAges.includes(age.value)
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:shadow-sm"
                    }`}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
              {selectedAges.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  All ages will be targeted
                </p>
              )}
            </div>

            {/* Gender Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Gender
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllGenders}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {allGendersSelected ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {genderOptions.map((gender) => (
                  <button
                    key={gender.value}
                    type="button"
                    onClick={() => handleGenderToggle(gender.value)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${
                      selectedGenders.includes(gender.value)
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:shadow-sm"
                    }`}
                  >
                    {gender.label}
                  </button>
                ))}
              </div>
              {selectedGenders.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  All genders will be targeted
                </p>
              )}
            </div>
          </div>

          {/* ── Reward Section ── */}
          {surveyData && (
            <div className="bg-indigo-50 rounded-xl p-5 space-y-5">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Reward Configuration</h3>
              </div>

              {/* CPI Card */}
              {surveyData.cpi > 0 && (
                <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      CPI (USD)
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    ${surveyData.cpi.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Reward Percentage + XP Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reward Percentage
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={rewardPercentage}
                      onChange={(e) => setRewardPercentage(Number(e.target.value) || 0)}
                      className="w-24 px-4 py-2.5 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-semibold text-center"
                    />
                    <span className="text-lg font-semibold text-gray-600">%</span>
                    <span className="text-xs text-gray-400">
                      ({coinsPerDollar} coins/$)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rewardXP}
                    onChange={(e) => setRewardXP(Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Calculated Coins Preview */}
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white/80 uppercase tracking-wide">
                      User Reward
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {calculatedCoins.toLocaleString()} coins
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {baseValue.toFixed(2)} x {coinsPerDollar} coins/$ x {rewardPercentage}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-white/80 uppercase tracking-wide">
                      XP
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {Number(rewardXP) || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirm & Sync</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
