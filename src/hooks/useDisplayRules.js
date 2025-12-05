'use client';

import { useState, useCallback } from 'react';
import { displayRulesAPI } from '../data/displayRules';

export function useDisplayRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch display rules
  const fetchDisplayRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await displayRulesAPI.getDisplayRules();
      setRules(response);
    } catch (err) {
      setError('Failed to load display rules. Please try again.');
      console.error('Error fetching display rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create display rule
  const createDisplayRule = useCallback(async (ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const newRule = await displayRulesAPI.createDisplayRule(ruleData);
      setRules(prev => [...prev, newRule]);
      return newRule;
    } catch (err) {
      setError('Failed to create display rule. Please try again.');
      console.error('Error creating display rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update display rule
  const updateDisplayRule = useCallback(async (ruleId, ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedRule = await displayRulesAPI.updateDisplayRule(ruleId, ruleData);
      setRules(prev => prev.map(rule => rule.id === ruleId ? updatedRule : rule));
      return updatedRule;
    } catch (err) {
      setError('Failed to update display rule. Please try again.');
      console.error('Error updating display rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete display rule
  const deleteDisplayRule = useCallback(async (ruleId) => {
    setLoading(true);
    setError(null);

    try {
      await displayRulesAPI.deleteDisplayRule(ruleId);
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      setError('Failed to delete display rule. Please try again.');
      console.error('Error deleting display rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rules,
    loading,
    error,
    fetchDisplayRules,
    createDisplayRule,
    updateDisplayRule,
    deleteDisplayRule
  };
}
