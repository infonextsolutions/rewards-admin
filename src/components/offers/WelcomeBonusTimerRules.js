"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  ClockIcon,
  GiftIcon,
  UserGroupIcon,
  PlayIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useWelcomeBonusTimer } from "../../hooks/useWelcomeBonusTimer";
import { gamesAPI } from "../../data/games";
import { tasksAPI } from "../../data/tasks";
import { welcomeBonusTimerAPI } from "../../data/welcomeBonusTimer";
import apiClient from "../../lib/apiClient";

const initialWelcomeBonusSettings = {
  unlockWindow: { value: 24, unit: "hours" },
  completionDeadline: { value: 7, unit: "days" },
  overrideByGameId: false,
  selectedGames: [],
  overrideByXP: false,
  xpThreshold: 200,
  enableRule: true,
  maxGamesWithBonusTasks: 3,
  maxBonusTasksPerGame: 3,
};

const initialGameplaySettings = {
  firstTimeGameLimit: 2,
  repeatUserGameLimit: 5,
  downloadTimerLimit: { value: 24, unit: "hours" },
  minimumTaskTime: 5,
  maximumTaskTime: 60,
  taskUnlockRule: ["Sequential", "Time-based"],
  minimumEventThreshold: 3,
  enableDynamicTaskFlow: true,
};

const timeUnits = ["minutes", "hours", "days"];
const unlockRuleOptions = [
  "Sequential",
  "Time-based",
  "Performance-based",
  "Event-triggered",
  "Manual approval",
  "Tier-restricted",
];

// Removed hardcoded games - will fetch from API

export default function WelcomeBonusTimerRules() {
  const {
    config,
    loading,
    error,
    fetchWelcomeBonusTimerRules,
    updateWelcomeBonusTimerRules,
  } = useWelcomeBonusTimer();
  const [activeTab, setActiveTab] = useState("welcome-bonus");
  const [welcomeBonusSettings, setWelcomeBonusSettings] = useState(
    initialWelcomeBonusSettings
  );
  const [gameplaySettings, setGameplaySettings] = useState(
    initialGameplaySettings
  );
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // New state for game bonus tasks configuration
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [gameTasks, setGameTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [bonusTasksConfig, setBonusTasksConfig] = useState({
    minimumEventThreshold: 3,
    bonusTasks: [], // Array of { taskId, order, unlockCondition }
  });
  const [loadingGameConfig, setLoadingGameConfig] = useState(false);
  // Store full task data including besitos info for mapping
  const [taskDataMap, setTaskDataMap] = useState(new Map());

  // Fetch welcome bonus timer rules on component mount
  useEffect(() => {
    fetchWelcomeBonusTimerRules();
  }, [fetchWelcomeBonusTimerRules]);

  // Fetch available games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gamesAPI.getGames({
          page: 1,
          limit: 1000,
          status: "all",
        });
        setAvailableGames(response.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };
    fetchGames();
  }, []);

  // Fetch tasks when game is selected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedGameId) {
        setGameTasks([]);
        return;
      }

      setLoadingTasks(true);
      try {
        // Fetch tasks from tasks API
        let apiTasks = [];
        try {
          const tasksResponse = await tasksAPI.getTasksForGame(selectedGameId, {
            limit: 100,
          });
          apiTasks = tasksResponse.tasks || [];
        } catch (error) {
          console.warn("Error fetching tasks from API:", error);
        }

        // Fetch full game data to get besitosRawData
        let besitosTasks = [];
        try {
          const gameResponse = await apiClient.get(`/admin/game-offers/games/${selectedGameId}`);
          const gameData = gameResponse.data.data;
          if (gameData.besitosRawData?.goals && Array.isArray(gameData.besitosRawData.goals)) {
            // Transform besitos goals to task format
            besitosTasks = gameData.besitosRawData.goals.map((goal, index) => ({
              id: goal.goal_id || `besitos_${index}`,
              name: goal.text || `Task ${index + 1}`,
              description: goal.description || goal.text || '',
              order: goal.order || index + 1,
              source: 'besitos'
            }));
          }
        } catch (error) {
          console.warn("Error fetching game data for besitos tasks:", error);
        }

        // Combine tasks from both sources, prioritizing API tasks
        const combinedTasks = [...apiTasks];
        const newTaskDataMap = new Map();
        
        // Store API tasks in map
        apiTasks.forEach(task => {
          newTaskDataMap.set(task.id, {
            ...task,
            source: 'api',
            isMongoId: true // API tasks already have MongoDB IDs
          });
        });
        
        // Add besitos tasks that aren't already in API tasks
        besitosTasks.forEach(besitosTask => {
          const exists = combinedTasks.some(task => 
            task.id === besitosTask.id || 
            task.name === besitosTask.name
          );
          if (!exists) {
            combinedTasks.push(besitosTask);
            // Store besitos task info for later mapping
            newTaskDataMap.set(besitosTask.id, {
              ...besitosTask,
              source: 'besitos',
              isMongoId: false,
              goalId: besitosTask.id,
              goalText: besitosTask.name
            });
          }
        });

        // Sort by order if available
        combinedTasks.sort((a, b) => {
          const orderA = a.order || 0;
          const orderB = b.order || 0;
          return orderA - orderB;
        });

        setGameTasks(combinedTasks);
        setTaskDataMap(newTaskDataMap);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setGameTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedGameId]);

  // Fetch existing bonus tasks configuration when game is selected
  useEffect(() => {
    const fetchGameConfig = async () => {
      if (!selectedGameId) {
        setBonusTasksConfig({ minimumEventThreshold: 3, bonusTasks: [] });
        return;
      }

      setLoadingGameConfig(true);
      try {
        const config = await welcomeBonusTimerAPI.getGameBonusTasks(
          selectedGameId
        );
        if (config) {
          setBonusTasksConfig({
            minimumEventThreshold: config.minimumEventThreshold || 3,
            bonusTasks: config.bonusTasks.map((bt) => ({
              taskId: bt.taskId,
              order: bt.order,
              // Set unlock condition based on order
              unlockCondition:
                bt.order === 1
                  ? "Unlocks immediately when welcome bonus is available."
                  : `Unlock this Bonus Task after Bonus Task ${
                      bt.order - 1
                    } is completed AND Minimum Event Threshold is met.`,
            })),
          });
        } else {
          setBonusTasksConfig({ minimumEventThreshold: 3, bonusTasks: [] });
        }
      } catch (error) {
        console.error("Error fetching game bonus tasks config:", error);
        setBonusTasksConfig({ minimumEventThreshold: 3, bonusTasks: [] });
      } finally {
        setLoadingGameConfig(false);
      }
    };

    fetchGameConfig();
  }, [selectedGameId]);

  // Update local state when config is loaded from API
  useEffect(() => {
    if (config) {
      // Convert API format to component format
      setWelcomeBonusSettings({
        unlockWindow: { value: config.unlockTimeHours, unit: "hours" },
        completionDeadline: {
          value: config.completionDeadlineDays,
          unit: "days",
        },
        overrideByGameId:
          config.gameOverrides && config.gameOverrides.length > 0,
        selectedGames: config.gameOverrides
          ? config.gameOverrides.filter((g) => g.isEnabled).map((g) => g.gameId)
          : [],
        overrideByXP:
          config.xpTierOverrides && config.xpTierOverrides.length > 0,
        xpThreshold:
          config.xpTierOverrides && config.xpTierOverrides.length > 0
            ? config.xpTierOverrides[0].minXp
            : 200,
        enableRule: config.isActive,
        maxGamesWithBonusTasks: config.maxGamesWithBonusTasks || 3,
        maxBonusTasksPerGame: config.maxBonusTasksPerGame || 3,
      });
      setLastSaved(config.updatedAt);
    }
  }, [config]);

  const handleWelcomeBonusChange = (key, value) => {
    setWelcomeBonusSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsModified(true);
  };

  const handleGameplayChange = (key, value) => {
    setGameplaySettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsModified(true);
  };

  const handleWelcomeBonusTimerChange = (field, value) => {
    setWelcomeBonusSettings((prev) => ({
      ...prev,
      unlockWindow: {
        ...prev.unlockWindow,
        [field]: value,
      },
    }));
    setIsModified(true);
  };

  const handleCompletionDeadlineChange = (field, value) => {
    setWelcomeBonusSettings((prev) => ({
      ...prev,
      completionDeadline: {
        ...prev.completionDeadline,
        [field]: value,
      },
    }));
    setIsModified(true);
  };

  const handleGameplayTimerChange = (field, value) => {
    setGameplaySettings((prev) => ({
      ...prev,
      downloadTimerLimit: {
        ...prev.downloadTimerLimit,
        [field]: value,
      },
    }));
    setIsModified(true);
  };

  const handleUnlockRuleToggle = (rule) => {
    setGameplaySettings((prev) => {
      const currentRules = prev.taskUnlockRule;
      const updatedRules = currentRules.includes(rule)
        ? currentRules.filter((r) => r !== rule)
        : [...currentRules, rule];

      return {
        ...prev,
        taskUnlockRule: updatedRules,
      };
    });
    setIsModified(true);
  };

  const handleGameSelection = (gameId) => {
    setWelcomeBonusSettings((prev) => {
      const currentGames = prev.selectedGames;
      const updatedGames = currentGames.includes(gameId)
        ? currentGames.filter((id) => id !== gameId)
        : [...currentGames, gameId];

      return {
        ...prev,
        selectedGames: updatedGames,
      };
    });
    setIsModified(true);
  };

  const validateWelcomeBonusSettings = () => {
    const unlockInHours =
      welcomeBonusSettings.unlockWindow.unit === "hours"
        ? welcomeBonusSettings.unlockWindow.value
        : welcomeBonusSettings.unlockWindow.value * 24;

    const deadlineInHours =
      welcomeBonusSettings.completionDeadline.unit === "hours"
        ? welcomeBonusSettings.completionDeadline.value
        : welcomeBonusSettings.completionDeadline.value * 24;

    return deadlineInHours >= unlockInHours;
  };

  const handleSaveSettings = async () => {
    if (!validateWelcomeBonusSettings()) {
      alert(
        "Completion deadline must be greater than or equal to unlock window"
      );
      return;
    }

    setIsSaving(true);

    try {
      // Convert component format to API format
      const configData = {
        unlockTimeHours: welcomeBonusSettings.unlockWindow.value,
        completionDeadlineDays: welcomeBonusSettings.completionDeadline.value,
        maxGamesWithBonusTasks: welcomeBonusSettings.maxGamesWithBonusTasks || 3,
        maxBonusTasksPerGame: welcomeBonusSettings.maxBonusTasksPerGame || 3,
        gameOverrides:
          welcomeBonusSettings.overrideByGameId &&
          welcomeBonusSettings.selectedGames.length > 0
            ? welcomeBonusSettings.selectedGames.map((gameId) => ({
                gameId,
                unlockTimeHours: 12, // Default override values
                completionDeadlineDays: 5,
                isEnabled: true,
              }))
            : [],
        xpTierOverrides: welcomeBonusSettings.overrideByXP
          ? [
              {
                minXp: 0,
                maxXp: 500,
                unlockTimeHours: 48,
                completionDeadlineDays: 14,
                isEnabled: true,
              },
              {
                minXp: 500,
                maxXp: 2000,
                unlockTimeHours: 24,
                completionDeadlineDays: 10,
                isEnabled: true,
              },
              {
                minXp: 2000,
                maxXp: 999999,
                unlockTimeHours: 12,
                completionDeadlineDays: 5,
                isEnabled: true,
              },
            ]
          : [],
        isActive: welcomeBonusSettings.enableRule,
        metadata: {
          description: "Welcome bonus timer configuration",
          notes: "Updated from admin panel",
          version: "1.1",
        },
      };

      await updateWelcomeBonusTimerRules(configData);
      setIsModified(false);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (
      confirm("Are you sure you want to reset all settings to default values?")
    ) {
      setWelcomeBonusSettings(initialWelcomeBonusSettings);
      setGameplaySettings(initialGameplaySettings);
      setIsModified(true);
    }
  };

  // Handlers for bonus tasks configuration
  const handleGameSelect = (gameId) => {
    setSelectedGameId(gameId);
    setIsModified(false); // Reset modified state when changing games
  };

  const handleTaskSelect = (taskId, order) => {
    // Check maxBonusTasksPerGame limit
    const maxTasks = welcomeBonusSettings.maxBonusTasksPerGame || 3;
    if (order > maxTasks) {
      alert(`Maximum ${maxTasks} bonus tasks allowed per game`);
      return;
    }
    
    setBonusTasksConfig((prev) => {
      const existingIndex = prev.bonusTasks.findIndex(
        (bt) => bt.order === order
      );
      const newBonusTasks = [...prev.bonusTasks];

      // Fixed unlock condition based on order
      const unlockCondition =
        order === 1
          ? "Unlocks immediately when welcome bonus is available."
          : `Unlock this Bonus Task after Bonus Task ${
              order - 1
            } is completed AND Minimum Event Threshold is met.`;

      if (existingIndex >= 0) {
        // Replace existing task at this order
        newBonusTasks[existingIndex] = {
          taskId,
          order,
          unlockCondition,
        };
      } else {
        // Add new task
        newBonusTasks.push({
          taskId,
          order,
          unlockCondition,
        });
        // Sort by order
        newBonusTasks.sort((a, b) => a.order - b.order);
      }

      return {
        ...prev,
        bonusTasks: newBonusTasks,
      };
    });
    setIsModified(true);
  };

  const handleRemoveTask = (order) => {
    setBonusTasksConfig((prev) => ({
      ...prev,
      bonusTasks: prev.bonusTasks.filter((bt) => bt.order !== order),
    }));
    setIsModified(true);
  };

  // Unlock condition is now fixed and cannot be changed
  // This function is kept for backward compatibility but does nothing
  const handleUnlockConditionChange = (order, unlockCondition) => {
    // Unlock condition is fixed based on order, so we don't allow changes
    // The condition is automatically set when task is selected
  };

  const handleMinimumEventThresholdChange = (value) => {
    setBonusTasksConfig((prev) => ({
      ...prev,
      minimumEventThreshold: parseInt(value) || 0,
    }));
    setIsModified(true);
  };

  const handleSaveGameBonusTasks = async () => {
    if (!selectedGameId) {
      alert("Please select a game first");
      return;
    }

    if (bonusTasksConfig.bonusTasks.length === 0) {
      alert("Please select at least one bonus task");
      return;
    }

    // Get maxBonusTasksPerGame from welcome bonus settings
    const maxTasks = welcomeBonusSettings.maxBonusTasksPerGame || 3;
    if (bonusTasksConfig.bonusTasks.length > maxTasks) {
      alert(`Maximum ${maxTasks} bonus tasks allowed per game`);
      return;
    }

    setIsSaving(true);
    try {
      // Map task IDs: if besitos task, find or create GameTask
      const mappedBonusTasks = await Promise.all(
        bonusTasksConfig.bonusTasks.map(async (bt) => {
          const taskData = taskDataMap.get(bt.taskId);
          
          // If task already has MongoDB ID, use it
          if (taskData?.isMongoId || (bt.taskId && /^[0-9a-fA-F]{24}$/.test(bt.taskId))) {
            return {
              taskId: bt.taskId,
              order: bt.order,
              unlockCondition: bt.unlockCondition
            };
          }
          
          // If task is from besitos, find or create GameTask
          if (taskData?.source === 'besitos') {
            try {
              // Try to find existing GameTask by name/description/order
              const findTaskResponse = await apiClient.get(
                `/admin/game-offers/tasks?gameId=${selectedGameId}&search=${encodeURIComponent(taskData.name || '')}`
              );
              
              const existingTasks = findTaskResponse.data.data?.tasks || [];
              let matchingTask = existingTasks.find(t => 
                t.name === taskData.name || 
                t.description === taskData.description ||
                t.order === taskData.order
              );
              
              if (matchingTask) {
                return {
                  taskId: matchingTask.id || matchingTask._id,
                  order: bt.order,
                  unlockCondition: bt.unlockCondition
                };
              }
              
              // If no matching task found, create one from besitos goal
              const createTaskResponse = await apiClient.post(
                `/admin/game-offers/tasks`,
                {
                  gameId: selectedGameId,
                  name: taskData.name || `Task ${bt.order}`,
                  description: taskData.description || taskData.name || '',
                  order: taskData.order || bt.order,
                  completionRule: 'manual',
                  rewardType: 'coins',
                  rewardValue: 0,
                  isActive: true
                }
              );
              
              const newTask = createTaskResponse.data.data;
              return {
                taskId: newTask._id || newTask.id,
                order: bt.order,
                unlockCondition: bt.unlockCondition
              };
            } catch (error) {
              console.error('Error finding/creating task for besitos goal:', error);
              throw new Error(`Failed to create task for "${taskData.name}". Please ensure tasks are created first.`);
            }
          }
          
          // Fallback: return as-is (will fail validation if not valid MongoDB ID)
          return {
            taskId: bt.taskId,
            order: bt.order,
            unlockCondition: bt.unlockCondition
          };
        })
      );

      await welcomeBonusTimerAPI.saveGameBonusTasks(
        selectedGameId,
        {
          ...bonusTasksConfig,
          bonusTasks: mappedBonusTasks
        }
      );
      setIsModified(false);
      setLastSaved(new Date().toISOString());
      alert("Game bonus tasks saved successfully!");
      
      // Refresh tasks to get updated IDs
      const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
          const tasksResponse = await tasksAPI.getTasksForGame(selectedGameId, { limit: 100 });
          const gameResponse = await apiClient.get(`/admin/game-offers/games/${selectedGameId}`);
          const gameData = gameResponse.data.data;
          
          let besitosTasks = [];
          if (gameData.besitosRawData?.goals) {
            besitosTasks = gameData.besitosRawData.goals.map((goal, index) => ({
              id: goal.goal_id || `besitos_${index}`,
              name: goal.text || `Task ${index + 1}`,
              description: goal.description || goal.text || '',
              order: goal.order || index + 1,
              source: 'besitos'
            }));
          }
          
          const combinedTasks = [...(tasksResponse.tasks || [])];
          const newTaskDataMap = new Map();
          
          (tasksResponse.tasks || []).forEach(task => {
            newTaskDataMap.set(task.id, { ...task, source: 'api', isMongoId: true });
          });
          
          besitosTasks.forEach(besitosTask => {
            const exists = combinedTasks.some(t => t.id === besitosTask.id || t.name === besitosTask.name);
            if (!exists) {
              combinedTasks.push(besitosTask);
              newTaskDataMap.set(besitosTask.id, {
                ...besitosTask,
                source: 'besitos',
                isMongoId: false,
                goalId: besitosTask.id,
                goalText: besitosTask.name
              });
            }
          });
          
          combinedTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          setGameTasks(combinedTasks);
          setTaskDataMap(newTaskDataMap);
        } catch (error) {
          console.error('Error refreshing tasks:', error);
        } finally {
          setLoadingTasks(false);
        }
      };
      fetchTasks();
    } catch (error) {
      console.error("Failed to save game bonus tasks:", error);
      alert(
        error.response?.data?.message || error.message ||
          "Failed to save game bonus tasks. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const tabs = [
    {
      id: "welcome-bonus",
      name: "Welcome Bonus Config",
      icon: GiftIcon,
      description: "Configure welcome bonus timer and completion rules",
    },
    {
      id: "gameplay-logic",
      name: "Gameplay Logic Settings",
      icon: Cog6ToothIcon,
      description: "Global game visibility and progression settings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/offers"
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h2 className="text-lg font-semibold text-gray-900">
                  Welcome Bonus Timer Rules
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Configure welcome bonus timing and global gameplay logic
                settings
              </p>
              {lastSaved && (
                <p className="mt-1 text-xs text-gray-500">
                  Last saved: {formatLastSaved(lastSaved)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResetSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={!isModified || isSaving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  !isModified || isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* API Data Section - Show Welcome Bonus Timer Configuration from API */}
          {activeTab === "welcome-bonus" && config && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Current Configuration (from API)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.metadata?.description ||
                      "Welcome bonus timer configuration"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    config.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {config.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {!loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Base Configuration */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      Base Configuration
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unlock Time:</span>
                        <span className="font-medium text-gray-900">
                          {config.unlockTimeHours} hours
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Completion Deadline:
                        </span>
                        <span className="font-medium text-gray-900">
                          {config.completionDeadlineDays} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Game Overrides */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Cog6ToothIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      Game Overrides
                    </h4>
                    {config.gameOverrides && config.gameOverrides.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {config.gameOverrides
                          .slice(0, 2)
                          .map((override, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Game ID:</span>
                                <span className="font-mono text-xs text-gray-900">
                                  {override.gameId.substring(0, 8)}...
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Timer:</span>
                                <span className="font-medium text-gray-900">
                                  {override.unlockTimeHours}h /{" "}
                                  {override.completionDeadlineDays}d
                                </span>
                              </div>
                            </div>
                          ))}
                        {config.gameOverrides.length > 2 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            +{config.gameOverrides.length - 2} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        No game overrides configured
                      </p>
                    )}
                  </div>

                  {/* XP Tier Overrides */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      XP Tier Overrides
                    </h4>
                    {config.xpTierOverrides &&
                    config.xpTierOverrides.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {config.xpTierOverrides.map((tier, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600">XP Range:</span>
                              <span className="font-medium text-gray-900">
                                {tier.minXp}-{tier.maxXp}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Timer:</span>
                              <span className="font-medium text-gray-900">
                                {tier.unlockTimeHours}h /{" "}
                                {tier.completionDeadlineDays}d
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        No XP tier overrides configured
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "welcome-bonus" && (
            <div className="space-y-8">
              {/* Welcome Bonus Config Section */}
              <div>
                <div className="flex items-center mb-6">
                  <GiftIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Welcome Bonus Configuration
                  </h3>
                </div>

                {/* Enable Rule Toggle */}
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Enable Welcome Bonus Timer Rules
                      </h4>
                      <p className="text-sm text-gray-500">
                        Activate timer-based welcome bonus unlock and completion
                        logic
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleWelcomeBonusChange(
                          "enableRule",
                          !welcomeBonusSettings.enableRule
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        welcomeBonusSettings.enableRule
                          ? "bg-indigo-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          welcomeBonusSettings.enableRule
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Timing Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Welcome Bonus Unlock Window
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={welcomeBonusSettings.unlockWindow.value}
                        onChange={(e) =>
                          handleWelcomeBonusTimerChange(
                            "value",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={!welcomeBonusSettings.enableRule}
                      />
                      <select
                        value={welcomeBonusSettings.unlockWindow.unit}
                        onChange={(e) =>
                          handleWelcomeBonusTimerChange("unit", e.target.value)
                        }
                        className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={!welcomeBonusSettings.enableRule}
                      >
                        {timeUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Time window after first game download for bonus to appear
                    </p>
                  </div>

                  {/* PHASE 2: Completion Deadline temporarily hidden */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bonus Completion Deadline
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={welcomeBonusSettings.completionDeadline.value}
                        onChange={(e) => handleCompletionDeadlineChange('value', parseInt(e.target.value) || 1)}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={!welcomeBonusSettings.enableRule}
                      />
                      <select
                        value={welcomeBonusSettings.completionDeadline.unit}
                        onChange={(e) => handleCompletionDeadlineChange('unit', e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={!welcomeBonusSettings.enableRule}
                      >
                        {timeUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum time allowed to complete bonus tasks after unlock
                    </p>
                  </div> */}
                </div>

                {/* Bonus Tasks Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Games with Bonus Tasks
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Number of games (per user) that should have bonus tasks (based on download order)
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={welcomeBonusSettings.maxGamesWithBonusTasks || 3}
                      onChange={(e) =>
                        handleWelcomeBonusChange(
                          "maxGamesWithBonusTasks",
                          parseInt(e.target.value) || 3
                        )
                      }
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={!welcomeBonusSettings.enableRule}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Bonus Tasks Per Game
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Maximum number of bonus tasks that can be configured per game
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={welcomeBonusSettings.maxBonusTasksPerGame || 3}
                      onChange={(e) =>
                        handleWelcomeBonusChange(
                          "maxBonusTasksPerGame",
                          parseInt(e.target.value) || 3
                        )
                      }
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={!welcomeBonusSettings.enableRule}
                    />
                  </div>
                </div>

                {/* PHASE 2: Override Settings temporarily hidden */}
                {/* <div className="space-y-6">
                  <h4 className="text-sm font-medium text-gray-900">Override Settings</h4>

                  <div>
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="override-game"
                        checked={welcomeBonusSettings.overrideByGameId}
                        onChange={(e) => handleWelcomeBonusChange('overrideByGameId', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        disabled={!welcomeBonusSettings.enableRule}
                      />
                      <label htmlFor="override-game" className="ml-2 text-sm font-medium text-gray-700">
                        Override by Game ID
                      </label>
                    </div>
                    {welcomeBonusSettings.overrideByGameId && welcomeBonusSettings.enableRule && (
                      <div className="ml-6">
                        <label className="block text-sm text-gray-600 mb-2">Select Games for Override:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableGames.map(game => (
                            <label key={game.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={welcomeBonusSettings.selectedGames.includes(game.id)}
                                onChange={() => handleGameSelection(game.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{game.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="override-xp"
                        checked={welcomeBonusSettings.overrideByXP}
                        onChange={(e) => handleWelcomeBonusChange('overrideByXP', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        disabled={!welcomeBonusSettings.enableRule}
                      />
                      <label htmlFor="override-xp" className="ml-2 text-sm font-medium text-gray-700">
                        Override by XP Threshold
                      </label>
                    </div>
                    {welcomeBonusSettings.overrideByXP && welcomeBonusSettings.enableRule && (
                      <div className="ml-6">
                        <label className="block text-sm text-gray-600 mb-2">XP Threshold:</label>
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            min="0"
                            value={welcomeBonusSettings.xpThreshold}
                            onChange={(e) => handleWelcomeBonusChange('xpThreshold', parseInt(e.target.value) || 0)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">XP</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Apply custom timing for users above this XP level
                        </p>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Validation Rules Display */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Validation Rules
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Completion deadline must be greater than or equal to
                      unlock window
                    </li>
                    <li>
                      • Unlock window minimum: 1 hour, maximum: 168 hours (7
                      days)
                    </li>
                    <li>
                      • Completion deadline minimum: 1 hour, maximum: 720 hours
                      (30 days)
                    </li>
                    <li>• XP threshold must be a positive number</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gameplay-logic" && (
            <div className="space-y-8">
              {/* Game Selection */}
              <div>
                <div className="flex items-center mb-4">
                  <PlayIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Welcome Bonus Tasks Configuration
                  </h3>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Game
                  </label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => handleGameSelect(e.target.value)}
                    className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Select a game --</option>
                    {availableGames.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.title || game.name} ({game.id})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a game to configure its welcome bonus tasks
                  </p>
                </div>

                {selectedGameId && (
                  <>
                    {/* Minimum Event Threshold */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Event Threshold
                      </label>
                      <div className="relative max-w-xs">
                        <input
                          type="number"
                          min="0"
                          value={bonusTasksConfig.minimumEventThreshold}
                          onChange={(e) =>
                            handleMinimumEventThresholdChange(e.target.value)
                          }
                          disabled={loadingGameConfig}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-20 disabled:bg-gray-100"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            events
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        After how many internal events the Bonus Tasks should
                        unlock
                      </p>
                    </div>

                    {/* Task Logic - Always Sequential (Read-only) */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Logic
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Sequential (Always enabled)
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        Tasks unlock sequentially. Task Logic is always
                        Sequential for Welcome Bonus Tasks.
                      </p>
                    </div>

                    {/* Unlock Flow Explanation */}
                    {bonusTasksConfig.bonusTasks.length > 0 && (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-900 mb-3">
                          Unlock Flow
                        </h4>
                        <div className="space-y-2 text-xs text-green-800">
                          <div className="flex items-start">
                            <span className="font-semibold mr-2">
                              Bonus Task 1:
                            </span>
                            <span>
                              Unlocks immediately when welcome bonus is
                              available.
                            </span>
                          </div>
                          {bonusTasksConfig.bonusTasks
                            .filter((bt) => bt.order > 1)
                            .sort((a, b) => a.order - b.order)
                            .map((bt) => (
                              <div key={bt.order} className="flex items-start">
                                <span className="font-semibold mr-2">
                                  Bonus Task {bt.order}:
                                </span>
                                <span>
                                  Unlocks only after Bonus Task {bt.order - 1} is completed AND
                                  event threshold (
                                  {bonusTasksConfig.minimumEventThreshold} events)
                                  is met.
                                </span>
                              </div>
                            ))}
                          <div className="mt-3 pt-2 border-t border-green-300">
                            <p className="font-semibold">⏱️ Fixed Timer:</p>
                            <p className="mt-1">
                              Each bonus task has a fixed 24-hour timer. Once
                              unlocked, the user has 24 hours to complete the
                              task.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tasks List */}
                    {loadingTasks ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading tasks...
                        </p>
                      </div>
                    ) : gameTasks.length === 0 ? (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          No tasks available for this game. Tasks will be fetched from:
                          <br />• Game API tasks
                          <br />• Game's besitosRawData goals
                          <br />
                          <br />If no tasks appear, the game may not have tasks configured yet.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Bonus Tasks (Up to 3 tasks)
                          </label>
                          <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                            {gameTasks.map((task) => {
                              const isSelected =
                                bonusTasksConfig.bonusTasks.some(
                                  (bt) => bt.taskId === task.id
                                );
                              const selectedOrder = isSelected
                                ? bonusTasksConfig.bonusTasks.find(
                                    (bt) => bt.taskId === task.id
                                  )?.order
                                : null;

                              return (
                                <div
                                  key={task.id}
                                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded hover:bg-gray-50"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            // Find next available order
                                            const usedOrders =
                                              bonusTasksConfig.bonusTasks.map(
                                                (bt) => bt.order
                                              );
                                            let nextOrder = 1;
                                            while (
                                              usedOrders.includes(nextOrder) &&
                                              nextOrder <= 3
                                            ) {
                                              nextOrder++;
                                            }
                                            if (nextOrder <= 3) {
                                              handleTaskSelect(
                                                task.id,
                                                nextOrder
                                              );
                                            } else {
                                              alert(
                                                "Maximum 3 bonus tasks allowed"
                                              );
                                            }
                                          } else {
                                            handleRemoveTask(selectedOrder);
                                          }
                                        }}
                                        disabled={
                                          !isSelected &&
                                          bonusTasksConfig.bonusTasks.length >=
                                            (welcomeBonusSettings.maxBonusTasksPerGame || 3)
                                        }
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">
                                          {task.name}
                                        </div>
                                        {task.description && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {task.description}
                                          </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                          Reward: {task.rewardValue}{" "}
                                          {task.rewardType}
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="mt-2 ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Order: Bonus Task {selectedOrder}
                                        </label>
                                        <div className="text-xs text-gray-600 mt-1">
                                          <strong>Unlock Condition:</strong>
                                          <p className="mt-1 italic">
                                            {selectedOrder === 1
                                              ? "Unlocks immediately when welcome bonus is available."
                                              : `Unlock this Bonus Task after Bonus Task ${
                                                  selectedOrder - 1
                                                } is completed AND Minimum Event Threshold (${
                                                  bonusTasksConfig.minimumEventThreshold
                                                } events) is met.`}
                                          </p>
                                          <p className="mt-2 text-blue-700 font-semibold">
                                            ⏱️ Fixed 24-hour timer: User has 24
                                            hours to complete this bonus task
                                            once unlocked.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <button
                                      onClick={() =>
                                        handleRemoveTask(selectedOrder)
                                      }
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected Bonus Tasks Summary */}
                        {bonusTasksConfig.bonusTasks.length > 0 && (
                          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                            <h4 className="text-sm font-medium text-indigo-900 mb-3">
                              Selected Bonus Tasks
                            </h4>
                            <div className="space-y-2">
                              {bonusTasksConfig.bonusTasks
                                .sort((a, b) => a.order - b.order)
                                .map((bt) => {
                                  const task = gameTasks.find(
                                    (t) => t.id === bt.taskId
                                  );
                                  return (
                                    <div
                                      key={bt.order}
                                      className="flex items-start space-x-2 text-sm"
                                    >
                                      <span className="font-medium text-indigo-700">
                                        Bonus Task {bt.order}:
                                      </span>
                                      <span className="text-indigo-900">
                                        {task?.name || "Unknown Task"}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={handleSaveGameBonusTasks}
                            disabled={
                              isSaving ||
                              bonusTasksConfig.bonusTasks.length === 0
                            }
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              isSaving ||
                              bonusTasksConfig.bonusTasks.length === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {isSaving ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Saving...
                              </>
                            ) : (
                              "Save Bonus Tasks Configuration"
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Summary */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Current Configuration Summary
          </h4>

          {activeTab === "welcome-bonus" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Rule Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    welcomeBonusSettings.enableRule
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {welcomeBonusSettings.enableRule ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Unlock Window:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {welcomeBonusSettings.unlockWindow.value}{" "}
                  {welcomeBonusSettings.unlockWindow.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Completion Deadline:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {welcomeBonusSettings.completionDeadline.value}{" "}
                  {welcomeBonusSettings.completionDeadline.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Overrides:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {[
                    welcomeBonusSettings.overrideByGameId && "Game ID",
                    welcomeBonusSettings.overrideByXP && "XP Tier",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </span>
              </div>
            </div>
          )}

          {activeTab === "gameplay-logic" && (
            <div>
              {selectedGameId ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Selected Game:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {availableGames.find((g) => g.id === selectedGameId)
                        ?.title || selectedGameId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      Minimum Event Threshold:
                    </span>
                    <span className="ml-2 font-medium text-gray-900">
                      {bonusTasksConfig.minimumEventThreshold} events
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Task Logic:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      Sequential (Always enabled)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bonus Tasks:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {bonusTasksConfig.bonusTasks.length} of {welcomeBonusSettings.maxBonusTasksPerGame || 3} selected
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No game selected</div>
              )}
            </div>
          )}
        </div>

        {/* Unsaved Changes Banner */}
        {isModified && (
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-amber-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-amber-800">
                  You have unsaved changes
                </span>
              </div>
              <button
                onClick={handleSaveSettings}
                className="text-sm text-amber-800 hover:text-amber-900 font-medium underline"
              >
                Save Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
