'use client';

import { useState } from 'react';
import { ACCOUNT_OVERVIEW_API } from '../data/accountOverviewData';

const DEFAULT_MILESTONES = {
  gamesPlayed: { target: 5, reward: { coins: 1000, xp: 500 } },
  coinsEarned: { target: 900, reward: { coins: 100, xp: 50 } },
  challengesCompleted: { target: 3, reward: { coins: 10, xp: 25 } },
};

export const useAccountOverviewConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await ACCOUNT_OVERVIEW_API.getConfig();
      if (res.data.success && res.data.data) {
        setConfig(res.data.data);
        setLoading(false);
        return { success: true, data: res.data.data };
      }
      setLoading(false);
      return { success: false };
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await ACCOUNT_OVERVIEW_API.getHistory();
      if (res.data.success && res.data.data) {
        setLoading(false);
        return { success: true, data: res.data.data };
      }
      setLoading(false);
      return { success: false, data: [] };
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const saveConfig = async (data) => {
    setLoading(true);
    try {
      let res;
      const payload = {
        milestones: {
          gamesPlayed: {
            target: data.milestones?.gamesPlayed?.target ?? DEFAULT_MILESTONES.gamesPlayed.target,
            reward: {
              coins: data.milestones?.gamesPlayed?.reward?.coins ?? DEFAULT_MILESTONES.gamesPlayed.reward.coins,
              xp: data.milestones?.gamesPlayed?.reward?.xp ?? DEFAULT_MILESTONES.gamesPlayed.reward.xp,
            },
          },
          coinsEarned: {
            target: data.milestones?.coinsEarned?.target ?? DEFAULT_MILESTONES.coinsEarned.target,
            reward: {
              coins: data.milestones?.coinsEarned?.reward?.coins ?? DEFAULT_MILESTONES.coinsEarned.reward.coins,
              xp: data.milestones?.coinsEarned?.reward?.xp ?? DEFAULT_MILESTONES.coinsEarned.reward.xp,
            },
          },
          challengesCompleted: {
            target: data.milestones?.challengesCompleted?.target ?? DEFAULT_MILESTONES.challengesCompleted.target,
            reward: {
              coins: data.milestones?.challengesCompleted?.reward?.coins ?? DEFAULT_MILESTONES.challengesCompleted.reward.coins,
              xp: data.milestones?.challengesCompleted?.reward?.xp ?? DEFAULT_MILESTONES.challengesCompleted.reward.xp,
            },
          },
        },
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      if (config && config._id) {
        res = await ACCOUNT_OVERVIEW_API.updateConfig(config._id, payload);
      } else {
        res = await ACCOUNT_OVERVIEW_API.createConfig(payload);
      }

      if (res.data.success) {
        setLoading(false);
        return { success: true, data: res.data.data, message: res.data.message };
      }
      setLoading(false);
      return { success: false };
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  return {
    config,
    loading,
    error,
    fetchConfig,
    fetchHistory,
    saveConfig,
  };
};
