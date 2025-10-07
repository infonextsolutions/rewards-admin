'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  MOCK_XP_TIERS,
  MOCK_XP_DECAY_SETTINGS,
  MOCK_XP_CONVERSIONS,
  MOCK_BONUS_LOGIC
} from '../data/rewards';

const API_BASE = 'https://rewardsapi.hireagent.co/api/admin/rewards';

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const useRewards = () => {
  const [xpTiers, setXpTiers] = useState([]);
  const [xpDecaySettings, setXpDecaySettings] = useState([]);
  const [xpConversions, setXpConversions] = useState([]);
  const [bonusLogic, setBonusLogic] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDataByTab = (activeTab) => {
    switch (activeTab) {
      case "XP Tiers":
        return xpTiers;
      case "XP Decay Settings":
        return xpDecaySettings;
      case "XP Conversion":
        return xpConversions;
      case "Bonus Logic":
        return bonusLogic;
      default:
        return [];
    }
  };

  // EXCLUDED: Copy of Data KPIs file mapping and audit logging not supported per requirements
  const logAction = (action, activeTab, itemData, itemId = null) => {
    // Audit logging and KPI mapping disabled per requirements
    console.log('Audit logging and KPI file mapping disabled per requirements');

    /* ORIGINAL CODE - COMMENTED OUT
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      tab: activeTab,
      itemId,
      itemData: { ...itemData },
      admin: 'Admin User', // This would come from auth context in real app
    };
    setAuditLogs(prev => [logEntry, ...prev]);
    */
  };

  const validateBusinessRules = (activeTab, itemData, itemId = null, currentData = null) => {
    const errors = [];

    if (activeTab === 'Bonus Logic') {
      // Check for duplicate active bonus types
      const existingBonuses = currentData || bonusLogic;
      const activeBonusOfSameType = existingBonuses.find(
        bonus => bonus.bonusType === itemData.bonusType && 
                 bonus.active && 
                 bonus.id !== itemId
      );
      
      if (activeBonusOfSameType && itemData.active) {
        errors.push(`Only one active bonus of type "${itemData.bonusType}" is allowed. Please deactivate the existing one first.`);
      }
    }

    if (activeTab === 'XP Tiers') {
      // Check for overlapping XP ranges
      const existingTiers = currentData || xpTiers;
      const overlappingTier = existingTiers.find(
        tier => tier.id !== itemId && 
               ((itemData.xpMin >= tier.xpMin && itemData.xpMin <= tier.xpMax) ||
                (itemData.xpMax >= tier.xpMin && itemData.xpMax <= tier.xpMax) ||
                (itemData.xpMin <= tier.xpMin && itemData.xpMax >= tier.xpMax))
      );
      
      if (overlappingTier) {
        errors.push(`XP range overlaps with existing tier "${overlappingTier.tierName}".`);
      }
    }

    return errors;
  };

  const updateItem = async (activeTab, itemId, itemData) => {
    setLoading(true);
    try {
      console.log(`Updating ${activeTab} item:`, itemId, itemData);
      
      // Validate business rules
      const validationErrors = validateBusinessRules(activeTab, itemData, itemId);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(' '));
      }

      let updatedItem;
      
      switch (activeTab) {
        case "XP Tiers":
          setXpTiers(prev => prev.map(item => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...itemData };
              return updatedItem;
            }
            return item;
          }));
          break;
        case "XP Decay Settings":
          setXpDecaySettings(prev => prev.map(item => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...itemData };
              return updatedItem;
            }
            return item;
          }));
          break;
        case "XP Conversion":
          setXpConversions(prev => prev.map(item => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...itemData };
              return updatedItem;
            }
            return item;
          }));
          break;
        case "Bonus Logic":
          setBonusLogic(prev => prev.map(item => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...itemData };
              return updatedItem;
            }
            return item;
          }));
          break;
      }
      
      // Log the action
      logAction('UPDATE', activeTab, updatedItem, itemId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const addItem = async (activeTab, itemData) => {
    setLoading(true);
    try {
      console.log(`Adding ${activeTab} item:`, itemData);
      
      // Validate business rules
      const validationErrors = validateBusinessRules(activeTab, itemData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(' '));
      }
      
      const newItem = {
        id: Date.now(),
        ...itemData,
        // Add auto-generated fields based on tab
        ...(activeTab === 'XP Tiers' && {
          xpRange: `${itemData.xpMin} - ${itemData.xpMax} XP`,
          iconSrc: itemData.badgeFile ? URL.createObjectURL(itemData.badgeFile) : "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--9@2x.png"
        }),
        ...(activeTab === 'XP Decay Settings' && {
          xpRange: itemData.xpRange || `${itemData.xpMin || 0} - ${itemData.xpMax || 999} XP`
        })
      };

      switch (activeTab) {
        case "XP Tiers":
          setXpTiers(prev => [...prev, newItem]);
          break;
        case "XP Decay Settings":
          setXpDecaySettings(prev => [...prev, newItem]);
          break;
        case "XP Conversion":
          setXpConversions(prev => [...prev, newItem]);
          break;
        case "Bonus Logic":
          setBonusLogic(prev => [...prev, newItem]);
          break;
      }
      
      // Log the action
      logAction('CREATE', activeTab, newItem);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteItem = async (activeTab, itemId) => {
    setLoading(true);
    try {
      console.log(`Deleting ${activeTab} item:`, itemId);
      
      let deletedItem;
      
      switch (activeTab) {
        case "XP Tiers":
          deletedItem = xpTiers.find(item => item.id === itemId);
          setXpTiers(prev => prev.filter(item => item.id !== itemId));
          break;
        case "XP Decay Settings":
          deletedItem = xpDecaySettings.find(item => item.id === itemId);
          setXpDecaySettings(prev => prev.filter(item => item.id !== itemId));
          break;
        case "XP Conversion":
          deletedItem = xpConversions.find(item => item.id === itemId);
          setXpConversions(prev => prev.filter(item => item.id !== itemId));
          break;
        case "Bonus Logic":
          deletedItem = bonusLogic.find(item => item.id === itemId);
          setBonusLogic(prev => prev.filter(item => item.id !== itemId));
          break;
      }
      
      // Log the action
      if (deletedItem) {
        logAction('DELETE', activeTab, deletedItem, itemId);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const toggleItemStatus = async (activeTab, itemId) => {
    const currentData = getDataByTab(activeTab);
    const item = currentData.find(i => i.id === itemId);
    if (item) {
      await updateItem(activeTab, itemId, { status: !item.status });
    }
  };

  const bulkUpdateStatus = async (activeTab, itemIds, status) => {
    setLoading(true);
    try {
      const promises = itemIds.map(id => updateItem(activeTab, id, { status }));
      await Promise.all(promises);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const fetchBonusLogic = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query parameters - only append if explicitly provided
      const params = {};

      // Only add filters if they are explicitly set (not undefined/null/empty string)
      if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.bonusType !== undefined && filters.bonusType !== null && filters.bonusType !== '') {
        params.bonusType = filters.bonusType;
      }
      if (filters.active !== undefined && filters.active !== null && filters.active !== '') {
        params.active = filters.active;
      }
      if (filters.category !== undefined && filters.category !== null && filters.category !== '') {
        params.category = filters.category;
      }

      const response = await apiClient.get('/bonus-logic', { params });
      const result = response.data;

      if (result.success && result.data) {
        // Transform API data to match the expected format
        const transformedData = result.data.map(item => ({
          id: item._id,
          bonusType: item.bonusType,
          triggerCondition: item.triggerCondition,
          rewardValue: item.rewardValue,
          rewardDetails: item.rewardDetails,
          conditions: item.conditions,
          notification: item.notification,
          active: item.active,
          status: item.status,
          priority: item.priority,
          order: item.order,
          metadata: item.metadata,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        setBonusLogic(transformedData);
        setLoading(false);
        return { success: true, data: transformedData, total: result.total };
      }

      setLoading(false);
      return { success: false, data: [], total: 0 };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const fetchSingleBonusLogic = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/bonus-logic/${id}`);
      const result = response.data;

      if (result.success && result.data) {
        // Transform API data to match the expected format
        const transformedData = {
          id: result.data._id,
          bonusType: result.data.bonusType,
          triggerCondition: result.data.triggerCondition,
          rewardValue: result.data.rewardValue,
          rewardDetails: result.data.rewardDetails,
          conditions: result.data.conditions,
          notification: result.data.notification,
          active: result.data.active,
          status: result.data.status,
          priority: result.data.priority,
          order: result.data.order,
          metadata: result.data.metadata,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };

        setLoading(false);
        return { success: true, data: transformedData };
      }

      setLoading(false);
      return { success: false, data: null };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const updateBonusLogic = async (id, data) => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/bonus-logic/${id}`, data);
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, data: result.data, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteBonusLogic = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.delete(`/bonus-logic/${id}`);
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const toggleBonusLogicStatus = async (id, status) => {
    setLoading(true);
    try {
      const response = await apiClient.patch(`/bonus-logic/${id}/status`, { status });
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, data: result.data, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const fetchXPTiers = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};

      if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.tierName !== undefined && filters.tierName !== null && filters.tierName !== '') {
        params.tierName = filters.tierName;
      }
      if (filters.xpRange !== undefined && filters.xpRange !== null && filters.xpRange !== '') {
        params.xpRange = filters.xpRange;
      }

      const response = await apiClient.get('/xp-tiers', { params });
      const result = response.data;

      if (result.success && result.data) {
        const transformedData = result.data.map(item => ({
          id: item._id,
          tierName: item.tierName,
          tierColor: item.tierColor,
          bgColor: item.bgColor,
          borderColor: item.borderColor,
          iconSrc: item.iconSrc,
          xpMin: item.xpMin,
          xpMax: item.xpMax,
          xpRange: item.xpRange,
          badge: item.badge,
          badgeFile: item.badgeFile,
          accessBenefits: item.accessBenefits,
          benefits: item.benefits,
          multipliers: item.multipliers,
          requirements: item.requirements,
          status: item.status,
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        setXpTiers(transformedData);
        setLoading(false);
        return { success: true, data: transformedData, total: result.total };
      }

      setLoading(false);
      return { success: false, data: [], total: 0 };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const fetchSingleXPTier = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/xp-tiers/${id}`);
      const result = response.data;

      if (result.success && result.data) {
        const transformedData = {
          id: result.data._id,
          tierName: result.data.tierName,
          tierColor: result.data.tierColor,
          bgColor: result.data.bgColor,
          borderColor: result.data.borderColor,
          iconSrc: result.data.iconSrc,
          xpMin: result.data.xpMin,
          xpMax: result.data.xpMax,
          xpRange: result.data.xpRange,
          badge: result.data.badge,
          badgeFile: result.data.badgeFile,
          accessBenefits: result.data.accessBenefits,
          benefits: result.data.benefits,
          multipliers: result.data.multipliers,
          requirements: result.data.requirements,
          status: result.data.status,
          order: result.data.order,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };

        setLoading(false);
        return { success: true, data: transformedData };
      }

      setLoading(false);
      return { success: false, data: null };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const createXPTier = async (formData) => {
    setLoading(true);
    try {
      // Create FormData for multipart/form-data request
      const data = new FormData();
      data.append('tierName', formData.tierName);
      data.append('xpMin', formData.xpMin);
      data.append('xpMax', formData.xpMax);
      data.append('accessBenefits', formData.accessBenefits);
      data.append('status', formData.status);

      // Add badge file if provided
      if (formData.badgeFile) {
        data.append('badgeFile', formData.badgeFile);
      }

      const response = await apiClient.post('/xp-tiers', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, data: result.data, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const updateXPTier = async (id, formData) => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('tierName', formData.tierName);
      data.append('xpMin', formData.xpMin);
      data.append('xpMax', formData.xpMax);
      data.append('accessBenefits', formData.accessBenefits);
      data.append('status', formData.status);

      // Add badge file if provided
      if (formData.badgeFile) {
        data.append('badgeFile', formData.badgeFile);
      }

      const response = await apiClient.put(`/xp-tiers/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, data: result.data, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteXPTier = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.delete(`/xp-tiers/${id}`);
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const fetchXPDecaySettings = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};

      if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.tierName !== undefined && filters.tierName !== null && filters.tierName !== '') {
        params.tierName = filters.tierName;
      }
      if (filters.decayRuleType !== undefined && filters.decayRuleType !== null && filters.decayRuleType !== '') {
        params.decayRuleType = filters.decayRuleType;
      }

      const response = await apiClient.get('/xp-decay', { params });
      const result = response.data;

      if (result.success && result.data) {
        const transformedData = result.data.map(item => ({
          id: item._id,
          tierName: item.tierName,
          xpRange: item.xpRange,
          xpMin: item.xpMin,
          xpMax: item.xpMax,
          decayRuleType: item.decayRuleType,
          inactivityDuration: item.inactivityDuration,
          inactivityDurationDays: item.inactivityDurationDays,
          minimumXpLimit: item.minimumXpLimit,
          decayPercentage: item.decayPercentage,
          decayPercentageValue: item.decayPercentageValue,
          sendNotification: item.sendNotification,
          notificationMessage: item.notificationMessage,
          status: item.status,
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        setXpDecaySettings(transformedData);
        setLoading(false);
        return { success: true, data: transformedData, total: result.total };
      }

      setLoading(false);
      return { success: false, data: [], total: 0 };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const fetchSingleXPDecay = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/xp-decay/${id}`);
      const result = response.data;

      if (result.success && result.data) {
        const transformedData = {
          id: result.data._id,
          tierName: result.data.tierName,
          xpRange: result.data.xpRange,
          xpMin: result.data.xpMin,
          xpMax: result.data.xpMax,
          decayRuleType: result.data.decayRuleType,
          inactivityDuration: result.data.inactivityDuration,
          inactivityDurationDays: result.data.inactivityDurationDays,
          minimumXpLimit: result.data.minimumXpLimit,
          decayPercentage: result.data.decayPercentage,
          decayPercentageValue: result.data.decayPercentageValue,
          sendNotification: result.data.sendNotification,
          notificationMessage: result.data.notificationMessage,
          notificationToggle: result.data.sendNotification,
          status: result.data.status,
          order: result.data.order,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };

        setLoading(false);
        return { success: true, data: transformedData };
      }

      setLoading(false);
      return { success: false, data: null };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const createXPDecay = async (formData) => {
    setLoading(true);
    try {
      const data = {
        tierName: formData.tierName,
        xpRange: formData.xpRange,
        decayRuleType: formData.decayRuleType,
        inactivityDuration: formData.inactivityDuration,
        minimumXpLimit: formData.minimumXpLimit,
        status: formData.status,
        notificationToggle: formData.notificationToggle
      };

      const response = await apiClient.post('/xp-decay', data);
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, data: result.data, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const updateXPDecay = async (id, formData) => {
    setLoading(true);
    try {
      const data = {
        tierName: formData.tierName,
        xpRange: formData.xpRange,
        decayRuleType: formData.decayRuleType,
        inactivityDuration: formData.inactivityDuration,
        minimumXpLimit: formData.minimumXpLimit,
        status: formData.status,
        notificationToggle: formData.notificationToggle
      };

      const response = await apiClient.put(`/xp-decay/${id}`, data);
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, data: result.data, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteXPDecay = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.delete(`/xp-decay/${id}`);
      const result = response.data;

      if (result.success) {
        setLoading(false);
        return { success: true, message: result.message };
      }

      setLoading(false);
      return { success: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    xpTiers,
    xpDecaySettings,
    xpConversions,
    bonusLogic,
    auditLogs,
    loading,
    error,
    getDataByTab,
    updateItem,
    addItem,
    deleteItem,
    toggleItemStatus,
    bulkUpdateStatus,
    validateBusinessRules,
    fetchBonusLogic,
    fetchSingleBonusLogic,
    updateBonusLogic,
    deleteBonusLogic,
    toggleBonusLogicStatus,
    fetchXPTiers,
    fetchSingleXPTier,
    createXPTier,
    updateXPTier,
    deleteXPTier,
    fetchXPDecaySettings,
    fetchSingleXPDecay,
    createXPDecay,
    updateXPDecay,
    deleteXPDecay,
  };
};