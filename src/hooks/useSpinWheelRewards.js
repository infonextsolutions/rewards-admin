'use client';

import { useState, useCallback } from 'react';
import spinWheelAPIs from '../data/spinWheel/spinWheelAPI';

export function useSpinWheelRewards() {
  const [rewards, setRewards] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [probabilityCheck, setProbabilityCheck] = useState({
    totalProbability: 0,
    isValid: true,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch rewards with pagination
  const fetchRewards = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await spinWheelAPIs.getRewards({ page, limit });

      if (response.success && response.data) {
        setRewards(response.data.rewards);
        setPagination(response.data.pagination);
        setProbabilityCheck(response.data.probabilityCheck);
      }
    } catch (err) {
      setError('Failed to load spin wheel rewards. Please try again.');
      console.error('Error fetching spin wheel rewards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rewards,
    pagination,
    probabilityCheck,
    loading,
    error,
    fetchRewards
  };
}
