'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    avatar: '',
    preferences: {
      pushNotifications: true,
      preferredGameCategory: '',
      onboardingGoal: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVerificationWarning, setShowVerificationWarning] = useState({
    email: false,
    phone: false
  });

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const gameCategoryOptions = ['Puzzle & Trivia', 'Action Games', 'Strategy', 'Casino', 'Sports'];
  const onboardingGoalOptions = ['Earn Extra Income', 'Entertainment', 'Kill Time', 'Social Gaming'];

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        preferences: {
          pushNotifications: user.preferences?.pushNotifications ?? true,
          preferredGameCategory: user.preferences?.preferredGameCategory || '',
          onboardingGoal: user.preferences?.onboardingGoal || ''
        }
      });
      setErrors({});
      setHasChanges(false);
      setShowVerificationWarning({ email: false, phone: false });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Show verification warnings for sensitive changes
      if (name === 'email' && value !== user?.email) {
        setShowVerificationWarning(prev => ({ ...prev, email: true }));
      }
      if (name === 'phone' && value !== user?.phone) {
        setShowVerificationWarning(prev => ({ ...prev, phone: true }));
      }
    }
    
    setHasChanges(true);
    
    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 64) {
      newErrors.name = 'Name must be between 2-64 characters';
    } else if (!/^[a-zA-Z\s.\-']+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters, spaces, dots, hyphens, and apostrophes';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number with country code (e.g., +1234567890)';
    }
    
    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'User must be at least 13 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim()
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving user profile:', error);
      setErrors({ submit: 'Failed to save changes. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit User Profile</h2>
            <p className="text-sm text-gray-600 mt-1">Update user information and preferences</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Verification Warnings */}
        {(showVerificationWarning.email || showVerificationWarning.phone) && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {showVerificationWarning.email && (
                    <p>• Changing the email will require re-verification and may sign the user out.</p>
                  )}
                  {showVerificationWarning.phone && (
                    <p>• Changing the phone number will require OTP re-verification.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">👤</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black ${
                      errors.dateOfBirth ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black ${
                      errors.phone ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <input
                    id="pushNotifications"
                    name="preferences.pushNotifications"
                    type="checkbox"
                    checked={formData.preferences.pushNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                    Push Notifications
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="preferredGameCategory" className="block text-sm font-medium text-gray-700">
                      Preferred Game Category
                    </label>
                    <select
                      id="preferredGameCategory"
                      name="preferences.preferredGameCategory"
                      value={formData.preferences.preferredGameCategory}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                    >
                      <option value="">Select category</option>
                      {gameCategoryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="onboardingGoal" className="block text-sm font-medium text-gray-700">
                      Onboarding Goal
                    </label>
                    <select
                      id="onboardingGoal"
                      name="preferences.onboardingGoal"
                      value={formData.preferences.onboardingGoal}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                    >
                      <option value="">Select goal</option>
                      {onboardingGoalOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Read-only Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">User ID:</span>
                    <span className="ml-2 text-gray-900">{user?.userId}</span>
                    <span className="ml-2 text-gray-400">🔒</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Tier:</span>
                    <span className="ml-2 text-gray-900">{user?.tier}</span>
                    <span className="ml-2 text-gray-400">🔒</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Registration Date:</span>
                    <span className="ml-2 text-gray-900">Jan 15, 2024</span>
                    <span className="ml-2 text-gray-400">🔒</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-900">{user?.status}</span>
                    <span className="ml-2 text-gray-400">🔒</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">🔒 = Managed by system</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !hasChanges}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || !hasChanges
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;