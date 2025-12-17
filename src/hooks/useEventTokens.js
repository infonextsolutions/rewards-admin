'use client';

import { useState, useCallback } from 'react';
import { eventTokensAPI } from '../data/eventTokens';
import toast from 'react-hot-toast';

export function useEventTokens() {
  const [eventTokens, setEventTokens] = useState([]);
  const [allEventTokens, setAllEventTokens] = useState([]); // Store all events for client-side pagination
  const [s2sEvents, setS2sEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Fetch event tokens with filters
  const fetchEventTokens = useCallback(async (page = 1, filters = {}, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      // Note: Backend doesn't support pagination, so we fetch all and paginate client-side
      const params = {
        ...filters,
      };

      const response = await eventTokensAPI.getEventTokens(params);

      if (response.success) {
        const allEvents = response.data || [];
        setAllEventTokens(allEvents); // Store all events
        
        const totalItems = response.count || allEvents.length;
        const totalPages = Math.ceil(totalItems / limit);
        
        // Client-side pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedEvents = allEvents.slice(startIndex, endIndex);
        
        setEventTokens(paginatedEvents);
        setPagination({
          currentPage: page,
          totalPages: totalPages || 1,
          totalItems: totalItems,
          itemsPerPage: limit,
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to load event tokens';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching event tokens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch S2S events
  const fetchS2SEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventTokensAPI.getS2SEvents();
      if (response.success) {
        setS2sEvents(response.data || []);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to load S2S events';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching S2S events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await eventTokensAPI.getCategories();
      if (response.success) {
        // Ensure categories is always an array
        const categoriesData = response.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Don't show toast for categories as it's not critical
      setCategories([]); // Set to empty array on error
    }
  }, []);

  // Create event token
  const createEventToken = useCallback(async (eventData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventTokensAPI.createEventToken(eventData);
      if (response.success) {
        toast.success(response.message || 'Event token created successfully');
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create event token';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk import event tokens
  const bulkImportEventTokens = useCallback(async (events) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventTokensAPI.bulkImportEventTokens(events);
      if (response.success) {
        toast.success(response.message || 'Event tokens imported successfully');
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to import event tokens';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update event token
  const updateEventToken = useCallback(async (id, eventData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventTokensAPI.updateEventToken(id, eventData);
      if (response.success) {
        toast.success(response.message || 'Event token updated successfully');
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update event token';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete event token
  const deleteEventToken = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventTokensAPI.deleteEventToken(id);
      if (response.success) {
        toast.success(response.message || 'Event token deleted successfully');
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to delete event token';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change page without fetching (uses already-fetched data)
  const setPage = useCallback((page) => {
    const limit = pagination.itemsPerPage;
    const totalPages = Math.ceil(allEventTokens.length / limit);
    const validPage = Math.max(1, Math.min(page, totalPages));
    
    const startIndex = (validPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = allEventTokens.slice(startIndex, endIndex);
    
    setEventTokens(paginatedEvents);
    setPagination(prev => ({
      ...prev,
      currentPage: validPage,
      totalPages: totalPages || 1,
    }));
  }, [allEventTokens, pagination.itemsPerPage]);

  return {
    eventTokens,
    s2sEvents,
    categories,
    loading,
    error,
    pagination,
    fetchEventTokens,
    fetchS2SEvents,
    fetchCategories,
    createEventToken,
    updateEventToken,
    deleteEventToken,
    bulkImportEventTokens,
    setPage,
  };
}

