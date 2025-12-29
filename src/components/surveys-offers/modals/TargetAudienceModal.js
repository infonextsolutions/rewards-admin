"use client";

import { useState, useEffect } from "react";

export default function TargetAudienceModal({
  isOpen,
  onClose,
  onConfirm,
  offerCount = 1,
  offerTitle = "offers",
}) {
  const [selectedAges, setSelectedAges] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);

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
    onConfirm(targetAudience);
    onClose();
  };

  if (!isOpen) return null;

  const allAgesSelected = selectedAges.length === ageOptions.length;
  const allGendersSelected = selectedGenders.length === genderOptions.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Set Target Audience
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Select target audience for {offerCount} {offerTitle}. Leave empty to target all users.
          </p>

          {/* Age Range Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">
                Age Range
              </label>
              <button
                type="button"
                onClick={handleSelectAllAges}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {allAgesSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ageOptions.map((age) => (
                <button
                  key={age.value}
                  type="button"
                  onClick={() => handleAgeToggle(age.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedAges.includes(age.value)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500"
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
            {selectedAges.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No age selected - will target all ages
              </p>
            )}
          </div>

          {/* Gender Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <button
                type="button"
                onClick={handleSelectAllGenders}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {allGendersSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((gender) => (
                <button
                  key={gender.value}
                  type="button"
                  onClick={() => handleGenderToggle(gender.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedGenders.includes(gender.value)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500"
                  }`}
                >
                  {gender.label}
                </button>
              ))}
            </div>
            {selectedGenders.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No gender selected - will target all genders
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Confirm & Sync
          </button>
        </div>
      </div>
    </div>
  );
}

























