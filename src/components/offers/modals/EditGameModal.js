"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useMasterData } from "../../../hooks/useMasterData";
import { gamesAPI } from "../../../data/games";
import apiClient from "../../../lib/apiClient";
import toast from "react-hot-toast";

// XP Tier mapping: Frontend strings to Backend numbers
const XP_TIER_MAP = {
  Junior: 1,
  Mid: 2,
  Senior: 3,
  All: null,
};

const XP_TIER_REVERSE_MAP = {
  1: "Junior",
  2: "Mid",
  3: "Senior",
  4: "Senior",
  5: "Senior",
  6: "Senior",
  7: "Senior",
  8: "Senior",
  9: "Senior",
  10: "Senior",
};

function xpTierStringToNumber(xpTierString) {
  if (!xpTierString || xpTierString === "All" || xpTierString === "") {
    return null;
  }
  return XP_TIER_MAP[xpTierString] || 1;
}

function xpTierNumberToString(xpTierNumber) {
  if (xpTierNumber === null || xpTierNumber === undefined) {
    return "All";
  }
  return XP_TIER_REVERSE_MAP[xpTierNumber] || "Junior";
}

const XP_TIERS = ["Junior", "Mid", "Senior", "All"];
const GAME_GENRES = [
  "puzzle",
  "action",
  "strategy",
  "arcade",
  "adventure",
  "sports",
  "racing",
  "simulation",
  "rpg",
];
const GAME_DIFFICULTIES = ["easy", "medium", "hard"];

const AGE_GROUPS = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];

const GENDERS = ["Male", "Female", "Other", "Any"];

const CITIES = {
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  CA: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  UK: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool"],
  AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  // Add more cities as needed
};

const MARKETING_CHANNELS = [
  "Facebook",
  "TikTok",
  "Organic",
  "Paid",
  "Google",
  "Instagram",
  "Twitter",
  "YouTube",
];

export default function EditGameModal({ isOpen, onClose, game, onSave }) {
  const {
    sdkProviders,
    tierAccess,
    countries,
    loading: masterDataLoading,
  } = useMasterData();
  const [platform, setPlatform] = useState("android");
  const [gamesList, setGamesList] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [uiSections, setUiSections] = useState([]);
  const [loadingUISections, setLoadingUISections] = useState(false);
  const [formData, setFormData] = useState({
    gameId: "",
    title: "",
    description: "",
    sdk: "",
    xptrRules: "",
    rewardXP: 0,
    rewardCoins: 0,
    rewardDollars: 0, // Dollar amount that converts to coins (50 coins = 1 dollar)
    taskCount: 0,
    activeVisible: true,
    fallbackGame: false,
    thumbnail: null,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
    thumbnailAltText: "",
    xpTier: "",
    xpTiers: [], // Multi-select XP tiers
    baseXP: 0, // Base XP for task 1
    xpMultiplier: 1.0, // Stepwise multiplier
    tier: "",
    uiSection: "",
    // Countries field removed from Game model
    tags: [],
    metadata: {
      genre: "puzzle",
      difficulty: "medium",
      rating: 3,
      downloadCount: 0,
      estimatedPlayTime: 15,
    },
    displayRules: {
      maxGamesToShow: 10,
      priority: 5,
      isFeatured: false,
    },
    segments: {
      ageGroups: [],
      gender: "",
      country: "",
      city: "",
      marketingChannel: "",
      campaignName: "",
    },
    thirdPartyGameData: null, // Store complete third-party API response
  });

  useEffect(() => {
    if (game) {
      // Set device platform from the game: map response "device": "ios" | "android" → display "iOS" | "Android"
      const gamePlatform = (() => {
        const norm = (v) => String(v).toLowerCase().trim();
        const toPlatform = (p) => {
          if (!p) return null;
          const n = norm(p);
          if (n === "iphone" || n === "ios") return "ios";
          if (n === "android") return "android";
          return n;
        };
        // game.device (from API or mapped from besitosRawData.device in games.js)
        if (game.device) {
          const p = toPlatform(game.device);
          if (p) return p;
        }
        // Fallback: raw Besitos/thirdParty data has "device": "ios" | "android"
        const raw = game.besitosRawData || game.thirdPartyGameData;
        if (raw?.device) {
          const p = toPlatform(raw.device);
          if (p) return p;
        }
        if (game.device_platform) {
          const p = toPlatform(game.device_platform);
          if (p) return p;
        }
        if (game.devices && Array.isArray(game.devices)) {
          const hasIos = game.devices.some(
            (d) => ["ios", "iphone"].includes(norm(d))
          );
          const hasAndroid = game.devices.some((d) => norm(d) === "android");
          if (hasIos && !hasAndroid) return "ios";
          if (hasAndroid) return "android";
        }
        return null;
      })();
      if (gamePlatform === "ios" || gamePlatform === "android") {
        setPlatform(gamePlatform);
      }

      // Debug: Log game data to help troubleshoot
      console.log("Loading game data for edit:", {
        gameId: game.gameId || game.id,
        ageGroups: game.ageGroups,
        segmentsAgeGroups: game.segments?.ageGroups,
        gender: game.gender,
        segmentsGender: game.segments?.gender,
        marketingChannel: game.marketingChannel,
        segmentsMarketingChannel: game.segments?.marketingChannel,
        campaignName: game.campaignName,
        segmentsCampaignName: game.segments?.campaignName,
      });

      setFormData({
        gameId: game.gameId || game.id || "",
        title: game.title || "",
        description: game.description || "",
        sdk: game.sdk || "",
        xptrRules: game.xptrRules || "",
        rewardXP: game.rewardXP || 0,
        rewardCoins: game.rewardCoins || 0,
        rewardDollars: game.rewardCoins
          ? parseFloat((game.rewardCoins / 50).toFixed(2))
          : 0, // Convert coins to dollars (50 coins = 1 dollar)
        taskCount: game.taskCount || 0,
        activeVisible:
          game.status !== undefined ? (game.status === true || game.status === "Active") : game.activeVisible ?? true,
        fallbackGame: game.fallbackGame ?? false,
        thumbnail: game.thumbnail || null,
        thumbnailWidth: game.thumbnailWidth || 300,
        thumbnailHeight: game.thumbnailHeight || 300,
        thumbnailAltText: game.thumbnailAltText || "",
        xpTier: game.xpTier || "",
        xpTiers: (() => {
          // Handle xpTiers - could be array, JSON string, or undefined
          if (Array.isArray(game.xpTiers)) {
            return game.xpTiers;
          }
          if (typeof game.xpTiers === "string") {
            try {
              const parsed = JSON.parse(game.xpTiers);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
        baseXP: game.baseXP || game.xpRewardConfig?.baseXP || 0,
        xpMultiplier:
          game.xpMultiplier || game.xpRewardConfig?.multiplier || 1.0,
        tier: game.tier || "",
        uiSection: game.uiSection || "",
        // Countries field removed from Game model
        tags: game.tags || [],
        metadata: {
          genre: game.metadata?.genre || "puzzle",
          difficulty: game.metadata?.difficulty || "medium",
          rating: game.metadata?.rating || 3,
          downloadCount: game.metadata?.downloadCount || 0,
          estimatedPlayTime: game.metadata?.estimatedPlayTime || 15,
        },
        displayRules: {
          maxGamesToShow: game.displayRules?.maxGamesToShow || 10,
          priority: game.displayRules?.priority || 5,
          isFeatured: game.displayRules?.isFeatured || false,
        },
        segments: {
          // Support both segments object and top-level fields for backward compatibility
          // Handle ageGroups - could be array, JSON string, or undefined
          ageGroups: (() => {
            const ageGroups = game.segments?.ageGroups || game.ageGroups;
            if (Array.isArray(ageGroups)) {
              return ageGroups;
            }
            if (typeof ageGroups === "string") {
              try {
                const parsed = JSON.parse(ageGroups);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                // If it's a single string value, wrap it in an array
                return ageGroups.trim() ? [ageGroups] : [];
              }
            }
            return [];
          })(),
          // Handle gender - normalize to match dropdown options (Male, Female, Other, Any)
          gender: (() => {
            const gender = game.segments?.gender || game.gender || "";
            if (!gender) return "";
            const genderLower = gender.toLowerCase();
            // Map common variations to dropdown values
            if (genderLower === "male" || genderLower === "m") return "Male";
            if (genderLower === "female" || genderLower === "f")
              return "Female";
            if (genderLower === "other") return "Other";
            if (genderLower === "all" || genderLower === "any") return "Any";
            // If it's already in the correct format, return as-is
            if (["Male", "Female", "Other", "Any"].includes(gender))
              return gender;
            // Default: capitalize first letter
            return (
              gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
            );
          })(),
          country: game.segments?.country || game.country || "",
          city: game.segments?.city || game.city || "",
          marketingChannel:
            game.segments?.marketingChannel || game.marketingChannel || "",
          campaignName: game.segments?.campaignName || game.campaignName || "",
        },
        thirdPartyGameData:
          game.thirdPartyGameData || game.besitosRawData || null,
      });
    } else {
      setPlatform("android");
      setFormData({
        gameId: "",
        title: "",
        description: "",
        sdk: "",
        xptrRules: "",
        rewardXP: 0,
        rewardCoins: 0,
        rewardDollars: 0,
        taskCount: 0,
        activeVisible: true,
        fallbackGame: false,
        thumbnail: null,
        thumbnailWidth: 300,
        thumbnailHeight: 300,
        thumbnailAltText: "",
        xpTier: "",
        xpTiers: [],
        baseXP: 0,
        xpMultiplier: 1.0,
        tier: "",
        uiSection: "",
        // Countries field removed from Game model
        tags: [],
        metadata: {
          genre: "puzzle",
          difficulty: "medium",
          rating: 3,
          downloadCount: 0,
          estimatedPlayTime: 15,
        },
        displayRules: {
          maxGamesToShow: 10,
          priority: 5,
          isFeatured: false,
        },
        segments: {
          ageGroups: [],
          gender: "",
          country: "",
          city: "",
          marketingChannel: "",
          campaignName: "",
        },
        thirdPartyGameData: null,
      });
    }
  }, [game, isOpen]);

  // Fetch UI sections on mount
  useEffect(() => {
    const fetchUISections = async () => {
      if (!isOpen) return;
      setLoadingUISections(true);
      try {
        const response = await gamesAPI.getUISections();
        // Handle different response formats
        let sections = [];
        if (Array.isArray(response)) {
          sections = response;
        } else if (response.sections && Array.isArray(response.sections)) {
          sections = response.sections;
        } else if (response.data && Array.isArray(response.data)) {
          sections = response.data;
        } else if (
          response.data?.sections &&
          Array.isArray(response.data.sections)
        ) {
          sections = response.data.sections;
        }
        // Extract section names if they're objects
        sections = sections.map((section) =>
          typeof section === "string"
            ? section
            : section.name || section.value || section
        );
        setUiSections(sections);
      } catch (error) {
        console.error("Error fetching UI sections:", error);
      } finally {
        setLoadingUISections(false);
      }
    };
    fetchUISections();
  }, [isOpen]);

  // Fetch games by SDK name
  useEffect(() => {
    const fetchGamesBySDK = async () => {
      if (!formData.sdk || !platform) {
        setGamesList([]);
        return;
      }

      setLoadingGames(true);
      try {
        const sdkName = formData.sdk.toLowerCase();
        const response = await apiClient.get(
          `/admin/game-offers/games/by-sdk/${sdkName}?device_platform=${platform}`
        );

        if (response.data.success && response.data.data) {
          const games = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];
          console.log("Fetched games:", games);
          // Filter games by selected platform
          const filteredGames = games.filter(game => {
            if (!game.devices && !game.device_platform) return true; // Include if no device info
            if (game.devices && Array.isArray(game.devices)) {
              return game.devices.some(device => device.toLowerCase() === platform.toLowerCase());
            }
            if (game.device_platform) {
              return game.device_platform.toLowerCase() === platform.toLowerCase();
            }
            return false;
          });
          setGamesList(filteredGames);
        } else {
          setGamesList([]);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setGamesList([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGamesBySDK();
  }, [formData.sdk, platform]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [section, subField] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // handleCountryToggle removed - countries field removed from Game model

  const handleMultiSelectChange = (field, value) => {
    const [section, subField] = field.split(".");
    setFormData((prev) => {
      const currentArray = prev[section][subField];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: updatedArray,
        },
      };
    });
  };

  const handleXpTierToggle = (tier) => {
    setFormData((prev) => ({
      ...prev,
      xpTiers: prev.xpTiers.includes(tier)
        ? prev.xpTiers.filter((t) => t !== tier)
        : [...prev.xpTiers, tier],
    }));
  };

  const handleSegmentCountryChange = (country) => {
    handleInputChange("segments.country", country);
    // Reset city when country changes
    handleInputChange("segments.city", "");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
    }
  };

  const handleGameSelect = (gameId) => {
    if (!gameId) {
      // Reset form if no game selected
      setFormData((prev) => ({
        ...prev,
        gameId: "",
        title: "",
        rewardDollars: 0,
        rewardCoins: 0,
        thirdPartyGameData: null,
      }));
      return;
    }

    const selectedGame = gamesList.find((g) => g.id === gameId);
    if (selectedGame) {
      // Extract dollar amount from API response (amount field)
      // The amount field from API is in dollars (e.g., 700 = $700)
      const dollarAmount =
        selectedGame.amount !== undefined && selectedGame.amount !== null
          ? parseFloat(selectedGame.amount)
          : 0;

      // Convert dollars to coins (50 coins = 1 dollar)
      // Example: $700 = 35,000 coins
      const coins = Math.round(dollarAmount * 50);

      console.log("Selected game:", selectedGame);
      console.log("Amount field from API:", selectedGame.amount);
      console.log("Dollar amount:", dollarAmount);
      console.log("Calculated coins:", coins);

      // Store the complete third-party API response with all original fields
      // This preserves the exact structure and all key names as received from the API
      const thirdPartyData = { ...selectedGame };

      setFormData((prev) => ({
        ...prev,
        gameId: selectedGame.id,
        title: selectedGame.title,
        description: selectedGame.description || prev.description,
        thumbnailAltText: `${selectedGame.title} game thumbnail`,
        rewardDollars: dollarAmount,
        rewardCoins: coins,
        thirdPartyGameData: thirdPartyData,
      }));
    } else {
      console.warn(
        "Game not found in gamesList. gameId:",
        gameId,
        "Available games:",
        gamesList
      );
    }
  };

  // Handle dollar input change and convert to coins
  const handleDollarChange = (dollarValue) => {
    const dollars = parseFloat(dollarValue) || 0;
    const coins = Math.round(dollars * 50); // 50 coins = 1 dollar

    setFormData((prev) => ({
      ...prev,
      rewardDollars: dollars,
      rewardCoins: coins,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.gameId || !formData.gameId.trim()) {
      toast.error("Game ID is required");
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      toast.error("Game title is required");
      return;
    }

    if (!formData.sdk) {
      toast.error("SDK Provider is required");
      return;
    }

    // XPTR Rules validation removed - field not used anywhere in app logic
    // if (!formData.xptrRules || !formData.xptrRules.trim()) {
    //   toast.error("XPTR Rules are required");
    //   return;
    // }

    // Validate dollar/reward amount when adding new game
    if (!game && (!formData.rewardDollars || formData.rewardDollars <= 0)) {
      toast.error("Please enter a valid reward amount in USD");
      return;
    }

    // Countries validation removed - countries field removed from Game model

    // Validate XP Tiers (at least one must be selected)
    if (!formData.xpTiers || formData.xpTiers.length === 0) {
      toast.error(
        "Please select at least one XP Tier (Junior, Mid, or Senior)"
      );
      return;
    }

    // Validate Age Groups (required for all games)
    if (
      !formData.segments.ageGroups ||
      formData.segments.ageGroups.length === 0
    ) {
      toast.error(
        "Age Range is required. Please select at least one age group."
      );
      return;
    }

    // Validate UI Section (required for all games)
    if (!formData.uiSection || !formData.uiSection.trim()) {
      toast.error("UI Section is required");
      return;
    }

    // Validate XP Tier values
    const validTiers = ["Junior", "Mid", "Senior"];
    const invalidTiers = formData.xpTiers.filter(
      (t) => !validTiers.includes(t)
    );
    if (invalidTiers.length > 0) {
      toast.error(
        `Invalid XP tiers: ${invalidTiers.join(
          ", "
        )}. Must be one of: Junior, Mid, Senior`
      );
      return;
    }

    // Validate Base XP
    const baseXP = parseFloat(formData.baseXP);
    if (isNaN(baseXP) || baseXP <= 0) {
      toast.error("Base XP must be a number greater than 0");
      return;
    }

    // Validate Multiplier
    const xpMultiplier = parseFloat(formData.xpMultiplier);
    if (isNaN(xpMultiplier) || xpMultiplier < 0.1) {
      toast.error(
        "Stepwise Multiplier must be a number greater than or equal to 0.1"
      );
      return;
    }

    // Map form data to API format
    const apiPayload = {
      gameId: formData.gameId,
      title: formData.title,
      description: formData.description,
      sdkProvider: formData.sdk,
      // xptrRules: formData.xptrRules, // Commented out - field not used anywhere in app logic
      xptrRules: "", // Set to empty string for backward compatibility
      rewardXP: parseInt(formData.rewardXP) || 0,
      rewardCoins: parseInt(formData.rewardCoins) || 0, // Calculated from dollars (50 coins = 1 dollar)
      defaultTaskCount: parseInt(formData.taskCount) || 0,
      xpTier: xpTierStringToNumber(formData.xpTier) || 1, // Keep for backward compatibility
      xpTiers: JSON.stringify(formData.xpTiers), // Multi-select XP tiers
      baseXP: parseFloat(formData.baseXP) || 0,
      xpMultiplier: parseFloat(formData.xpMultiplier) || 1.0,
      tier: formData.tier,
      uiSection: formData.uiSection,
      genre: formData.metadata.genre,
      difficulty: formData.metadata.difficulty,
      rating: parseFloat(formData.metadata.rating) || 3,
      estimatedPlayTime: parseInt(formData.metadata.estimatedPlayTime) || 15,
      // Countries field removed from Game model
      ageGroups: formData.segments.ageGroups,
      gender: formData.segments.gender || "all",
      marketingChannel: formData.segments.marketingChannel,
      campaignName: formData.segments.campaignName,
      isActive: formData.activeVisible ? "true" : "false",
      isDefaultFallback: formData.fallbackGame,
      isAdSupported: true,
      gameThumbnail: formData.thumbnail,
      thumbnailWidth: parseInt(formData.thumbnailWidth) || 300,
      thumbnailHeight: parseInt(formData.thumbnailHeight) || 300,
      thumbnailAltText:
        formData.thumbnailAltText || `${formData.title} game thumbnail`,
      // Include complete third-party API response data
      thirdPartyGameData: formData.thirdPartyGameData
        ? JSON.stringify(formData.thirdPartyGameData)
        : null,
    };

    onSave(apiPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {game ? "Edit Game" : "Add New Game"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">
                Basic Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      setPlatform(e.target.value);
                      // Reset SDK and game selection when platform changes
                      handleInputChange("sdk", "");
                      handleInputChange("gameId", "");
                      handleInputChange("title", "");
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select SDK Game
                  </label>
                  <select
                    value={formData.sdk}
                    onChange={(e) => {
                      handleInputChange("sdk", e.target.value);
                      // Reset game selection when SDK changes
                      handleInputChange("gameId", "");
                      handleInputChange("title", "");
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">Choose SDK Game...</option>
                    {sdkProviders.map((sdk) => (
                      <option key={sdk.id} value={sdk.name}>
                        {sdk.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Title
                  </label>
                  <select
                    value={formData.gameId}
                    onChange={(e) => handleGameSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={!formData.sdk || loadingGames}
                  >
                    <option value="">
                      {!formData.sdk
                        ? "Select SDK first..."
                        : loadingGames
                        ? "Loading games..."
                        : "Choose game..."}
                    </option>
                    {gamesList.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* XPTR Rules - Hidden: Field not used anywhere in app logic */}
                {/* <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XPTR Rules *
                  </label>
                  <textarea
                    value={formData.xptrRules}
                    onChange={(e) =>
                      handleInputChange("xptrRules", e.target.value)
                    }
                    placeholder="Enter XP tier rules (e.g., Complete 3 surveys worth 100+ points each)"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div> */}

                {/* XP Reward - Hidden in edit modal */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Amount (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rewardDollars}
                      readOnly
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                      disabled={!formData.gameId}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Reward amount is received from the API and cannot be edited
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coin Reward{" "}
                    <span className="text-xs text-gray-500">
                      (Auto-calculated)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.rewardCoins || 0}
                    readOnly
                    disabled
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.rewardDollars > 0
                      ? `${
                          formData.rewardDollars
                        } USD = ${formData.rewardCoins.toLocaleString()} coins (50 coins per dollar)`
                      : "Coins are calculated from the dollar amount above"}
                  </p>
                </div>

                {/* Default Task Count - Hidden: Field not used anywhere per dev confirmation */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Task Count
                  </label>
                  <input
                    type="number"
                    value={formData.taskCount}
                    onChange={(e) =>
                      handleInputChange(
                        "taskCount",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="Enter task count"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div> */}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    XP Tier Rules <span className="text-red-500">*</span>{" "}
                    (Multi-select)
                  </label>
                  <div className="grid grid-cols-3 gap-3 border border-gray-200 rounded-md p-3">
                    {["Junior", "Mid", "Senior"].map((tier) => (
                      <label key={tier} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.xpTiers.includes(tier)}
                          onChange={() => handleXpTierToggle(tier)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {tier}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Selected tiers decide which users can see/play the game and
                    what restrictions apply.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base XP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.baseXP}
                    onChange={(e) =>
                      handleInputChange(
                        "baseXP",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 10"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Base XP reward for Task 1
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stepwise Multiplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.xpMultiplier}
                    onChange={(e) =>
                      handleInputChange(
                        "xpMultiplier",
                        parseFloat(e.target.value) || 1.0
                      )
                    }
                    placeholder="e.g., 1.5"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Multiplier applied to each subsequent task (Task 2 = Task 1
                    × Multiplier)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => handleInputChange("tier", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">Choose Tier...</option>
                    {tierAccess.map((tier) => (
                      <option key={tier.id} value={tier.name}>
                        {tier.name}
                      </option>
                    ))}
                    <option value="All">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UI Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.uiSection}
                    onChange={(e) =>
                      handleInputChange("uiSection", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={loadingUISections}
                    required
                  >
                    <option value="">Choose UI Section...</option>
                    {(() => {
                      // Filter out hidden UI sections: Banner, Carousel, Discover, Featured, Game, Games, Home, Wallet
                      const hiddenSections = [
                        "Banner",
                        "Carousel",
                        "Discover",
                        "Featured",
                        "Game",
                        "Games",
                        "Home",
                        "Wallet",
                      ];
                      const filteredUISections = uiSections.filter(
                        (section) => !hiddenSections.includes(section)
                      );
                      return filteredUISections.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                {/* Game Genre - Hidden: Fields do not populate correct values and do not map to any logic in app */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Genre
                  </label>
                  <select
                    value={formData.metadata.genre}
                    onChange={(e) =>
                      handleInputChange("metadata.genre", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {GAME_GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* Difficulty - Hidden: Fields do not populate correct values and do not map to any logic in app */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.metadata.difficulty}
                    onChange={(e) =>
                      handleInputChange("metadata.difficulty", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {GAME_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() +
                          difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* Rating - Hidden: Fields do not populate correct values and do not map to any logic in app */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.metadata.rating}
                    onChange={(e) =>
                      handleInputChange(
                        "metadata.rating",
                        parseInt(e.target.value) || 3
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div> */}
              </div>

              {/* Target Countries - Hidden in edit modal */}

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={formData.activeVisible}
                  onChange={(e) =>
                    handleInputChange("activeVisible", e.target.checked)
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Active/Visible
                </span>
              </div>

              {/* Default Fallback Game checkbox - commented out */}
              {/* <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={formData.fallbackGame}
                  onChange={(e) =>
                    handleInputChange("fallbackGame", e.target.checked)
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Default Fallback Game
                </span>
              </div> */}
            </div>

            {/* SECTION 2: Targeting & Segmentation */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">
                Targeting & Segmentation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {AGE_GROUPS.map((age) => (
                      <label key={age} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.segments.ageGroups.includes(age)}
                          onChange={() =>
                            handleMultiSelectChange("segments.ageGroups", age)
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {age}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.segments.gender}
                    onChange={(e) =>
                      handleInputChange("segments.gender", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    aria-label="Gender"
                  >
                    <option value="">Select gender...</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country field - Hidden in edit modal */}

                {/* City field - Hidden in edit modal */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marketing Channel
                  </label>
                  <select
                    value={formData.segments.marketingChannel}
                    onChange={(e) =>
                      handleInputChange(
                        "segments.marketingChannel",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    aria-label="Marketing Channel"
                  >
                    <option value="">Select Channel...</option>
                    {MARKETING_CHANNELS.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.segments.campaignName}
                    onChange={(e) =>
                      handleInputChange("segments.campaignName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter campaign name"
                    aria-label="Campaign Name"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail section - Hidden in edit modal */}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Save Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
