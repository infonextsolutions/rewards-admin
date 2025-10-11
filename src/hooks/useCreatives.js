'use client';

import { useState, useCallback } from 'react';
import creativeAPIs from '../data/creatives/creativeAPI';

export function useCreatives() {
  const [creatives, setCreatives] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch creatives with pagination
  const fetchCreatives = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await creativeAPIs.getCreatives({ page, limit });

      if (response.success && response.data) {
        setCreatives(response.data.creatives);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load creatives. Please try again.');
      console.error('Error fetching creatives:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    creatives,
    pagination,
    loading,
    error,
    fetchCreatives
  };
}
