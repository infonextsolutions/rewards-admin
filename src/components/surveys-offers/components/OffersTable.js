'use client';

import { useState } from 'react';

export default function OffersTable({ offers, onPreview, onToggleStatus, onExport }) {
  const [loadingStates, setLoadingStates] = useState({});

  const handleToggleStatus = async (offerId) => {
    setLoadingStates(prev => ({ ...prev, [offerId]: true }));
    try {
      await onToggleStatus(offerId);
    } finally {
      setLoadingStates(prev => ({ ...prev, [offerId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Live': 'bg-green-100 text-green-800',
      'Paused': 'bg-yellow-100 text-yellow-800',
      'Draft': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800', 
      'Hard': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[difficulty] || 'bg-gray-100 text-gray-800'}`}>
        {difficulty}
      </span>
    );
  };

  const calculateCompletionRate = (funnel) => {
    if (!funnel.views) return '0%';
    return `${Math.round((funnel.completions / funnel.views) * 100)}%`;
  };

  const getEngagementFunnelChart = (funnel) => {
    const maxValue = funnel.views;
    const startWidth = (funnel.starts / maxValue) * 100;
    const completionWidth = (funnel.completions / maxValue) * 100;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Views</span>
          <span>{funnel.views}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-600 h-1 rounded-full" style={{ width: '100%' }}></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Starts</span>
          <span>{funnel.starts}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${startWidth}%` }}></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Completions</span>
          <span>{funnel.completions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-green-600 h-1 rounded-full" style={{ width: `${completionWidth}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offer Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source & Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward & Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement Funnel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                  <div>
                    <div className="font-medium text-gray-900">{offer.title}</div>
                    <div className="text-sm text-gray-500">{offer.id}</div>
                    <div className="text-sm text-gray-600 mt-1">{offer.description}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      {getDifficultyBadge(offer.difficulty)}
                      <span className="text-xs text-gray-500">{offer.estimatedTime}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{offer.sdkSource}</div>
                    <div className="text-sm text-gray-500">{offer.category}</div>
                    <div className="text-xs text-gray-500 mt-1">{offer.targetAudience}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium text-emerald-600">{offer.coinReward}</span>
                      <span className="text-gray-500 ml-1">coins</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg: {offer.avgCompletionTime}
                    </div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{offer.coinsIssued.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">coins issued</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Rate: {calculateCompletionRate(offer.engagementFunnel)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    {getEngagementFunnelChart(offer.engagementFunnel)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(offer.status)}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offer.status === 'Live'}
                        onChange={() => handleToggleStatus(offer.id)}
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onPreview(offer)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onExport([offer])}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Export
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