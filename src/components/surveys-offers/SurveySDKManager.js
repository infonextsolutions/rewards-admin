'use client';

import { useState, useMemo } from 'react';
import SDKTable from './components/SDKTable';
import EditSDKModal from './modals/EditSDKModal';
import AudiencePreviewModal from './modals/AudiencePreviewModal';
import { SURVEY_SDKS } from '../../data/surveys/surveyData';

export default function SurveySDKManager() {
  const [sdks, setSdks] = useState(SURVEY_SDKS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [selectedSDK, setSelectedSDK] = useState(null);

  // Filtered SDKs
  const filteredSDKs = useMemo(() => {
    return sdks.filter(sdk => {
      const matchesSearch = !searchTerm || 
        sdk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sdk.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sdk.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [sdks, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: sdks.length,
      active: sdks.filter(s => s.isActive).length,
      inactive: sdks.filter(s => !s.isActive).length,
      totalAudience: sdks.reduce((sum, s) => sum + s.previewAudienceCount, 0)
    };
  }, [sdks]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleEditSDK = (sdk) => {
    setSelectedSDK(sdk);
    setShowEditModal(true);
  };

  const handlePreviewAudience = (sdk) => {
    setSelectedSDK(sdk);
    setShowAudienceModal(true);
  };

  const handleToggleStatus = async (sdkId) => {
    setSdks(prevSDKs => 
      prevSDKs.map(sdk => 
        sdk.id === sdkId 
          ? { ...sdk, isActive: !sdk.isActive, status: !sdk.isActive ? 'Active' : 'Inactive' }
          : sdk
      )
    );
  };


  const handleSaveSDK = async (sdkId, updatedData) => {
    setSdks(prevSDKs => 
      prevSDKs.map(sdk => 
        sdk.id === sdkId 
          ? { ...sdk, ...updatedData, lastUpdated: new Date().toISOString() }
          : sdk
      )
    );
  };

  const handleAddSDK = () => {
    // For now, just show an alert. In real implementation, this would open an add modal
    alert('Add SDK functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey SDK Manager</h2>
          <p className="text-gray-600 mt-1">Configure and manage third-party survey SDKs</p>
        </div>
        <button
          onClick={handleAddSDK}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add SDK</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total SDKs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active SDKs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">Inactive SDKs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAudience.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Audience</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search SDKs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredSDKs.length} of {sdks.length} SDKs
        {searchTerm && (
          <span> matching &quot;{searchTerm}&quot;</span>
        )}
      </div>

      {/* SDK Table */}
      {filteredSDKs.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No SDKs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search.'
              : 'Get started by adding your first survey SDK.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={handleAddSDK}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Add SDK
              </button>
            </div>
          )}
        </div>
      ) : (
        <SDKTable
          sdks={filteredSDKs}
          onEdit={handleEditSDK}
          onToggleStatus={handleToggleStatus}
          onPreviewAudience={handlePreviewAudience}
        />
      )}

      {/* Modals */}
      <EditSDKModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSDK(null);
        }}
        onSave={handleSaveSDK}
        sdk={selectedSDK}
      />

      <AudiencePreviewModal
        isOpen={showAudienceModal}
        onClose={() => {
          setShowAudienceModal(false);
          setSelectedSDK(null);
        }}
        sdk={selectedSDK}
      />
    </div>
  );
}