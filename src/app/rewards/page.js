'use client';

import { useState } from 'react';
import { useRewards } from '../../hooks/useRewards';
import { usePagination } from '../../hooks/usePagination';
import { REWARDS_TABS, REWARDS_FILTER_OPTIONS } from '../../data/rewards';
import { exportToCSV } from '../../utils/export';
import RewardsHeader from '../../components/rewards/RewardsHeader';
import RewardsTable from '../../components/rewards/RewardsTable';
import Pagination from '../../components/ui/Pagination';
import { AddEditModal, DeleteConfirmModal } from '../../components/rewards/RewardsModals';

export default function RewardsPage() {
  const { getDataByTab, updateItem, addItem, deleteItem, loading } = useRewards();
  const [activeTab, setActiveTab] = useState("XP Tiers");
  
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: "Date Range",
    type: "Type", 
    status: "Status",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const currentData = getDataByTab(activeTab);
  const {
    items: paginatedData,
    totalPages,
    currentPage,
    totalItems,
    handlePageChange,
    resetPagination
  } = usePagination(currentData);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    resetPagination();
  };

  const getFilterOptions = () => {
    const baseFilters = REWARDS_FILTER_OPTIONS.base;
    const tabFilters = REWARDS_FILTER_OPTIONS[activeTab] || [];
    return [...baseFilters, ...tabFilters];
  };

  const handleFilterChange = (filterId, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    resetPagination();
  };

  const handleExport = () => {
    exportToCSV(currentData, `${activeTab.toLowerCase().replace(/\s+/g, '-')}-data`);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem) {
        await updateItem(activeTab, editingItem.id, itemData);
        alert('Item updated successfully!');
      } else {
        await addItem(activeTab, itemData);
        alert('Item added successfully!');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteItem(activeTab, deletingItem.id);
      alert('Item deleted successfully!');
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      <RewardsHeader
        tabs={REWARDS_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filterOptions={getFilterOptions()}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        onAdd={handleAdd}
      />

      <RewardsTable
        activeTab={activeTab}
        data={paginatedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Modal */}
      <AddEditModal
        isOpen={showAddModal || showEditModal}
        activeTab={activeTab}
        editingItem={editingItem}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        activeTab={activeTab}
        deletingItem={deletingItem}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}