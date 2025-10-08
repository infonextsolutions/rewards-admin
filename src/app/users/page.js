'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUsers } from '../../hooks/useUsers';
import { usePagination } from '../../hooks/usePagination';
import { USER_FILTER_OPTIONS } from '../../data/users';
import UsersHeader from '../../components/users/UsersHeader';
import UsersResultsSummary from '../../components/users/UsersResultsSummary';
import BulkActionsBar from '../../components/ui/BulkActionsBar';
import UsersTable from '../../components/users/UsersTable';
import Pagination from '../../components/ui/Pagination';
import EditUserModal from '../../components/users/EditUserModal';
import SuspendUserModal from '../../components/users/SuspendUserModal';
import toast from 'react-hot-toast';
import userAPIs from '../../data/users/userAPI';

export default function UsersPage() {
  const { searchTerm, registerSearchHandler } = useSearch();
  const {
    users,
    loading,
    pagination,
    filterUsers,
    updateUser,
    suspendUser,
    bulkAction,
    handlePageChange: apiHandlePageChange,
    applyFilters
  } = useUsers();

  const [selectedFilters, setSelectedFilters] = useState({
    tierLevel: "",
    location: "",
    memberSince: "",
    status: "",
    gender: "",
    ageRange: "",
  });

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // API handles filtering, use users directly
  const paginatedUsers = users;

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters(searchTerm, selectedFilters);
  }, [searchTerm, selectedFilters]);

  const handleFilterChange = (filterId, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleExport = async () => {
    try {
      toast.loading('Exporting users...', { id: 'export-users' });
      await userAPIs.exportUsers('csv');
      toast.success('Users exported successfully!', { id: 'export-users' });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error(error.message || 'Failed to export users', { id: 'export-users' });
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      tierLevel: "",
      location: "",
      memberSince: "",
      status: "",
      gender: "",
      ageRange: "",
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (updatedUserData) => {
    try {
      // Check if account status changed
      const statusChanged = editingUser.status !== updatedUserData.accountStatus;

      // Update user profile (without status)
      const { accountStatus, ...userDataWithoutStatus } = updatedUserData;
      const response = await userAPIs.updateUser(editingUser.id, userDataWithoutStatus);

      // If status changed, call the status API separately
      if (statusChanged && accountStatus) {
        const newStatus = accountStatus === 'Active' ? 'active' : 'inactive';
        await userAPIs.updateUserStatus(editingUser.id, newStatus, '');
      }

      if (response.success) {
        toast.success('User profile updated successfully!');
        setShowEditModal(false);
        setEditingUser(null);
        // Refresh users list
        await applyFilters(searchTerm, selectedFilters);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Failed to update user profile');
      throw error;
    }
  };

  const handleSuspendUser = (user) => {
    setSuspendingUser(user);
    setShowSuspendModal(true);
  };

  const handleConfirmSuspend = async (suspendData) => {
    try {
      await suspendUser(suspendingUser.id, suspendData);
      setShowSuspendModal(false);
      setSuspendingUser(null);
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async (action) => {
    const selectedCount = selectedUsers.length;
    if (selectedCount === 0) {
      toast.error('Please select at least one user');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedCount} selected user(s)?`;
    if (window.confirm(confirmMessage)) {
      try {
        await bulkAction(selectedUsers, action);
        toast.success(`Bulk ${action} applied to ${selectedCount} user(s)`);
        setSelectedUsers([]);
      } catch (error) {
        toast.error(`Error applying bulk ${action}: ${error.message}`);
      }
    }
  };

  return (
    <div className="w-full">
      <UsersHeader
        filterOptions={USER_FILTER_OPTIONS}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
      />

      {/* PHASE 2: Bulk Actions temporarily hidden */}
      {/* <BulkActionsBar
        selectedCount={selectedUsers.length}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedUsers([])}
      /> */}

      <UsersResultsSummary
        startIndex={(pagination.currentPage - 1) * pagination.itemsPerPage}
        itemsPerPage={pagination.itemsPerPage}
        filteredCount={pagination.totalItems}
        totalCount={pagination.totalItems}
        searchTerm={searchTerm}
        selectedFilters={selectedFilters}
        onItemsPerPageChange={() => {}} // Not supported with API pagination
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          <UsersTable
            users={paginatedUsers}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onEditUser={handleEditUser}
            onSuspendUser={handleSuspendUser}
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={apiHandlePageChange}
          />
        </>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Suspend User Modal */}
      <SuspendUserModal
        user={suspendingUser}
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSuspendingUser(null);
        }}
        onSuspend={handleConfirmSuspend}
      />
    </div>
  );
}