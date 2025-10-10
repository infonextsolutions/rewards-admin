'use client';

import { useState, useCallback } from 'react';
import { offersAPI } from '../data/offers';

export function useOffers() {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({
    totalOffers: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch offers with filters
  const fetchOffers = useCallback(async (page = 1, filters = {}, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search: filters.search || '',
        country: filters.country && filters.country !== 'all' ? filters.country : '',
        sdkProvider: filters.sdkProvider && filters.sdkProvider !== 'all' ? filters.sdkProvider : '',
        xptr: filters.xpTier && filters.xpTier !== 'all' ? filters.xpTier : '',
        adOffer: filters.adOffer && filters.adOffer !== 'all' ? filters.adOffer : '',
        status: filters.status && filters.status !== 'all' ? filters.status : 'all'
      };

      const response = await offersAPI.getOffers(params);

      setOffers(response.offers);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load offers. Please try again.');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create offer
  const createOffer = useCallback(async (offerData) => {
    setLoading(true);
    setError(null);

    try {
      const newOffer = await offersAPI.createOffer(offerData);
      setOffers(prev => [...prev, newOffer]);
      return newOffer;
    } catch (err) {
      setError('Failed to create offer. Please try again.');
      console.error('Error creating offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update offer
  const updateOffer = useCallback(async (offerId, offerData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedOffer = await offersAPI.updateOffer(offerId, offerData);
      setOffers(prev => prev.map(offer => offer.id === offerId ? updatedOffer : offer));
      return updatedOffer;
    } catch (err) {
      setError('Failed to update offer. Please try again.');
      console.error('Error updating offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single offer by ID
  const getOfferById = useCallback(async (offerId) => {
    setLoading(true);
    setError(null);

    try {
      const offer = await offersAPI.getOfferById(offerId);
      return offer;
    } catch (err) {
      setError('Failed to load offer. Please try again.');
      console.error('Error fetching offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete offer
  const deleteOffer = useCallback(async (offerId) => {
    setLoading(true);
    setError(null);

    try {
      await offersAPI.deleteOffer(offerId);
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
      return true;
    } catch (err) {
      setError('Failed to delete offer. Please try again.');
      console.error('Error deleting offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offers,
    pagination,
    loading,
    error,
    fetchOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    getOfferById
  };
}
