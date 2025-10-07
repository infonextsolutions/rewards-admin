'use client';

import { useState } from 'react';

export default function OffersTable({ offers, onPreview, onToggleStatus, onUpdateReward, onExport }) {
  const [loadingStates, setLoadingStates] = useState({});
  const [editingReward, setEditingReward] = useState({});
  const [rewardValues, setRewardValues] = useState({});

  const handleToggleStatus = async (offerId, currentStatus) => {
    setLoadingStates(prev => ({ ...prev, [offerId]: true }));
    try {
      await onToggleStatus(offerId, currentStatus);
    } finally {
      setLoadingStates(prev => ({ ...prev, [offerId]: false }));
    }
  };

  const handleRewardEdit = (offerId, currentReward) => {
    setEditingReward(prev => ({ ...prev, [offerId]: true }));
    setRewardValues(prev => ({ ...prev, [offerId]: currentReward }));
  };

  const handleRewardSave = async (offerId) => {
    const newReward = parseInt(rewardValues[offerId]);
    if (isNaN(newReward) || newReward < 0) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`reward_${offerId}`]: true }));
    try {
      await onUpdateReward(offerId, newReward);
      setEditingReward(prev => ({ ...prev, [offerId]: false }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [`reward_${offerId}`]: false }));
    }
  };

  const handleRewardCancel = (offerId) => {
    setEditingReward(prev => ({ ...prev, [offerId]: false }));
    setRewardValues(prev => ({ ...prev, [offerId]: undefined }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Live': 'bg-green-100 text-green-800',
      'Paused': 'bg-yellow-100 text-yellow-800',
      'Draft': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-block min-w-[70px] text-center px-3 py-1.5 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };


  const calculateCompletionRate = (funnel) => {
    if (!funnel.views) return '0%';
    return `${Math.round((funnel.completions / funnel.views) * 100)}%`;
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offer Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SDK Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coin Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Completion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coins Issued
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement Funnel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="font-medium text-gray-900">{offer.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{offer.sdkSource}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{offer.category}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingReward[offer.id] ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={rewardValues[offer.id]}
                        onChange={(e) => setRewardValues(prev => ({ ...prev, [offer.id]: e.target.value }))}
                        className="w-20 px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={loadingStates[`reward_${offer.id}`]}
                      />
                      <button
                        onClick={() => handleRewardSave(offer.id)}
                        disabled={loadingStates[`reward_${offer.id}`]}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRewardCancel(offer.id)}
                        disabled={loadingStates[`reward_${offer.id}`]}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-emerald-600">{offer.coinReward}</div>
                      <button
                        onClick={() => handleRewardEdit(offer.id, offer.coinReward)}
                        className="text-gray-400 hover:text-emerald-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(offer.status)}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offer.status === 'Live'}
                        onChange={() => handleToggleStatus(offer.id, offer.status)}
                        disabled={loadingStates[offer.id]}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full shadow-inner transition-colors relative ${
                        offer.status === 'Live' ? 'bg-emerald-500' : 'bg-gray-300'
                      } ${loadingStates[offer.id] ? 'opacity-50' : ''}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in-out ${
                          offer.status === 'Live' ? 'translate-x-5 bg-white' : 'translate-x-0.5 bg-white'
                        }`} />
                      </div>
                    </label>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{offer.avgCompletionTime}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{offer.coinsIssued.toLocaleString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-600">
                    <div>Views: {offer.engagementFunnel.views}</div>
                    <div>Starts: {offer.engagementFunnel.starts}</div>
                    <div>Completions: {offer.engagementFunnel.completions}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start">
                    <button
                      onClick={() => onPreview(offer)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      Preview
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}