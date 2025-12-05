"use client";

import { useState, useEffect } from "react";
import { useSearch } from "../../contexts/SearchContext";
import { useUsers } from "../../hooks/useUsers";
import { usePagination } from "../../hooks/usePagination";
import { USER_FILTER_OPTIONS } from "../../data/users";
import UsersHeader from "../../components/users/UsersHeader";
import UsersResultsSummary from "../../components/users/UsersResultsSummary";
import BulkActionsBar from "../../components/ui/BulkActionsBar";
import UsersTable from "../../components/users/UsersTable";
import Pagination from "../../components/ui/Pagination";
import EditUserModal from "../../components/users/EditUserModal";
import SuspendUserModal from "../../components/users/SuspendUserModal";
import toast from "react-hot-toast";
import userAPIs from "../../data/users/userAPI";

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
    handleItemsPerPageChange,
    applyFilters,
  } = useUsers();

  const [selectedFilters, setSelectedFilters] = useState({
    tierLevel: "",
    location: "",
    memberSince: "",
    status: "",
    gender: "",
    ageRange: "",
  });

  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dynamicFilterOptions, setDynamicFilterOptions] =
    useState(USER_FILTER_OPTIONS);

  // API handles filtering, use users directly
  const paginatedUsers = users;

  // Effect to dynamically update location filter options
  useEffect(() => {
    if (users && users.length > 0) {
      const uniqueLocations = [
        ...new Set(
          users
            .map((user) => user.location)
            .filter((location) => location && location !== "N/A")
        ),
      ].sort();

      setDynamicFilterOptions((prevOptions) =>
        prevOptions.map((filter) => {
          if (filter.id === "location") {
            return {
              ...filter,
              options:
                uniqueLocations.length > 0 ? uniqueLocations : filter.options,
            };
          }
          return filter;
        })
      );
    }
  }, [users]);

  // Console log users data from backend
  useEffect(() => {
    console.log("🟡 Users Page - Users data:", users);
    console.log("🟡 Users Page - First user example:", users?.[0]);
    if (users?.[0]) {
      console.log("🟡 Users Page - User ID field:", users[0].id);
      console.log("🟡 Users Page - User userId field:", users[0].userId);
    }
  }, [users]);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters(localSearchTerm, selectedFilters);
  }, [
    localSearchTerm,
    selectedFilters.tierLevel,
    selectedFilters.location,
    selectedFilters.memberSince,
    selectedFilters.status,
    selectedFilters.gender,
    selectedFilters.ageRange,
  ]);

  const handleFilterChange = (filterId, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleExport = async () => {
    try {
      toast.loading("Exporting users...", { id: "export-users" });
      await userAPIs.exportUsers("csv");
      toast.success("Users exported successfully!", { id: "export-users" });
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error(error.message || "Failed to export users", {
        id: "export-users",
      });
    }
  };

  const handleClearFilters = () => {
    setLocalSearchTerm("");
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
      // Map frontend field names to backend field names
      const backendData = {};

      // Map firstName and lastName (already in correct format from form)
      if (updatedUserData.firstName) {
        backendData.firstName = updatedUserData.firstName;
      }
      // Only include lastName if it's provided (not undefined or empty)
      if (
        updatedUserData.lastName !== undefined &&
        updatedUserData.lastName !== ""
      ) {
        backendData.lastName = updatedUserData.lastName;
      }

      // Map email (skip for Google users - email cannot be changed)
      if (updatedUserData.email && !editingUser?.isGoogleUser && editingUser?.socialProvider !== 'google') {
        backendData.email = updatedUserData.email;
      }

      // Map phoneNumber to mobile (backend accepts both mobile and phone)
      if (updatedUserData.phoneNumber) {
        backendData.mobile = updatedUserData.phoneNumber;
        backendData.phone = updatedUserData.phoneNumber; // Also set phone as alias
      }

      // Map gender
      if (updatedUserData.gender) {
        backendData.gender = updatedUserData.gender;
      }

      // Map location
      if (updatedUserData.location) {
        backendData.location = updatedUserData.location;
        backendData.country = updatedUserData.location; // Also set country
      }

      // Map currentTier to tier
      if (updatedUserData.currentTier) {
        backendData.tier = updatedUserData.currentTier;
      }

      // Map accountStatus to status
      if (updatedUserData.accountStatus) {
        backendData.status = updatedUserData.accountStatus;
      }

      // Update user profile
      const response = await userAPIs.updateUser(editingUser.id, backendData);

      if (response.success) {
        toast.success("User profile updated successfully!");
        setShowEditModal(false);
        setEditingUser(null);
        // Refresh users list
        await applyFilters(localSearchTerm, selectedFilters);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      
      // Parse error response to show specific error messages
      let errorMessage = "Failed to update user profile";
      
      if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        // Extract specific error messages from the errors array
        const errorMessages = error.errors.map(err => {
          const fieldName = err.field ? err.field.charAt(0).toUpperCase() + err.field.slice(1) : '';
          return err.message || `Invalid ${err.field}`;
        });
        
        // Join multiple errors with semicolons
        errorMessage = errorMessages.join('; ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
      console.error("Error suspending user:", error);
      throw error;
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((user) => user.id));
    }
  };

  const handleBulkAction = async (action) => {
    const selectedCount = selectedUsers.length;
    if (selectedCount === 0) {
      toast.error("Please select at least one user");
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
        filterOptions={dynamicFilterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        searchValue={localSearchTerm}
        onSearchChange={setLocalSearchTerm}
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
        searchTerm={localSearchTerm}
        selectedFilters={selectedFilters}
        onItemsPerPageChange={handleItemsPerPageChange}
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
