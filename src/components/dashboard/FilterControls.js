"use client";

import { useState, useEffect } from "react";
import { gamesAPI } from "../../data/games";

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="all">{placeholder}</option>
      {options.map((option, index) => (
        <option key={`${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const FilterControls = ({ filters, onFilterChange, loading = false }) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [customDateTimeout, setCustomDateTimeout] = useState(null);

  // Sync search value with filters prop
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || "");
    }
  }, [filters.search]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (customDateTimeout) {
        clearTimeout(customDateTimeout);
      }
    };
  }, [searchTimeout, customDateTimeout]);

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
    { value: "all", label: "All" },
  ];

  const [gameOptions, setGameOptions] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  // Fetch games for Game ID and Game Name filters
  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        // Fetch all active games
        const response = await gamesAPI.getGames({
          page: 1,
          limit: 1000, // Get all games
          status: "all", // Get both active and inactive for filter options
        });

        const games = response.games || [];

        // Create Game ID options - prioritize gameId, fallback to id if gameId missing
        // Use Map to ensure unique gameIds (in case of duplicates)
        const gameIdMap = new Map();
        games
          .filter((game) => game.gameId || game.id)
          .forEach((game) => {
            const gameId = game.gameId || game.id;
            // Only add if not already in map (handles duplicates)
            if (!gameIdMap.has(gameId)) {
              const gameTitle = game.title || game.name || "Untitled Game";
              gameIdMap.set(gameId, {
                value: gameId,
                label: `${gameTitle} [ID: ${gameId}]`,
              });
            }
          });

        // Convert Map to array and sort
        const gameIdOptions = Array.from(gameIdMap.values()).sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        setGameOptions(gameIdOptions);
      } catch (error) {
        console.error("Error fetching games for filters:", error);
        // Set empty arrays on error to prevent UI issues
        setGameOptions([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGames();
  }, []);

  // Source options matching API collection (facebook, google, direct)
  const sourceOptions = [
    { value: "facebook", label: "Facebook" },
    { value: "google", label: "Google" },
    { value: "direct", label: "Direct" },
  ];

  // Gender options matching API collection (male, female, other)
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Age options matching API collection
  const ageOptions = [
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55-64", label: "55-64" },
    { value: "65+", label: "65+" },
  ];

  const handleSearchClear = () => {
    setSearchValue("");
    onFilterChange("search", "");
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Clear any pending timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    // Submit search immediately
    onFilterChange("search", searchValue);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-emerald-600">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm font-medium">Dashboard loading...</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter Dashboard
          </h2>
          {loading && (
            <svg
              className="animate-spin h-4 w-4 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </div>
        <button
          onClick={() => {
            Object.keys(filters).forEach((key) => {
              if (key === "search") {
                onFilterChange(key, "");
                setSearchValue("");
              } else if (key === "dateRange") {
                onFilterChange(key, "last30days");
              } else if (key === "customStartDate" || key === "customEndDate") {
                onFilterChange(key, "");
              } else if (key === "age") {
                onFilterChange(key, "all");
              } else {
                onFilterChange(key, "all");
              }
            });
          }}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All Filters
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Search Users/Games
        </label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);

              // Clear existing timeout
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }

              // If empty, clear immediately
              if (value === "") {
                onFilterChange("search", "");
              }
              // Note: Removed auto-search debounce - search only triggers on button click or Enter key
            }}
            disabled={loading}
            placeholder="Search by game title or game ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="px-3 py-2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
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
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange("dateRange", e.target.value)}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dateRangeOptions.map((option, index) => (
              <option key={`${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {filters.dateRange === "custom" && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.customStartDate || ""}
                  max={filters.customEndDate || undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Clear any existing timeout
                    if (customDateTimeout) {
                      clearTimeout(customDateTimeout);
                    }
                    // Update the filter immediately for UI responsiveness
                    onFilterChange("customStartDate", value);
                    // Note: API call will be debounced in Dashboard component
                    // when both dates are set, so we don't need to debounce here
                  }}
                  disabled={loading}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.customEndDate || ""}
                  min={filters.customStartDate || undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Clear any existing timeout
                    if (customDateTimeout) {
                      clearTimeout(customDateTimeout);
                    }
                    // Update the filter immediately for UI responsiveness
                    onFilterChange("customEndDate", value);
                    // Note: API call will be debounced in Dashboard component
                    // when both dates are set, so we don't need to debounce here
                  }}
                  disabled={loading}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="End Date"
                />
              </div>
              {filters.customStartDate && filters.customEndDate &&
               new Date(filters.customStartDate) > new Date(filters.customEndDate) && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  End date must be after start date
                </div>
              )}
            </div>
          )}
        </div>

        <FilterDropdown
          label="Game ID"
          value={filters.game}
          onChange={(value) => onFilterChange("game", value)}
          options={gameOptions}
          placeholder="All Games"
          disabled={loading || loadingGames}
        />

        <FilterDropdown
          label="Source"
          value={filters.source}
          onChange={(value) => onFilterChange("source", value)}
          options={sourceOptions}
          placeholder="All Sources"
          disabled={loading}
        />

        <FilterDropdown
          label="Gender"
          value={filters.gender}
          onChange={(value) => onFilterChange("gender", value)}
          options={genderOptions}
          placeholder="All Genders"
          disabled={loading}
        />

        <FilterDropdown
          label="Age"
          value={filters.age}
          onChange={(value) => onFilterChange("age", value)}
          options={ageOptions}
          placeholder="All Ages"
          disabled={loading}
        />
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 mt-4">
        {Object.entries(filters).map(([key, value]) => {
          // Skip default values and empty search
          if (
            value === "all" ||
            value === "" ||
            (key === "dateRange" && value === "last30days")
          )
            return null;

          // Skip undefined values
          if (value === undefined || value === null) return null;

          const getLabel = (key, value) => {
            const optionsMap = {
              dateRange: dateRangeOptions,
              game: gameOptions,
              source: sourceOptions,
              gender: genderOptions,
              age: ageOptions,
            };

            const option = optionsMap[key]?.find((opt) => opt.value === value);
            if (option) return option.label;

            // For search, show the search term
            if (key === "search") return `Search: ${value}`;

            // For gameId, show the game title and ID
            if (key === "game") {
              const gameOption = gameOptions.find((opt) => opt.value === value);
              return gameOption
                ? `Game: ${gameOption.label}`
                : `Game ID: ${value}`;
            }

            return value;
          };

          return (
            <span
              key={key}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {getLabel(key, value)}
              <button
                onClick={() => {
                  if (key === "search") {
                    onFilterChange(key, "");
                    setSearchValue("");
                  } else if (key === "dateRange") {
                    onFilterChange(key, "last30days");
                  } else if (key === "age") {
                    onFilterChange(key, "all");
                  } else {
                    onFilterChange(key, "all");
                  }
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
                aria-label={`Remove ${key} filter`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default FilterControls;
