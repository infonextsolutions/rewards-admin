'use client';

import { useState } from 'react';
import { 
  MOCK_XP_TIERS, 
  MOCK_XP_DECAY_SETTINGS, 
  MOCK_XP_CONVERSIONS, 
  MOCK_BONUS_LOGIC 
} from '../data/rewards';

export const useRewards = () => {
  const [xpTiers, setXpTiers] = useState(MOCK_XP_TIERS);
  const [xpDecaySettings, setXpDecaySettings] = useState(MOCK_XP_DECAY_SETTINGS);
  const [xpConversions, setXpConversions] = useState(MOCK_XP_CONVERSIONS);
  const [bonusLogic, setBonusLogic] = useState(MOCK_BONUS_LOGIC);
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

  const updateItem = async (activeTab, itemId, itemData) => {
    setLoading(true);
    try {
      console.log(`Updating ${activeTab} item:`, itemId, itemData);
      
      switch (activeTab) {
        case "XP Tiers":
          setXpTiers(prev => prev.map(item => 
            item.id === itemId ? { ...item, ...itemData } : item
          ));
          break;
        case "XP Decay Settings":
          setXpDecaySettings(prev => prev.map(item => 
            item.id === itemId ? { ...item, ...itemData } : item
          ));
          break;
        case "XP Conversion":
          setXpConversions(prev => prev.map(item => 
            item.id === itemId ? { ...item, ...itemData } : item
          ));
          break;
        case "Bonus Logic":
          setBonusLogic(prev => prev.map(item => 
            item.id === itemId ? { ...item, ...itemData } : item
          ));
          break;
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

  const addItem = async (activeTab, itemData) => {
    setLoading(true);
    try {
      console.log(`Adding ${activeTab} item:`, itemData);
      
      const newItem = {
        id: Date.now(),
        ...itemData,
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
      
      switch (activeTab) {
        case "XP Tiers":
          setXpTiers(prev => prev.filter(item => item.id !== itemId));
          break;
        case "XP Decay Settings":
          setXpDecaySettings(prev => prev.filter(item => item.id !== itemId));
          break;
        case "XP Conversion":
          setXpConversions(prev => prev.filter(item => item.id !== itemId));
          break;
        case "Bonus Logic":
          setBonusLogic(prev => prev.filter(item => item.id !== itemId));
          break;
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

  return {
    xpTiers,
    xpDecaySettings,
    xpConversions,
    bonusLogic,
    loading,
    error,
    getDataByTab,
    updateItem,
    addItem,
    deleteItem,
  };
};