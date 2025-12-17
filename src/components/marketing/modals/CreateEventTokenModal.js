'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CreateEventTokenModal({ isOpen, onClose, onSave, categories, editData = null }) {
  const [formData, setFormData] = useState({
    token: '',
    name: '',
    unique: false,
    category: '',
    isS2S: false,
    description: '',
    metadata: {},
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Populate form with edit data
        setFormData({
          token: editData.token || '',
          name: editData.name || '',
          unique: editData.unique || false,
          category: editData.category || '',
          isS2S: editData.isS2S || false,
          description: editData.description || '',
          metadata: editData.metadata || {},
        });
      } else {
        // Reset form when modal opens for create
        setFormData({
          token: '',
          name: '',
          unique: false,
          category: '',
          isS2S: false,
          description: '',
          metadata: {},
        });
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user makes a change
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.token.trim()) {
      newErrors.token = 'Token is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Event Token' : 'Create Event Token'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.token}
              onChange={(e) => handleInputChange('token', e.target.value)}
              disabled={!!editData}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] ${
                errors.token ? 'border-red-500' : 'border-gray-300'
              } ${editData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Enter event token"
            />
            {editData && (
              <p className="mt-1 text-xs text-gray-500">Token cannot be changed</p>
            )}
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">{errors.token}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter event name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
            >
              <option value="">Select category</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.category || cat} value={cat.category || cat}>
                    {cat.category || cat} {cat.count ? `(${cat.count})` : ''}
                  </option>
                ))
              ) : null}
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.unique}
                onChange={(e) => handleInputChange('unique', e.target.checked)}
                className="w-4 h-4 text-[#00a389] border-gray-300 rounded focus:ring-[#00a389]"
              />
              <span className="ml-2 text-sm text-gray-700">Unique</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isS2S}
                onChange={(e) => handleInputChange('isS2S', e.target.checked)}
                className="w-4 h-4 text-[#00a389] border-gray-300 rounded focus:ring-[#00a389]"
              />
              <span className="ml-2 text-sm text-gray-700">S2S Event</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389]"
              placeholder="Enter event description"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#00a389] rounded-md hover:bg-[#008a73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (editData ? 'Updating...' : 'Creating...') 
                : (editData ? 'Update Event Token' : 'Create Event Token')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

