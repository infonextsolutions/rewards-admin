'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAccountOverviewConfig } from '../../hooks/useAccountOverviewConfig';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OverviewConfigForm from './OverviewConfigForm';

export default function AccountOverviewPage() {
  const { config, loading, fetchConfig, saveConfig } = useAccountOverviewConfig();
  const [saving, setSaving] = useState(false);
  const [milestones, setMilestones] = useState({
    gamesPlayed: { target: 5, reward: { coins: 1000, xp: 500 } },
    coinsEarned: { target: 900, reward: { coins: 100, xp: 50 } },
    challengesCompleted: { target: 3, reward: { coins: 10, xp: 25 } },
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchConfig().then((res) => {
      if (res.success && res.data) {
        const c = res.data;
        const m = c.milestones || {};
        setMilestones({
          gamesPlayed: m.gamesPlayed || { target: 5, reward: { coins: 1000, xp: 500 } },
          coinsEarned: m.coinsEarned || { target: 900, reward: { coins: 100, xp: 50 } },
          challengesCompleted: m.challengesCompleted || { target: 3, reward: { coins: 10, xp: 25 } },
        });
        setIsActive(c.isActive !== undefined ? c.isActive : true);
      }
    }).catch((err) => {
      toast.error('Failed to load config');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMilestoneChange = (type, field, value) => {
    setMilestones((prev) => {
      if (field === 'target') {
        return { ...prev, [type]: { ...prev[type], target: parseInt(value) || 0 } };
      }
      if (field.startsWith('reward.')) {
        const rewardField = field.split('.')[1];
        return {
          ...prev,
          [type]: {
            ...prev[type],
            reward: { ...prev[type].reward, [rewardField]: parseInt(value) || 0 },
          },
        };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveConfig({
        milestones,
        isActive,
      });
      if (res.success) {
        toast.success(res.message || 'Account overview config saved successfully');
        await fetchConfig();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Account Overview Configuration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure milestone rewards and targets shown on the games screen
        </p>
      </div>

      <OverviewConfigForm
        milestones={milestones}
        isActive={isActive}
        onMilestoneChange={handleMilestoneChange}
        onIsActiveChange={setIsActive}
        onSave={handleSave}
        saving={saving}
        configExists={!!config}
        lastUpdated={config?.updatedAt || config?.createdAt}
      />
    </div>
  );
}
