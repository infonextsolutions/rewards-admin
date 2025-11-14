'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMasterData } from '../../../hooks/useMasterData';
import { gamesAPI } from '../../../data/games';

const XP_TIERS = ['Junior', 'Mid', 'Senior', 'All'];
const GAME_GENRES = ['puzzle', 'action', 'strategy', 'arcade', 'adventure', 'sports', 'racing', 'simulation', 'rpg'];
const GAME_DIFFICULTIES = ['easy', 'medium', 'hard'];

const AGE_GROUPS = [
  '13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
];

const GENDERS = ['Male', 'Female', 'Other', 'Any'];

const CITIES = {
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  'UK': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  // Add more cities as needed
};

const MARKETING_CHANNELS = [
  'Facebook', 'TikTok', 'Organic', 'Paid', 'Google', 'Instagram', 'Twitter', 'YouTube'
];

export default function EditGameModal({ isOpen, onClose, game, onSave }) {
  const { sdkProviders, tierAccess, countries, loading: masterDataLoading } = useMasterData();
  const [platform, setPlatform] = useState('android');
  const [gamesList, setGamesList] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [uiSections, setUiSections] = useState([]);
  const [loadingUISections, setLoadingUISections] = useState(false);
  const [formData, setFormData] = useState({
    gameId: '',
    title: '',
    description: '',
    sdk: '',
    xptrRules: '',
    rewardXP: 0,
    rewardCoins: 0,
    taskCount: 0,
    activeVisible: true,
    fallbackGame: false,
    thumbnail: null,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
    thumbnailAltText: '',
    xpTier: '',
    tier: '',
    uiSection: '',
    countries: [],
    tags: [],
    metadata: {
      genre: 'puzzle',
      difficulty: 'medium',
      rating: 3,
      downloadCount: 0,
      estimatedPlayTime: 15
    },
    displayRules: {
      maxGamesToShow: 10,
      priority: 5,
      isFeatured: false
    },
    segments: {
      ageGroups: [],
      gender: '',
      country: '',
      city: '',
      marketingChannel: '',
      campaignName: ''
    }
  });

  useEffect(() => {
    if (game) {
      setFormData({
        gameId: game.gameId || game.id || '',
        title: game.title || '',
        description: game.description || '',
        sdk: game.sdk || '',
        xptrRules: game.xptrRules || '',
        rewardXP: game.rewardXP || 0,
        rewardCoins: game.rewardCoins || 0,
        taskCount: game.taskCount || 0,
        activeVisible: game.active !== undefined ? game.active : (game.activeVisible ?? true),
        fallbackGame: game.fallbackGame ?? false,
        thumbnail: game.thumbnail || null,
        thumbnailWidth: game.thumbnailWidth || 300,
        thumbnailHeight: game.thumbnailHeight || 300,
        thumbnailAltText: game.thumbnailAltText || '',
        xpTier: game.xpTier || '',
        tier: game.tier || '',
        uiSection: game.uiSection || '',
        countries: game.countries || [],
        tags: game.tags || [],
        metadata: {
          genre: game.metadata?.genre || 'puzzle',
          difficulty: game.metadata?.difficulty || 'medium',
          rating: game.metadata?.rating || 3,
          downloadCount: game.metadata?.downloadCount || 0,
          estimatedPlayTime: game.metadata?.estimatedPlayTime || 15
        },
        displayRules: {
          maxGamesToShow: game.displayRules?.maxGamesToShow || 10,
          priority: game.displayRules?.priority || 5,
          isFeatured: game.displayRules?.isFeatured || false
        },
        segments: {
          ageGroups: game.segments?.ageGroups || [],
          gender: game.segments?.gender || '',
          country: game.segments?.country || '',
          city: game.segments?.city || '',
          marketingChannel: game.segments?.marketingChannel || '',
          campaignName: game.segments?.campaignName || ''
        }
      });
    } else {
      setFormData({
        gameId: '',
        title: '',
        description: '',
        sdk: '',
        xptrRules: '',
        rewardXP: 0,
        rewardCoins: 0,
        taskCount: 0,
        activeVisible: true,
        fallbackGame: false,
        thumbnail: null,
        thumbnailWidth: 300,
        thumbnailHeight: 300,
        thumbnailAltText: '',
        xpTier: '',
        tier: '',
        uiSection: '',
        countries: [],
        tags: [],
        metadata: {
          genre: 'puzzle',
          difficulty: 'medium',
          rating: 3,
          downloadCount: 0,
          estimatedPlayTime: 15
        },
        displayRules: {
          maxGamesToShow: 10,
          priority: 5,
          isFeatured: false
        },
        segments: {
          ageGroups: [],
          gender: '',
          country: '',
          city: '',
          marketingChannel: '',
          campaignName: ''
        }
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
        } else if (response.data?.sections && Array.isArray(response.data.sections)) {
          sections = response.data.sections;
        }
        // Extract section names if they're objects
        sections = sections.map(section => typeof section === 'string' ? section : (section.name || section.value || section));
        setUiSections(sections);
      } catch (error) {
        console.error('Error fetching UI sections:', error);
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
        const token = localStorage.getItem('token');
        const sdkName = formData.sdk.toLowerCase();
        const response = await fetch(
          `https://rewardsapi.hireagent.co/api/admin/game-offers/games/by-sdk/${sdkName}?device_platform=${platform}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const result = await response.json();

        if (result.success && result.data) {
          setGamesList(result.data);
        } else {
          setGamesList([]);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setGamesList([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGamesBySDK();
  }, [formData.sdk, platform]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCountryToggle = (country) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    const [section, subField] = field.split('.');
    setFormData(prev => {
      const currentArray = prev[section][subField];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: updatedArray
        }
      };
    });
  };

  const handleSegmentCountryChange = (country) => {
    handleInputChange('segments.country', country);
    // Reset city when country changes
    handleInputChange('segments.city', '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleGameSelect = (gameId) => {
    const selectedGame = gamesList.find(g => g.id === gameId);
    if (selectedGame) {
      setFormData(prev => ({
        ...prev,
        gameId: selectedGame.id,
        title: selectedGame.title,
        description: selectedGame.description || prev.description,
        thumbnailAltText: `${selectedGame.title} game thumbnail`
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Map form data to API format
    const apiPayload = {
      gameId: formData.gameId,
      title: formData.title,
      description: formData.description,
      sdkProvider: formData.sdk,
      xptrRules: formData.xptrRules,
      rewardXP: parseInt(formData.rewardXP) || 0,
      rewardCoins: parseInt(formData.rewardCoins) || 0,
      defaultTaskCount: parseInt(formData.taskCount) || 0,
      xpTier: formData.xpTier,
      tier: formData.tier,
      uiSection: formData.uiSection,
      genre: formData.metadata.genre,
      difficulty: formData.metadata.difficulty,
      rating: parseFloat(formData.metadata.rating) || 3,
      estimatedPlayTime: parseInt(formData.metadata.estimatedPlayTime) || 15,
      countries: formData.countries,
      ageGroups: formData.segments.ageGroups,
      gender: formData.segments.gender || 'all',
      marketingChannel: formData.segments.marketingChannel,
      campaignName: formData.segments.campaignName,
      isActive: formData.activeVisible,
      isDefaultFallback: formData.fallbackGame,
      isAdSupported: true,
      gameThumbnail: formData.thumbnail,
      thumbnailWidth: parseInt(formData.thumbnailWidth) || 300,
      thumbnailHeight: parseInt(formData.thumbnailHeight) || 300,
      thumbnailAltText: formData.thumbnailAltText || `${formData.title} game thumbnail`
    };

    onSave(apiPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {game ? 'Edit Game' : 'Add New Game'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Basic Details</h4>
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
                      handleInputChange('sdk', '');
                      handleInputChange('gameId', '');
                      handleInputChange('title', '');
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
                      handleInputChange('sdk', e.target.value);
                      // Reset game selection when SDK changes
                      handleInputChange('gameId', '');
                      handleInputChange('title', '');
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">Choose SDK Game...</option>
                    {sdkProviders.map(sdk => (
                      <option key={sdk.id} value={sdk.name}>{sdk.name}</option>
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
                        ? 'Select SDK first...'
                        : loadingGames
                        ? 'Loading games...'
                        : 'Choose game...'}
                    </option>
                    {gamesList.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XPTR Rules *
                  </label>
                  <textarea
                    value={formData.xptrRules}
                    onChange={(e) => handleInputChange('xptrRules', e.target.value)}
                    placeholder="Enter XP tier rules (e.g., Complete 3 surveys worth 100+ points each)"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    value={formData.rewardXP}
                    onChange={(e) => handleInputChange('rewardXP', parseInt(e.target.value) || 0)}
                    placeholder="Enter XP reward"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coin Reward
                  </label>
                  <input
                    type="number"
                    value={formData.rewardCoins}
                    onChange={(e) => handleInputChange('rewardCoins', parseInt(e.target.value) || 0)}
                    placeholder="Enter coin reward"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Task Count
                  </label>
                  <input
                    type="number"
                    value={formData.taskCount}
                    onChange={(e) => handleInputChange('taskCount', parseInt(e.target.value) || 0)}
                    placeholder="Enter task count"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Tier
                  </label>
                  <select
                    value={formData.xpTier}
                    onChange={(e) => handleInputChange('xpTier', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Choose XP Tier...</option>
                    {XP_TIERS.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => handleInputChange('tier', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">Choose Tier...</option>
                    {tierAccess.map(tier => (
                      <option key={tier.id} value={tier.name}>{tier.name}</option>
                    ))}
                    <option value="All">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UI Section
                  </label>
                  <select
                    value={formData.uiSection}
                    onChange={(e) => handleInputChange('uiSection', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={loadingUISections}
                  >
                    <option value="">Choose UI Section...</option>
                    {uiSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Genre
                  </label>
                  <select
                    value={formData.metadata.genre}
                    onChange={(e) => handleInputChange('metadata.genre', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {GAME_GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.metadata.difficulty}
                    onChange={(e) => handleInputChange('metadata.difficulty', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {GAME_DIFFICULTIES.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.metadata.rating}
                    onChange={(e) => handleInputChange('metadata.rating', parseInt(e.target.value) || 3)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Target Countries */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Countries
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {countries.map(country => (
                    <label key={country.code} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.countries.includes(country.code)}
                        onChange={() => handleCountryToggle(country.code)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        disabled={masterDataLoading}
                      />
                      <span className="ml-2 text-sm text-gray-700" title={country.name}>{country.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={formData.activeVisible}
                  onChange={(e) => handleInputChange('activeVisible', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active/Visible</span>
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={formData.fallbackGame}
                  onChange={(e) => handleInputChange('fallbackGame', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Default Fallback Game</span>
              </div>
            </div>

            {/* SECTION 2: Targeting & Segmentation */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Targeting & Segmentation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {AGE_GROUPS.map(age => (
                      <label key={age} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.segments.ageGroups.includes(age)}
                          onChange={() => handleMultiSelectChange('segments.ageGroups', age)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{age}</span>
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
                    onChange={(e) => handleInputChange('segments.gender', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    aria-label="Gender"
                  >
                    <option value="">Select gender...</option>
                    {GENDERS.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.segments.country}
                    onChange={(e) => handleSegmentCountryChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    aria-label="Country"
                    disabled={masterDataLoading}
                  >
                    <option value="">Select Country...</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={formData.segments.city}
                    onChange={(e) => handleInputChange('segments.city', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    disabled={!formData.segments.country}
                    aria-label="City"
                  >
                    <option value="">Select City...</option>
                    {(formData.segments.country ? CITIES[formData.segments.country] || [] : []).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marketing Channel
                  </label>
                  <select
                    value={formData.segments.marketingChannel}
                    onChange={(e) => handleInputChange('segments.marketingChannel', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    aria-label="Marketing Channel"
                  >
                    <option value="">Select Channel...</option>
                    {MARKETING_CHANNELS.map(channel => (
                      <option key={channel} value={channel}>{channel}</option>
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
                    onChange={(e) => handleInputChange('segments.campaignName', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter campaign name"
                    aria-label="Campaign Name"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Game Thumbnail</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                {formData.thumbnail ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="h-24 w-24 object-cover rounded-md mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('thumbnail', null)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm text-gray-600 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Upload Game Thumbnail
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 300x300px
                    </p>
                  </>
                )}
              </div>

              {/* Thumbnail Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail Width (px)
                  </label>
                  <input
                    type="number"
                    value={formData.thumbnailWidth}
                    onChange={(e) => handleInputChange('thumbnailWidth', parseInt(e.target.value) || 300)}
                    placeholder="300"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail Height (px)
                  </label>
                  <input
                    type="number"
                    value={formData.thumbnailHeight}
                    onChange={(e) => handleInputChange('thumbnailHeight', parseInt(e.target.value) || 300)}
                    placeholder="300"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.thumbnailAltText}
                    onChange={(e) => handleInputChange('thumbnailAltText', e.target.value)}
                    placeholder="Game thumbnail description"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

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
