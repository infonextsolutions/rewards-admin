'use client';

export default function OverviewConfigForm({
  milestones,
  isActive,
  onMilestoneChange,
  onIsActiveChange,
  onSave,
  saving,
  configExists,
  lastUpdated,
}) {
  const milestoneLabels = {
    gamesPlayed: { title: 'Games Played', desc: 'Number of games a user needs to play' },
    coinsEarned: { title: 'Coins Earned (Daily)', desc: 'Coins a user needs to earn in a day' },
    challengesCompleted: { title: 'Challenges Finished', desc: 'Challenges a user needs to complete' },
  };

  const milestoneTypes = ['gamesPlayed', 'coinsEarned', 'challengesCompleted'];

  return (
    <div className="space-y-6">
      {milestoneTypes.map((type) => {
        const m = milestones[type] || {};
        const label = milestoneLabels[type];

        return (
          <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{label.title}</h2>
            <p className="text-sm text-gray-500 mb-5">{label.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target 
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={m.target || ''}
                  onChange={(e) => onMilestoneChange(type, 'target', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Coins
                </label>
                <input
                  type="number"
                  min="0"
                  value={m.reward?.coins || ''}
                  onChange={(e) => onMilestoneChange(type, 'reward.coins', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward XP
                </label>
                <input
                  type="number"
                  min="0"
                  value={m.reward?.xp || ''}
                  onChange={(e) => onMilestoneChange(type, 'reward.xp', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Active Status</h2>
            <p className="text-sm text-gray-500">
              When active, users will see these configured rewards on the games screen
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => onIsActiveChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : configExists ? 'Update Configuration' : 'Create Configuration'}
        </button>
        {configExists && lastUpdated && (
          <span className="text-xs text-gray-400">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
