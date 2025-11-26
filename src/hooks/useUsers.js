'use client';

import { useState, useMemo, useEffect } from 'react';
import userAPIs from '../data/users/userAPI';
import toast from 'react-hot-toast';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [apiFilters, setApiFilters] = useState({
    search: '',
    tier: '',
    status: '',
    gender: '',
    ageRange: '',
    memberSince: '',
    location: ''
  });

  // Fetch users from API
  const fetchUsers = async (page = pagination.currentPage, filters = apiFilters, limit = null) => {
    setLoading(true);
    try {
      const response = await userAPIs.getUsers({
        page,
        limit: limit || pagination.itemsPerPage,
        ...filters
      });

      if (response.success) {
        console.log('🟢 useUsers Hook - Response data:', response.data);
        console.log('🟢 useUsers Hook - Users array:', response.data.users);
        console.log('🟢 useUsers Hook - First user example:', response.data.users?.[0]);
        setUsers(response.data.users);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.itemsPerPage
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters to API
  const applyFilters = (searchTerm, filters) => {
    const newFilters = {
      search: searchTerm || '',
      tier: filters.tierLevel ? filters.tierLevel.toLowerCase() : '',
      status: filters.status || '',
      gender: filters.gender || '',
      ageRange: filters.ageRange || '',
      memberSince: filters.memberSince || '',
      location: filters.location || ''
    };

    setApiFilters(newFilters);
    fetchUsers(1, newFilters); // Reset to page 1 when filters change
  };

  // For frontend compatibility - returns users directly since API handles filtering
  const filterUsers = useMemo(() => {
    return (searchTerm, filters) => {
      // Trigger API call with new filters
      if (searchTerm !== apiFilters.search ||
          filters.tierLevel !== apiFilters.tier ||
          filters.status !== apiFilters.status ||
          filters.gender !== apiFilters.gender ||
          filters.ageRange !== apiFilters.ageRange ||
          filters.memberSince !== apiFilters.memberSince ||
          filters.location !== apiFilters.location) {
        applyFilters(searchTerm, filters);
      }
      // Return current users (API already filtered)
      return users;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, apiFilters]);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchUsers(newPage, apiFilters);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Reset to page 1 when changing items per page
    }));
    fetchUsers(1, apiFilters, newItemsPerPage); // Fetch with new limit
  };

  const updateUser = async (userId, userData) => {
    setLoading(true);
    try {
      console.log('Updating user:', userId, userData);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const suspendUser = async (userId, suspendData) => {
    setLoading(true);
    try {
      const response = await userAPIs.updateUserStatus(
        userId,
        'inactive',
        suspendData.reason || ''
      );

      if (response.success) {
        // Override API message to use consistent terminology
        const message = response.message?.toLowerCase().includes('inactivated')
          ? 'Account Suspended'
          : (response.message || 'Account Suspended');
        toast.success(message);
        // Refresh users list
        await fetchUsers(pagination.currentPage, apiFilters);
      }

      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to suspend user');
      setLoading(false);
      throw err;
    }
  };

  // EXCLUDED: Bulk actions not supported per requirements - actions can only be taken on single users
  const bulkAction = async (userIds, action) => {
    console.log('Bulk actions are disabled per requirements');
    throw new Error('Bulk actions are not supported. Actions can only be taken on individual users.');

    /* ORIGINAL CODE - COMMENTED OUT
    setLoading(true);
    try {
      console.log(`Bulk ${action} for users:`, userIds);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
    */
  };

  return {
    users,
    loading,
    error,
    pagination,
    filterUsers,
    updateUser,
    suspendUser,
    bulkAction,
    handlePageChange,
    handleItemsPerPageChange,
    fetchUsers,
    applyFilters
  };
};