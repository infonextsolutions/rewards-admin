'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function BulkImportModal({ isOpen, onClose, onSave }) {
  const [events, setEvents] = useState([
    { token: '', name: '', unique: false }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setEvents([{ token: '', name: '', unique: false }]);
      setErrors({});
    }
  }, [isOpen]);

  const handleEventChange = (index, field, value) => {
    const newEvents = [...events];
    newEvents[index] = {
      ...newEvents[index],
      [field]: value
    };
    setEvents(newEvents);

    // Clear error for this field
    const errorKey = `${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const addEvent = () => {
    setEvents([...events, { token: '', name: '', unique: false }]);
  };

  const removeEvent = (index) => {
    if (events.length > 1) {
      const newEvents = events.filter((_, i) => i !== index);
      setEvents(newEvents);
      
      // Clear errors for removed event
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    events.forEach((event, index) => {
      if (!event.token.trim()) {
        newErrors[`${index}-token`] = 'Token is required';
      }
      if (!event.name.trim()) {
        newErrors[`${index}-name`] = 'Name is required';
      }
    });

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
      await onSave(events);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Event Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
            {events.map((event, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Event {index + 1}</h3>
                  {events.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEvent(index)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Remove event"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={event.token}
                      onChange={(e) => handleEventChange(index, 'token', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] ${
                        errors[`${index}-token`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter token"
                    />
                    {errors[`${index}-token`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`${index}-token`]}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={event.name}
                      onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] ${
                        errors[`${index}-name`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter name"
                    />
                    {errors[`${index}-name`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`${index}-name`]}</p>
                    )}
                  </div>

                  {/* Unique */}
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={event.unique}
                        onChange={(e) => handleEventChange(index, 'unique', e.target.checked)}
                        className="w-4 h-4 text-[#00a389] border-gray-300 rounded focus:ring-[#00a389]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Unique</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Event Button */}
          <button
            type="button"
            onClick={addEvent}
            className="mb-6 flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00a389] bg-[#E6F9EC] rounded-md hover:bg-[#d0fee4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a389]"
          >
            <PlusIcon className="w-5 h-5" />
            Add Another Event
          </button>

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
              {isSubmitting ? 'Importing...' : `Import ${events.length} Event${events.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




