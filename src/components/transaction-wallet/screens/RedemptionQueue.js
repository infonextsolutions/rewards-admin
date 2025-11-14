'use client';

import { useState, useEffect, useCallback } from 'react';
import Pagination from '@/components/ui/Pagination';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SneakPeekModal from '../modals/SneakPeekModal';
import apiClient from '@/lib/apiClient';

export default function RedemptionQueue() {
  const [redemptions, setRedemptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [showSneakPeek, setShowSneakPeek] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} at ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // Fetch redemptions from API
  const fetchRedemptions = useCallback(async () => {
      setLoadingRedemptions(true);
      try {
      const params = {
        page: currentPage,
        limit: pagination.itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await apiClient.get('/admin/payouts/pending', { params });

      if (response.data?.success) {
        const data = response.data.data || response.data;
        
        // API returns data.requests array
        const requests = Array.isArray(data.requests) ? data.requests : [];

          // Transform API data to component format
        const transformedRedemptions = requests.map(r => ({
            id: r._id,
          redemptionId: r.metadata?.externalId || r._id?.slice(-8) || r._id,
          userId: r.userId?._id || r.user?.id || r.userId || '-',
          userName: r.userId?.firstName && r.userId?.lastName 
            ? `${r.userId.firstName} ${r.userId.lastName}`.trim()
            : r.user?.name || r.userId?.firstName || '-',
          userEmail: r.userId?.email || r.user?.email || '-',
          userMobile: r.user?.mobile || r.userId?.mobile || '-',
          amount: r.payment?.amount 
            ? `${r.payment.currency || 'USD'} ${r.payment.amount}` 
            : `${r.reward?.value?.denomination || 0} ${r.reward?.value?.currency_code || 'USD'}`,
          status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Pending',
          payoutMethod: r.reward?.delivery?.method || 'N/A',
          verification: 'Face Not Verified', // Default since not in API response
          faceVerified: false,
          offerCompletion: 'N/A',
          offerCompletedAt: null,
          createdAt: formatDate(r.createdAt),
          location: '-',
            userProfile: {
            name: r.userId?.firstName && r.userId?.lastName 
              ? `${r.userId.firstName} ${r.userId.lastName}`.trim()
              : r.user?.name || '-',
            email: r.userId?.email || r.user?.email || '-',
            mobile: r.user?.mobile || r.userId?.mobile || '-',
            location: null
            },
            rawData: r
          }));

          setRedemptions(transformedRedemptions);
        
        // Update pagination
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.page || currentPage,
            totalPages: data.pagination.pages || 1,
            totalItems: data.pagination.total || 0,
            itemsPerPage: data.pagination.limit || pagination.itemsPerPage
          });
          setTotalRedemptions(data.pagination.total || transformedRedemptions.length);
        } else {
          setTotalRedemptions(transformedRedemptions.length);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch redemptions');
        }
      } catch (error) {
        console.error('Error fetching redemptions:', error);
      toast.error(error.response?.data?.message || 'Failed to load redemption requests');
      setRedemptions([]);
      } finally {
        setLoadingRedemptions(false);
      }
  }, [currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);


  const handleApprove = async (redemptionId) => {
    if (!redemptionId) {
      toast.error('Invalid redemption ID');
      return;
    }

    setLoading(prev => ({ ...prev, [redemptionId]: true }));

    try {
      const response = await apiClient.post(`/admin/payouts/${redemptionId}/approve`);

      if (response.data?.success) {
        // Refresh the list
        await fetchRedemptions();
        toast.success('Redemption approved successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to approve redemption');
      }
    } catch (error) {
      console.error('Error approving redemption:', error);
      toast.error(error.response?.data?.message || 'Failed to approve redemption. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [redemptionId]: false }));
    }
  };

  const handleReject = async (redemptionId) => {
    if (!redemptionId) {
      toast.error('Invalid redemption ID');
      return;
    }

    setLoading(prev => ({ ...prev, [redemptionId]: true }));

    try {
      const response = await apiClient.post(`/admin/payouts/${redemptionId}/reject`);

      if (response.data?.success) {
        // Refresh the list
        await fetchRedemptions();
        toast.success('Redemption rejected successfully!');

        // Close modal and reset
        setShowRejectModal(null);
        setRejectReason('');
      } else {
        throw new Error(response.data?.message || 'Failed to reject redemption');
      }
    } catch (error) {
      console.error('Error rejecting redemption:', error);
      toast.error(error.response?.data?.message || 'Failed to reject redemption. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [redemptionId]: false }));
    }
  };

  const handleSneakPeek = (redemption) => {
    setSelectedUserId(redemption.userId);
    setShowSneakPeek(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full min-w-[80px] ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getVerificationBadge = (verification) => {
    const isVerified = verification.includes('Face Verified');
    const isPending = verification.includes('Pending');
    
    const styles = isVerified 
      ? 'bg-green-100 text-green-800'
      : isPending 
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';
    
    return (
      <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full min-w-[120px] ${styles}`}>
        {verification}
      </span>
    );
  };


  // No filtering needed - use all redemptions
  const filteredRedemptions = redemptions;

  // Use API pagination if available, otherwise use client-side pagination
  const paginatedRedemptions = pagination.totalPages > 1 
    ? filteredRedemptions 
    : filteredRedemptions.slice(
        (currentPage - 1) * pagination.itemsPerPage,
        currentPage * pagination.itemsPerPage
      );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="text-sm text-gray-600">
          {loadingRedemptions ? 'Loading...' : `${totalRedemptions} pending redemption${totalRedemptions !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redemption ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payout Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingRedemptions ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-600">Loading redemption requests...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRedemptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-gray-600">No pending redemptions found</p>
                  </td>
                </tr>
              ) : (
                paginatedRedemptions.map((redemption) => (
                  <tr key={redemption.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{redemption.redemptionId}</span>
                    </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => window.open(`/users/${redemption.userId}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {redemption.userId}
                    </button>
                  </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{redemption.userName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{redemption.payoutMethod}</span>
                    </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-emerald-600">{redemption.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(redemption.status)}
                  </td>
                  <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{redemption.createdAt}</span>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Redemption
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to reject this redemption request? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={loading[showRejectModal]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading[showRejectModal] ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {loadingRedemptions ? (
          'Loading...'
        ) : (
          `Showing ${((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of ${pagination.totalItems} redemption requests`
        )}
      </div>

      {/* Sneak Peek Modal */}
      <SneakPeekModal
        userId={selectedUserId}
        isOpen={showSneakPeek}
        onClose={() => {
          setShowSneakPeek(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}