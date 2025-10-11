'use client';

import React, { useState, useEffect } from "react";
import { useSearch } from "../../contexts/SearchContext";
import { useCreatives } from "../../hooks/useCreatives";
import creativeAPIs from "../../data/creatives/creativeAPI";
import toast from 'react-hot-toast';
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Frame from "./components/Frame";
import UploadTable from "./components/UploadTable";
import TrackerTable from "./components/TrackerTable";
import AddEditCreativeModal from "./components/modals/AddEditCreativeModal";
import PreviewModal from "./components/modals/PreviewModal";
import ViewDetailsModal from "./components/modals/ViewDetailsModal";
import DeleteModal from "./components/modals/DeleteModal";


// Main Component
export default function CreativeManagementPage() {
  const { searchTerm, registerSearchHandler } = useSearch();
  const { creatives, pagination, loading, error, fetchCreatives } = useCreatives();
  const [activeTab, setActiveTab] = useState("upload");
  const [filters, setFilters] = useState({
    dateRange: null,
    placement: null,
    pid: null,
    segment: null,
    status: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [modals, setModals] = useState({
    addEdit: false,
    preview: false,
    view: false,
    delete: false
  });
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 10;

  // Fetch creatives on mount and when page changes
  useEffect(() => {
    fetchCreatives(currentPage, itemsPerPage);
  }, [currentPage, fetchCreatives]);

  useEffect(() => {
    registerSearchHandler((query) => {
      setCurrentPage(1);
    });
  }, [registerSearchHandler]);

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredData = creatives.filter(creative => {
    // Exclude soft-deleted items
    if (creative.isDeleted) return false;

    const matchesSearch = searchTerm === "" ||
      creative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.campaignPID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.placement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.segment.toLowerCase().includes(searchTerm.toLowerCase());

    // EXCLUDED: Placement, PID, and Segment filtering disabled per requirements
    // const matchesPlacement = !filters.placement || filters.placement === "All Placements" || creative.placement === filters.placement;
    // const matchesPID = !filters.pid || filters.pid === "All PIDs" || creative.campaignPID === filters.pid;
    // const matchesSegment = !filters.segment || filters.segment === "All Segments" ||
    //   creative.segment.split(', ').some(seg => seg.trim() === filters.segment);
    const matchesStatus = !filters.status || filters.status === "All Status" || creative.status === filters.status;

    // EXCLUDED: Only use search and status filtering per requirements
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData;

  // Modal handlers
  const openModal = (modalType, creative = null) => {
    setSelectedCreative(creative);
    setModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
    setSelectedCreative(null);
  };

  // Handle preview - fetch full creative details
  const handlePreview = async (creative) => {
    try {
      setSaving(true);
      const response = await creativeAPIs.getCreativeById(creative._id || creative.id);

      if (response.success && response.data) {
        // Map API response to match PreviewModal expected format
        const creativeDetails = {
          ...response.data,
          id: response.data._id,
          views: response.data.analytics?.views || 0,
          clicks: response.data.analytics?.clicks || 0,
          ctr: response.data.analytics?.ctr ? `${response.data.analytics.ctr.toFixed(2)}%` : '0%'
        };
        setSelectedCreative(creativeDetails);
        setModals(prev => ({ ...prev, preview: true }));
      }
    } catch (error) {
      console.error('Error fetching creative details:', error);
      toast.error('Failed to load creative details');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (creativeData) => {
    setSaving(true);
    try {
      // Prepare FormData with only modal fields + required API defaults
      const formData = new FormData();

      // Only append file if it exists (required for create, optional for update)
      if (creativeData.file) {
        formData.append('file', creativeData.file);
      }

      formData.append('title', creativeData.title);
      formData.append('placement', creativeData.placement);
      formData.append('status', creativeData.status);

      // Add required fields with defaults (not in modal)
      formData.append('campaignPID', 'default_campaign');
      formData.append('segment', 'All Users');

      let response;
      if (selectedCreative) {
        // Update existing creative
        response = await creativeAPIs.updateCreative(
          selectedCreative._id || selectedCreative.id,
          formData
        );
      } else {
        // Create new creative
        response = await creativeAPIs.createCreative(formData);
      }

      if (response.success) {
        toast.success(response.message || `Creative ${selectedCreative ? 'updated' : 'created'} successfully`);
        closeModal('addEdit');
        // Refresh the list
        await fetchCreatives(currentPage, itemsPerPage);
      }
    } catch (error) {
      console.error('Error saving creative:', error);
      toast.error(error.message || 'Failed to save creative');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (creative) => {
    setSaving(true);
    try {
      const response = await creativeAPIs.deleteCreative(creative._id || creative.id);

      if (response.success) {
        toast.success(response.message || 'Creative deleted successfully');
        closeModal('delete');
        // Refresh the list
        await fetchCreatives(currentPage, itemsPerPage);
      }
    } catch (error) {
      console.error('Error deleting creative:', error);
      toast.error(error.message || 'Failed to delete creative');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (creative) => {
    setSaving(true);
    try {
      const response = await creativeAPIs.toggleCreativeStatus(creative._id || creative.id);

      if (response.success) {
        const newStatus = response.data.status;
        toast.success(response.message || `Creative ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
        // Refresh the list to show updated status
        await fetchCreatives(currentPage, itemsPerPage);
      }
    } catch (error) {
      console.error('Error toggling creative status:', error);
      toast.error(error.message || 'Failed to toggle creative status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full p-6">
      <Frame
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddNew={() => openModal('addEdit')}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" className="text-blue-600" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-600 text-center">
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={() => fetchCreatives(currentPage, itemsPerPage)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* EXCLUDED: Campaign Tracker functionality not supported per requirements - only show upload table */}
      {!loading && !error && (
        <UploadTable
          data={paginatedData}
          onEdit={(creative) => openModal('addEdit', creative)}
          onDelete={(creative) => openModal('delete', creative)}
          onToggle={handleToggle}
          onPreview={handlePreview}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
        />
      )}

      {/* EXCLUDED: TrackerTable functionality removed per requirements
      {activeTab === "upload" ? (
        <UploadTable
          data={paginatedData}
          onEdit={(creative) => openModal('addEdit', creative)}
          onDelete={(creative) => openModal('delete', creative)}
          onToggle={handleToggle}
          onPreview={(creative) => openModal('preview', creative)}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      ) : (
        <TrackerTable
          data={paginatedData}
          onView={(creative) => openModal('view', creative)}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      )}
      */}

      {/* Modals */}
      <AddEditCreativeModal
        isOpen={modals.addEdit}
        onClose={() => closeModal('addEdit')}
        creative={selectedCreative}
        onSave={handleSave}
        existingCreatives={creatives.filter(c => !c.isDeleted)}
      />

      <PreviewModal
        isOpen={modals.preview}
        onClose={() => closeModal('preview')}
        creative={selectedCreative}
      />

      <ViewDetailsModal
        isOpen={modals.view}
        onClose={() => closeModal('view')}
        creative={selectedCreative}
      />

      <DeleteModal
        isOpen={modals.delete}
        onClose={() => closeModal('delete')}
        creative={selectedCreative}
        onConfirm={handleDelete}
      />
    </div>
  );
}