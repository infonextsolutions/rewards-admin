'use client';

import { useState, useCallback } from 'react';
import { welcomeBonusTimerAPI } from '../data/welcomeBonusTimer';

export function useWelcomeBonusTimer() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch welcome bonus timer configuration
  const fetchWelcomeBonusTimerRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await welcomeBonusTimerAPI.getWelcomeBonusTimerRules();
      setConfig(response);
    } catch (err) {
      setError('Failed to load welcome bonus timer configuration. Please try again.');
      console.error('Error fetching welcome bonus timer configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update welcome bonus timer configuration
  const updateWelcomeBonusTimerRules = useCallback(async (configData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedConfig = await welcomeBonusTimerAPI.updateWelcomeBonusTimerRules(configData);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError('Failed to update welcome bonus timer configuration. Please try again.');
      console.error('Error updating welcome bonus timer configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    config,
    loading,
    error,
    fetchWelcomeBonusTimerRules,
    updateWelcomeBonusTimerRules
  };
}
