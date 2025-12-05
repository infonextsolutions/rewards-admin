'use client';

import { useState, useCallback } from 'react';
import { progressionRulesAPI } from '../data/progressionRules';

export function useProgressionRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch progression rules
  const fetchProgressionRules = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await progressionRulesAPI.getProgressionRules(params);
      // Handle both old format (array) and new format (object with rules and pagination)
      if (Array.isArray(response)) {
        setRules(response);
        setPagination({
          page: 1,
          limit: response.length,
          total: response.length,
          pages: 1
        });
      } else {
        setRules(response.rules || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: response.rules?.length || 0,
          pages: 1
        });
      }
    } catch (err) {
      setError('Failed to load progression rules. Please try again.');
      console.error('Error fetching progression rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create progression rule
  const createProgressionRule = useCallback(async (gameId, ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const newRule = await progressionRulesAPI.createProgressionRule(gameId, ruleData);
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
  const updateProgressionRule = useCallback(async (gameId, ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedRule = await progressionRulesAPI.updateProgressionRule(gameId, ruleData);
      setRules(prev => prev.map(rule => rule.gameId === gameId ? updatedRule : rule));
      return updatedRule;
    } catch (err) {
      setError('Failed to update progression rule. Please try again.');
      console.error('Error updating progression rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete progression rule
  const deleteProgressionRule = useCallback(async (gameId) => {
    setLoading(true);
    setError(null);

    try {
      await progressionRulesAPI.deleteProgressionRule(gameId);
      setRules(prev => prev.filter(rule => rule.gameId !== gameId));
      return true;
    } catch (err) {
      setError('Failed to delete progression rule. Please try again.');
      console.error('Error deleting progression rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rules,
    loading,
    error,
    pagination,
    fetchProgressionRules,
    createProgressionRule,
    updateProgressionRule,
    deleteProgressionRule
  };
}
