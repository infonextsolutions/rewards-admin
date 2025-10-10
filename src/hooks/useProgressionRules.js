'use client';

import { useState, useCallback } from 'react';
import { progressionRulesAPI } from '../data/progressionRules';

export function useProgressionRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch progression rules
  const fetchProgressionRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await progressionRulesAPI.getProgressionRules();
      setRules(response);
    } catch (err) {
      setError('Failed to load progression rules. Please try again.');
      console.error('Error fetching progression rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create progression rule
  const createProgressionRule = useCallback(async (ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const newRule = await progressionRulesAPI.createProgressionRule(ruleData);
      setRules(prev => [...prev, newRule]);
      return newRule;
    } catch (err) {
      setError('Failed to create progression rule. Please try again.');
      console.error('Error creating progression rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update progression rule
  const updateProgressionRule = useCallback(async (ruleId, ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedRule = await progressionRulesAPI.updateProgressionRule(ruleId, ruleData);
      setRules(prev => prev.map(rule => rule.id === ruleId ? updatedRule : rule));
      return updatedRule;
    } catch (err) {
      setError('Failed to update progression rule. Please try again.');
      console.error('Error updating progression rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rules,
    loading,
    error,
    fetchProgressionRules,
    createProgressionRule,
    updateProgressionRule
  };
}
