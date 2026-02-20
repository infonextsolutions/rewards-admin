'use client'

import { useState } from 'react'
import apiClient from '../lib/apiClient'
import {
  MOCK_XP_TIERS,
  MOCK_XP_DECAY_SETTINGS,
  MOCK_XP_CONVERSIONS,
  MOCK_BONUS_LOGIC,
} from '../data/rewards'

// Use shared apiClient from lib/apiClient.js which has baseURL: "http://localhost:4001/api"
// For rewards endpoints, we'll use paths like "/admin/rewards/xp-decay"

export const useRewards = () => {
  const [xpTiers, setXpTiers] = useState([])
  const [xpDecaySettings, setXpDecaySettings] = useState([])
  const [xpConversions, setXpConversions] = useState([])
  const [bonusLogic, setBonusLogic] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getDataByTab = (activeTab) => {
    switch (activeTab) {
      case 'XP Tiers':
        return xpTiers
      case 'XP Decay Settings':
        return xpDecaySettings
      case 'XP Conversion':
        return xpConversions
      case 'Daily Rewards':
        return [] // Daily Rewards uses a custom component, not a table
      default:
        return []
    }
  }

  // EXCLUDED: Copy of Data KPIs file mapping and audit logging not supported per requirements
  const logAction = (action, activeTab, itemData, itemId = null) => {
    // Audit logging and KPI mapping disabled per requirements
    console.log('Audit logging and KPI file mapping disabled per requirements')

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
  }

  const validateBusinessRules = (
    activeTab,
    itemData,
    itemId = null,
    currentData = null,
  ) => {
    const errors = []

    if (activeTab === 'Bonus Logic') {
      // Check for duplicate active bonus types
      const existingBonuses = currentData || bonusLogic
      const activeBonusOfSameType = existingBonuses.find(
        (bonus) =>
          bonus.bonusType === itemData.bonusType &&
          bonus.active &&
          bonus.id !== itemId,
      )

      if (activeBonusOfSameType && itemData.active) {
        errors.push(
          `Only one active bonus of type "${itemData.bonusType}" is allowed. Please deactivate the existing one first.`,
        )
      }
    }

    if (activeTab === 'XP Tiers') {
      // Check for overlapping XP ranges
      const existingTiers = currentData || xpTiers
      const overlappingTier = existingTiers.find(
        (tier) =>
          tier.id !== itemId &&
          ((itemData.xpMin >= tier.xpMin && itemData.xpMin <= tier.xpMax) ||
            (itemData.xpMax >= tier.xpMin && itemData.xpMax <= tier.xpMax) ||
            (itemData.xpMin <= tier.xpMin && itemData.xpMax >= tier.xpMax)),
      )

      if (overlappingTier) {
        errors.push(
          `XP range overlaps with existing tier "${overlappingTier.tierName}".`,
        )
      }
    }

    return errors
  }

  const updateItem = async (activeTab, itemId, itemData) => {
    setLoading(true)
    try {
      console.log(`Updating ${activeTab} item:`, itemId, itemData)

      // Validate business rules
      const validationErrors = validateBusinessRules(
        activeTab,
        itemData,
        itemId,
      )
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(' '))
      }

      let updatedItem

      switch (activeTab) {
        case 'XP Tiers':
          setXpTiers((prev) =>
            prev.map((item) => {
              if (item.id === itemId) {
                updatedItem = { ...item, ...itemData }
                return updatedItem
              }
              return item
            }),
          )
          break
        case 'XP Decay Settings':
          setXpDecaySettings((prev) =>
            prev.map((item) => {
              if (item.id === itemId) {
                updatedItem = { ...item, ...itemData }
                return updatedItem
              }
              return item
            }),
          )
          break
        case 'XP Conversion':
          setXpConversions((prev) =>
            prev.map((item) => {
              if (item.id === itemId) {
                updatedItem = { ...item, ...itemData }
                return updatedItem
              }
              return item
            }),
          )
          break
        case 'Bonus Logic':
          setBonusLogic((prev) =>
            prev.map((item) => {
              if (item.id === itemId) {
                updatedItem = { ...item, ...itemData }
                return updatedItem
              }
              return item
            }),
          )
          break
      }

      // Log the action
      logAction('UPDATE', activeTab, updatedItem, itemId)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  const addItem = async (activeTab, itemData) => {
    setLoading(true)
    try {
      console.log(`Adding ${activeTab} item:`, itemData)

      // Validate business rules
      const validationErrors = validateBusinessRules(activeTab, itemData)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(' '))
      }

      const newItem = {
        id: Date.now(),
        ...itemData,
        // Add auto-generated fields based on tab
        ...(activeTab === 'XP Tiers' && {
          xpRange: `${itemData.xpMin} - ${itemData.xpMax} XP`,
          iconSrc: itemData.badgeFile
            ? URL.createObjectURL(itemData.badgeFile)
            : 'https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--9@2x.png',
        }),
        ...(activeTab === 'XP Decay Settings' && {
          xpRange:
            itemData.xpRange ||
            `${itemData.xpMin || 0} - ${itemData.xpMax || 999} XP`,
        }),
      }

      switch (activeTab) {
        case 'XP Tiers':
          setXpTiers((prev) => [...prev, newItem])
          break
        case 'XP Decay Settings':
          setXpDecaySettings((prev) => [...prev, newItem])
          break
        case 'XP Conversion':
          setXpConversions((prev) => [...prev, newItem])
          break
        case 'Bonus Logic':
          setBonusLogic((prev) => [...prev, newItem])
          break
      }

      // Log the action
      logAction('CREATE', activeTab, newItem)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  const deleteItem = async (activeTab, itemId) => {
    setLoading(true)
    try {
      console.log(`Deleting ${activeTab} item:`, itemId)

      let deletedItem

      switch (activeTab) {
        case 'XP Tiers':
          deletedItem = xpTiers.find((item) => item.id === itemId)
          setXpTiers((prev) => prev.filter((item) => item.id !== itemId))
          break
        case 'XP Decay Settings':
          deletedItem = xpDecaySettings.find((item) => item.id === itemId)
          setXpDecaySettings((prev) =>
            prev.filter((item) => item.id !== itemId),
          )
          break
        case 'XP Conversion':
          deletedItem = xpConversions.find((item) => item.id === itemId)
          setXpConversions((prev) => prev.filter((item) => item.id !== itemId))
          break
        case 'Bonus Logic':
          deletedItem = bonusLogic.find((item) => item.id === itemId)
          setBonusLogic((prev) => prev.filter((item) => item.id !== itemId))
          break
      }

      // Log the action
      if (deletedItem) {
        logAction('DELETE', activeTab, deletedItem, itemId)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  const toggleItemStatus = async (activeTab, itemId) => {
    const currentData = getDataByTab(activeTab)
    const item = currentData.find((i) => i.id === itemId)
    if (item) {
      await updateItem(activeTab, itemId, { status: !item.status })
    }
  }

  const bulkUpdateStatus = async (activeTab, itemIds, status) => {
    setLoading(true)
    try {
      const promises = itemIds.map((id) =>
        updateItem(activeTab, id, { status }),
      )
      await Promise.all(promises)
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  const fetchBonusLogic = async (filters = {}) => {
    setLoading(true)
    try {
      // Build query parameters - only append if explicitly provided
      const params = {}

      // Only add filters if they are explicitly set (not undefined/null/empty string)
      if (
        filters.status !== undefined &&
        filters.status !== null &&
        filters.status !== ''
      ) {
        params.status = filters.status
      }
      if (
        filters.bonusType !== undefined &&
        filters.bonusType !== null &&
        filters.bonusType !== ''
      ) {
        params.bonusType = filters.bonusType
      }
      if (
        filters.active !== undefined &&
        filters.active !== null &&
        filters.active !== ''
      ) {
        params.active = filters.active
      }
      if (
        filters.category !== undefined &&
        filters.category !== null &&
        filters.category !== ''
      ) {
        params.category = filters.category
      }

      const response = await apiClient.get('/bonus-logic', { params })
      const result = response.data

      if (result.success && result.data) {
        // Transform API data to match the expected format
        const transformedData = result.data.map((item) => ({
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
          updatedAt: item.updatedAt,
        }))

        setBonusLogic(transformedData)
        setLoading(false)
        return { success: true, data: transformedData, total: result.total }
      }

      setLoading(false)
      return { success: false, data: [], total: 0 }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const fetchSingleBonusLogic = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/bonus-logic/${id}`)
      const result = response.data

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
          updatedAt: result.data.updatedAt,
        }

        setLoading(false)
        return { success: true, data: transformedData }
      }

      setLoading(false)
      return { success: false, data: null }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const updateBonusLogic = async (id, data) => {
    setLoading(true)
    try {
      const response = await apiClient.put(`/bonus-logic/${id}`, data)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const deleteBonusLogic = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.delete(`/bonus-logic/${id}`)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const toggleBonusLogicStatus = async (id, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(`/bonus-logic/${id}/status`, {
        status,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const fetchXPTiers = async (filters = {}) => {
    setLoading(true)
    try {
      const params = {}

      if (
        filters.status !== undefined &&
        filters.status !== null &&
        filters.status !== ''
      ) {
        params.status = filters.status
      }

      // CRITICAL FIX: Use XP Tiers V2 API endpoint
      const response = await apiClient.get('/admin/rewards/xp-tiers-v2', {
        params,
      })
      const result = response.data

      if (result.success && result.data) {
        const transformedData = result.data.map((item) => ({
          id: item._id,
          tier: item.tier,
          tierName: item.tier, // Map tier to tierName for compatibility
          xpMin: item.xpMin,
          xpMax: item.xpMax,
          xpRange: item.xpRange,
          accessBenefit: item.accessBenefit,
          accessBenefits: item.accessBenefit, // Map for compatibility
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))

        setXpTiers(transformedData)
        setLoading(false)
        return { success: true, data: transformedData, total: result.total }
      }

      setLoading(false)
      return { success: false, data: [], total: 0 }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const fetchSingleXPTier = async (id) => {
    setLoading(true)
    try {
      // CRITICAL FIX: Use XP Tiers V2 API endpoint
      const response = await apiClient.get(`/admin/rewards/xp-tiers-v2/${id}`)
      const result = response.data

      if (result.success && result.data) {
        const transformedData = {
          id: result.data._id,
          tier: result.data.tier,
          tierName: result.data.tier, // Map tier to tierName for compatibility
          xpMin: result.data.xpMin,
          xpMax: result.data.xpMax,
          xpRange: result.data.xpRange,
          accessBenefit: result.data.accessBenefit,
          accessBenefits: result.data.accessBenefit, // Map for compatibility
          status: result.data.status,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt,
        }

        setLoading(false)
        return { success: true, data: transformedData }
      }

      setLoading(false)
      return { success: false, data: null }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const createXPTier = async (formData) => {
    setLoading(true)
    try {
      // CRITICAL FIX: Map tierName to tier for V2 API
      const data = {
        tier: formData.tierName || formData.tier,
        xpMin: formData.xpMin,
        xpMax: formData.xpMax,
        status: formData.status,
      }

      // CRITICAL FIX: Use XP Tiers V2 API endpoint (JSON, not FormData)
      const response = await apiClient.post('/admin/rewards/xp-tiers-v2', data)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const updateXPTier = async (id, formData) => {
    setLoading(true)
    try {
      // CRITICAL FIX: Map tierName to tier for V2 API
      const data = {
        tier: formData.tierName || formData.tier,
        xpMin: formData.xpMin,
        xpMax: formData.xpMax,
        status: formData.status,
      }

      // CRITICAL FIX: Use XP Tiers V2 API endpoint (JSON, not FormData)
      const response = await apiClient.put(
        `/admin/rewards/xp-tiers-v2/${id}`,
        data,
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const deleteXPTier = async (id) => {
    setLoading(true)
    try {
      // CRITICAL FIX: Use XP Tiers V2 API endpoint
      const response = await apiClient.delete(`/admin/rewards/xp-tiers-v2/${id}`)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const fetchXPDecaySettings = async (filters = {}) => {
    setLoading(true)
    try {
      const params = {}

      if (
        filters.status !== undefined &&
        filters.status !== null &&
        filters.status !== ''
      ) {
        params.status = filters.status
      }
      if (
        filters.tierName !== undefined &&
        filters.tierName !== null &&
        filters.tierName !== ''
      ) {
        params.tierName = filters.tierName
      }
      if (
        filters.decayRuleType !== undefined &&
        filters.decayRuleType !== null &&
        filters.decayRuleType !== ''
      ) {
        params.decayRuleType = filters.decayRuleType
      }

      const response = await apiClient.get('/admin/rewards/xp-decay', {
        params,
      })
      const result = response.data

      if (result.success && result.data) {
        const transformedData = result.data.map((item) => ({
          id: item._id,
          tierName: item.tierName,
          xpRange: item.xpRange,
          xpMin: item.xpMin,
          xpMax: item.xpMax,
          decayRuleType: item.decayRuleType,
          inactivityDuration: item.inactivityDuration,
          inactivityDurationDays: item.inactivityDurationDays,
          minimumXpLimit: item.minimumXpLimit,
          xpDeductionAmount: item.xpDeductionAmount,
          decayPercentage: item.decayPercentage,
          decayPercentageValue: item.decayPercentageValue,
          sendNotification: item.sendNotification,
          notificationToggle:
            item.notificationToggle ?? item.sendNotification ?? false,
          notificationMessage: item.notificationMessage,
          status: item.status,
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))

        setXpDecaySettings(transformedData)
        setLoading(false)
        return { success: true, data: transformedData, total: result.total }
      }

      setLoading(false)
      return { success: false, data: [], total: 0 }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const fetchXPDecaySettingsV2 = async (filters = {}) => {
    setLoading(true)
    try {
      const params = {}
      if (
        filters.status !== undefined &&
        filters.status !== null &&
        filters.status !== ''
      ) {
        params.status = filters.status
      }
      const response = await apiClient.get('/admin/rewards/xp-decay-v2', {
        params,
      })
      const result = response.data
      if (result.success && result.data) {
        const transformedData = result.data.map((item) => ({
          id: item._id,
          ...item,
        }))
        setXpDecaySettings(transformedData)
        setLoading(false)
        return { success: true, data: transformedData, total: result.total }
      }
      setLoading(false)
      return { success: false, data: [], total: 0 }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const fetchSingleXPDecay = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/admin/rewards/xp-decay/${id}`)
      const result = response.data

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
          xpDeductionAmount: result.data.xpDeductionAmount,
          decayPercentage: result.data.decayPercentage,
          decayPercentageValue: result.data.decayPercentageValue,
          sendNotification: result.data.sendNotification,
          notificationMessage: result.data.notificationMessage,
          notificationToggle: result.data.sendNotification,
          status: result.data.status,
          order: result.data.order,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt,
        }

        setLoading(false)
        return { success: true, data: transformedData }
      }

      setLoading(false)
      return { success: false, data: null }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const createXPDecay = async (formData) => {
    setLoading(true)
    try {
      const data = {
        tierName: formData.tierName,
        xpRange: formData.xpRange,
        decayRuleType: formData.decayRuleType,
        inactivityDuration: formData.inactivityDuration,
        minimumXpLimit: formData.minimumXpLimit,
        status: formData.status,
        notificationToggle: formData.notificationToggle,
        xpDeductionAmount: formData.xpDeductionAmount,
      }

      const response = await apiClient.post('/admin/rewards/xp-decay', data)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const updateXPDecay = async (id, formData) => {
    setLoading(true)
    try {
      const data = {
        tierName: formData.tierName,
        xpRange: formData.xpRange,
        decayRuleType: formData.decayRuleType,
        inactivityDuration: formData.inactivityDuration,
        minimumXpLimit: formData.minimumXpLimit,
        status: formData.status,
        notificationToggle: formData.notificationToggle,
        xpDeductionAmount: formData.xpDeductionAmount,
      }

      const response = await apiClient.put(
        `/admin/rewards/xp-decay/${id}`,
        data,
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const deleteXPDecay = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.delete(`/admin/rewards/xp-decay/${id}`)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  // XP Tiers - Additional endpoints
  const toggleXPTierStatus = async (id, status) => {
    setLoading(true)
    try {
      // CRITICAL FIX: Use XP Tiers V2 API endpoint
      const response = await apiClient.patch(`/admin/rewards/xp-tiers-v2/${id}/status`, {
        status,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkUpdateXPTiersStatus = async (ids, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch('/xp-tiers/bulk-status', {
        ids,
        status,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkDeleteXPTiers = async (ids) => {
    setLoading(true)
    try {
      const response = await apiClient.delete('/xp-tiers/bulk-delete', {
        data: { ids },
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  // XP Decay Settings - Additional endpoints
  const toggleXPDecayStatus = async (id, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(`/xp-decay/${id}/status`, {
        status,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const toggleXPDecayNotification = async (id, notificationToggle) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(`/xp-decay/${id}/notification`, {
        notificationToggle,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkUpdateXPDecayStatus = async (ids, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch('/xp-decay/bulk-status', {
        ids,
        status,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkDeleteXPDecay = async (ids) => {
    setLoading(true)
    try {
      const response = await apiClient.delete('/xp-decay/bulk-delete', {
        data: { ids },
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  // Bonus Logic - Additional endpoints
  const toggleBonusLogicActive = async (id, active) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(`/bonus-logic/${id}/active`, {
        active,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkUpdateBonusLogicStatus = async (ids, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch('/bonus-logic/bulk-status', {
        ids,
        status,
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkDeleteBonusLogic = async (ids) => {
    setLoading(true)
    try {
      const response = await apiClient.delete('/bonus-logic/bulk-delete', {
        data: { ids },
      })
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const createBonusLogic = async (formData) => {
    setLoading(true)
    try {
      const data = {
        bonusType: formData.bonusType,
        triggerCondition: formData.triggerCondition,
        rewardValue: formData.rewardValue,
        active: formData.active,
      }

      const response = await apiClient.post('/bonus-logic', data)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  // Daily Rewards V2 API functions
  const fetchDailyRewards = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/admin/daily-rewards-v2/config')
      const result = response.data
      if (result.success && result.data) {
        setLoading(false)
        return { success: true, data: result.data }
      }
      setLoading(false)
      return { success: false, data: null }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const updateDailyRewards = async (data) => {
    setLoading(true)
    try {
      const response = await apiClient.post(
        '/admin/daily-rewards-v2/config',
        data,
      )
      const result = response.data
      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }
      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }
  const fetchSingleXPDecayV2 = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/admin/rewards/xp-decay-v2/${id}`)
      const result = response.data

      if (result.success && result.data) {
        const transformedData = {
          id: result.data._id,
          ...result.data,
        }

        setLoading(false)
        return { success: true, data: transformedData }
      }

      setLoading(false)
      return { success: false, data: null }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const createXPDecayV2 = async (formData) => {
    setLoading(true)
    try {
      const { id, tierName, ...rest } = formData
      // CRITICAL FIX: Map tierName to tier for backend compatibility
      const data = {
        ...rest,
        tier: tierName || formData.tier, // Use tierName from form, fallback to tier if exists
      }
      const response = await apiClient.post('/admin/rewards/xp-decay-v2', data)
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const updateXPDecayV2 = async (id, formData) => {
    setLoading(true)
    try {
      const { tierName, ...rest } = formData
      // CRITICAL FIX: Map tierName to tier for backend compatibility
      const data = {
        ...rest,
        tier: tierName || formData.tier, // Use tierName from form, fallback to tier if exists
      }
      const response = await apiClient.put(
        `/admin/rewards/xp-decay-v2/${id}`,
        data,
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const deleteXPDecayV2 = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.delete(
        `/admin/rewards/xp-decay-v2/${id}`,
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const toggleXPDecayStatusV2 = async (id, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(
        `/admin/rewards/xp-decay-v2/${id}/status`,
        {
          status,
        },
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const toggleXPDecayNotificationV2 = async (id, sendNotification) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(
        `/admin/rewards/xp-decay-v2/${id}/notification`,
        {
          sendNotification,
        },
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkUpdateXPDecayStatusV2 = async (ids, status) => {
    setLoading(true)
    try {
      const response = await apiClient.patch(
        '/admin/rewards/xp-decay-v2/bulk-status',
        {
          ids,
          status,
        },
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, data: result.data, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  const bulkDeleteXPDecayV2 = async (ids) => {
    setLoading(true)
    try {
      const response = await apiClient.post(
        '/admin/rewards/xp-decay-v2/bulk-delete',
        {
          ids,
        },
      )
      const result = response.data

      if (result.success) {
        setLoading(false)
        return { success: true, message: result.message }
      }

      setLoading(false)
      return { success: false }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

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
    toggleBonusLogicActive,
    bulkUpdateBonusLogicStatus,
    bulkDeleteBonusLogic,
    createBonusLogic,
    fetchXPTiers,
    fetchSingleXPTier,
    createXPTier,
    updateXPTier,
    deleteXPTier,
    toggleXPTierStatus,
    bulkUpdateXPTiersStatus,
    bulkDeleteXPTiers,
    fetchXPDecaySettings,
    fetchSingleXPDecay,
    createXPDecay,
    updateXPDecay,
    deleteXPDecay,
    toggleXPDecayStatus,
    toggleXPDecayNotification,
    bulkUpdateXPDecayStatus,
    bulkDeleteXPDecay,
    fetchDailyRewards,
    updateDailyRewards,
    fetchXPDecaySettingsV2,
    fetchSingleXPDecayV2,
    createXPDecayV2,
    updateXPDecayV2,
    deleteXPDecayV2,
    toggleXPDecayStatusV2,
    toggleXPDecayNotificationV2,
    bulkUpdateXPDecayStatusV2,
    bulkDeleteXPDecayV2,
  }
}
