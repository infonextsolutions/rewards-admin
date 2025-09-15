'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SDK_PROVIDERS = ['BitLabs', 'AdGem', 'OfferToro', 'AdGate', 'RevenueUniverse', 'Pollfish'];

export default function EditGameModal({ isOpen, onClose, game, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    sdk: '',
    rewardXP: 0,
    rewardCoins: 0,
    taskCount: 0,
    activeVisible: true,
    fallbackGame: false,
    thumbnail: null
  });

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || '',
        sdk: game.sdk || '',
        rewardXP: game.rewardXP || 0,
        rewardCoins: game.rewardCoins || 0,
        taskCount: game.taskCount || 0,
        activeVisible: game.activeVisible ?? true,
        fallbackGame: game.fallbackGame ?? false,
        thumbnail: game.thumbnail || null
      });
    } else {
      setFormData({
        title: '',
        sdk: '',
        rewardXP: 0,
        rewardCoins: 0,
        taskCount: 0,
        activeVisible: true,
        fallbackGame: false,
        thumbnail: null
      });
    }
  }, [game, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: game?.id || `GAME${Date.now()}`,
      ...formData
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {game ? 'Edit Game' : 'Add New Game'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Basic Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select SDK Game
                  </label>
                  <select
                    value={formData.sdk}
                    onChange={(e) => handleInputChange('sdk', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Choose SDK Game...</option>
                    {SDK_PROVIDERS.map(sdk => (
                      <option key={sdk} value={sdk}>{sdk}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter game title"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    value={formData.rewardXP}
                    onChange={(e) => handleInputChange('rewardXP', parseInt(e.target.value) || 0)}
                    placeholder="Enter XP reward"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coin Reward
                  </label>
                  <input
                    type="number"
                    value={formData.rewardCoins}
                    onChange={(e) => handleInputChange('rewardCoins', parseInt(e.target.value) || 0)}
                    placeholder="Enter coin reward"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Task Count
                  </label>
                  <input
                    type="number"
                    value={formData.taskCount}
                    onChange={(e) => handleInputChange('taskCount', parseInt(e.target.value) || 0)}
                    placeholder="Enter task count"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={formData.activeVisible}
                    onChange={(e) => handleInputChange('activeVisible', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active/Visible</span>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={formData.fallbackGame}
                  onChange={(e) => handleInputChange('fallbackGame', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Default Fallback Game</span>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Game Thumbnail</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                {formData.thumbnail ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="h-24 w-24 object-cover rounded-md mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('thumbnail', null)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm text-gray-600 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Upload Game Thumbnail
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 300x300px
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Save Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
