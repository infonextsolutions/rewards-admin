'use client';

import { useState, useEffect, useCallback } from 'react';
import { masterDataAPI } from '../data/masterData';

export function useMasterData() {
  const [data, setData] = useState({
    sdkProviders: [],
    xptrValues: [],
    tierAccess: [],
    countries: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all master data on mount
  const fetchAllMasterData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const masterData = await masterDataAPI.getAllMasterData();
      setData(masterData);
    } catch (err) {
      setError('Failed to load master data. Using defaults.');
      console.error('Error fetching master data:', err);

      // Set fallback data if API fails
      setData({
        sdkProviders: [
          { id: 'bitlabs', name: 'BitLabs' },
          { id: 'adgem', name: 'AdGem' }
        ],
        xptrValues: ['Play 5 minutes', 'Play 10 minutes', 'Complete Level 1'],
        tierAccess: [
          { id: 'free', name: 'Free' },
          { id: 'bronze', name: 'Bronze' },
          { id: 'gold', name: 'Gold' },
          { id: 'platinum', name: 'Platinum' }
        ],
        countries: [
          { code: 'US', name: 'United States' },
          { code: 'IN', name: 'India' }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllMasterData();
  }, [fetchAllMasterData]);

  return {
    sdkProviders: data.sdkProviders,
    xptrValues: data.xptrValues,
    tierAccess: data.tierAccess,
    countries: data.countries,
    loading,
    error,
    refetch: fetchAllMasterData
  };
}
