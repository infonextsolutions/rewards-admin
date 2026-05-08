'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AD_REWARD_API } from '../../data/adReward';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdRewardPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(50);
  const [cooldownHours, setCooldownHours] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await AD_REWARD_API.getConfig();
      if (res.data.success && res.data.data) {
        const c = res.data.data;
        setConfig(c);
        setCoins(c.coins);
        setCooldownHours(c.cooldownHours);
        setIsActive(c.isActive);
        setDescription(c.description || '');
      }
    } catch (err) {
      toast.error('Failed to load ad reward config');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (coins < 0) {
      toast.error('Coins must be 0 or more');
      return;
    }
    if (cooldownHours < 0) {
      toast.error('Cooldown hours must be 0 or more');
      return;
    }

    setSaving(true);
    try {
      const payload = { coins, cooldownHours, isActive, description };
      let res;

      if (config) {
        res = await AD_REWARD_API.updateConfig(config._id, payload);
      } else {
        res = await AD_REWARD_API.createConfig(payload);
      }

      if (res.data.success) {
        toast.success(config ? 'Config updated successfully' : 'Config created successfully');
        fetchConfig();
      }
    } catch (err) {
      toast.error('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ad Reward Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure coin rewards and cooldown for watching ads
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coins per Ad
            </label>
            <input
              type="number"
              min="0"
              value={coins}
              onChange={(e) => setCoins(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              Number of coins awarded when a user watches an ad
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cooldown (hours)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={cooldownHours}
              onChange={(e) => setCooldownHours(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              How long a user must wait before claiming another ad reward
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Watch ads and earn coins"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Active</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : config ? 'Update Config' : 'Create Config'}
          </button>
          {config && (
            <span className="text-xs text-gray-400">
              Last updated: {new Date(config.updatedAt || config.createdAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
