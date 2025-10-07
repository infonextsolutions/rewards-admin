'use client';

import { useState, useEffect } from 'react';
import SDKTable from './components/SDKTable';
import EditSDKModal from './modals/EditSDKModal';
import AddSDKModal from './modals/AddSDKModal';
import AudiencePreviewModal from './modals/AudiencePreviewModal';
import Pagination from '../ui/Pagination';
import LoadingSpinner from '../ui/LoadingSpinner';
import surveyAPIs from '../../data/surveys/surveyAPI';
import toast from 'react-hot-toast';

export default function SurveySDKManager() {
  const [sdks, setSdks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [selectedSDK, setSelectedSDK] = useState(null);

  // Fetch SDK list
  const fetchSDKs = async (page = pagination.currentPage) => {
    setLoading(true);
    try {
      const response = await surveyAPIs.getSDKList({
        page,
        limit: pagination.itemsPerPage
      });

      if (response.success) {
        // Map API response to match component structure
        const mappedSDKs = response.data.sdks.map(sdk => ({
          id: sdk._id,
          name: sdk.name,
          displayName: sdk.displayName,
          apiKey: sdk.apiKey,
          status: sdk.isActive ? 'Active' : 'Inactive',
          isActive: sdk.isActive,
          maxDailyUsers: sdk.maxDailyUsers,
          segmentRules: sdk.segmentRules,
          previewAudienceCount: sdk.analytics?.totalViews || 0,
          configuration: sdk.configuration,
          metadata: sdk.metadata,
          analytics: sdk.analytics
        }));

        setSdks(mappedSDKs);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.itemsPerPage
        });
      }
    } catch (error) {
      console.error('Error fetching SDKs:', error);
      toast.error('Failed to load SDKs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSDKs();
  }, []);

  const handlePageChange = (newPage) => {
    fetchSDKs(newPage);
  };

  const handleEditSDK = async (sdk) => {
    try {
      // Fetch full SDK details before opening edit modal
      const response = await surveyAPIs.getSDKDetails(sdk.id);
      if (response.success) {
        // Map API response to component structure
        const sdkDetails = {
          id: response.data._id,
          name: response.data.name,
          displayName: response.data.displayName,
          apiKey: response.data.apiKey,
          baseUrl: response.data.baseUrl,
          status: response.data.isActive ? 'Active' : 'Inactive',
          isActive: response.data.isActive,
          maxDailyUsers: response.data.maxDailyUsers,
          segmentRules: response.data.segmentRules,
          configuration: response.data.configuration,
          metadata: response.data.metadata,
          analytics: response.data.analytics
        };
        setSelectedSDK(sdkDetails);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching SDK details:', error);
      toast.error('Failed to load SDK details');
    }
  };

  const handlePreviewAudience = (sdk) => {
    setSelectedSDK(sdk);
    setShowAudienceModal(true);
  };

  // EXCLUDED: Toggle Live/Paused functionality via API not supported per requirements
  // const handleToggleStatus = async (sdkId) => {
  //   setSdks(prevSDKs =>
  //     prevSDKs.map(sdk =>
  //       sdk.id === sdkId
  //         ? { ...sdk, isActive: !sdk.isActive, status: !sdk.isActive ? 'Active' : 'Inactive' }
  //         : sdk
  //     )
  //   );
  // };


  const handleSaveSDK = async (sdkId, updatedData) => {
    try {
      // Prepare config data for API
      const configData = {
        displayName: updatedData.displayName,
        apiKey: updatedData.apiKey,
        baseUrl: updatedData.baseUrl,
        maxDailyUsers: updatedData.maxDailyUsers,
        configuration: updatedData.configuration
      };

      // Update SDK config
      const configResponse = await surveyAPIs.updateSDKConfig(sdkId, configData);

      if (configResponse.success) {
        // Update segment rules separately
        if (updatedData.segmentRules) {
          const segmentResponse = await surveyAPIs.updateSDKSegmentRules(sdkId, updatedData.segmentRules);

          if (segmentResponse.success) {
            toast.success('SDK and segment rules updated successfully');
          } else {
            // Handle segment rules API error
            toast.error(segmentResponse.error || segmentResponse.message || 'Failed to update segment rules');
            throw new Error(segmentResponse.error || segmentResponse.message);
          }
        } else {
          toast.success(configResponse.message || 'SDK updated successfully');
        }

        // Refresh the SDK list
        await fetchSDKs();
      } else {
        // Handle config API error
        toast.error(configResponse.error || configResponse.message || 'Failed to update SDK');
        throw new Error(configResponse.error || configResponse.message);
      }
    } catch (error) {
      console.error('Error updating SDK:', error);
      toast.error(error.message || 'Failed to update SDK');
      throw error;
    }
  };

  const handleAddSDK = () => {
    setShowAddModal(true);
  };

  const handleAddNewSDK = async (newSDK) => {
    // Refresh the SDK list after adding a new one
    await fetchSDKs(1);
  };

  const handleUpdateSegmentRule = async (sdkId, newSegmentRules) => {
    try {
      const response = await surveyAPIs.updateSDKSegmentRules(sdkId, newSegmentRules);

      if (response.success) {
        toast.success(response.message || 'Segment rules updated successfully');
        // Refresh the SDK list
        await fetchSDKs();
      } else {
        // Handle API response with success: false
        toast.error(response.error || response.message || 'Failed to update segment rules');
        throw new Error(response.error || response.message);
      }
    } catch (error) {
      console.error('Error updating segment rules:', error);
      toast.error(error.message || 'Failed to update segment rules');
      throw error;
    }
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

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner message="Loading SDKs..." />
      ) : (
        <>
          {/* SDK Table */}
          {/* EXCLUDED: Toggle Live/Paused functionality via API not supported per requirements */}
          <SDKTable
            sdks={sdks}
            onEdit={handleEditSDK}
            onPreviewAudience={handlePreviewAudience}
            onUpdateSegmentRule={handleUpdateSegmentRule}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
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

      <AddSDKModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddNewSDK}
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