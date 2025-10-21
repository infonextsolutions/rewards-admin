'use client';

import { useState, useEffect } from 'react';
import FilterDropdown from '@/components/ui/FilterDropdown';
import Pagination from '@/components/ui/Pagination';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SneakPeekModal from '../modals/SneakPeekModal';

export default function RedemptionQueue() {
  const [redemptions, setRedemptions] = useState([]);
  const [filters, setFilters] = useState({
    verification: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [showSneakPeek, setShowSneakPeek] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch redemptions from API
  useEffect(() => {
    const fetchRedemptions = async () => {
      setLoadingRedemptions(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          'https://rewardsapi.hireagent.co/api/admin/transactions/redemptions/pending',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const result = await response.json();

        if (result.success && result.data) {
          // Transform API data to component format
          const transformedRedemptions = result.data.redemptions.map(r => ({
            id: r._id,
            userId: r.userId || r.user?._id || '-',
            userName: r.userName || `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || '-',
            userEmail: r.userEmail || r.user?.email || '-',
            userMobile: r.userMobile || r.user?.mobile || '-',
            amount: `${r.amount} ${r.balanceType || 'coins'}`,
            status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
            verification: r.faceVerified ? 'Face Verified' : 'Face Not Verified',
            faceVerified: r.faceVerified,
            offerCompletion: r.offerCompletion?.title || r.metadata?.offerCompletion?.title || 'No offer data',
            offerCompletedAt: r.offerCompletion?.completedAt || r.metadata?.offerCompletion?.completedAt || null,
            createdAt: new Date(r.createdAt).toLocaleString('en-GB'),
            location: r.userLocation ? `${r.userLocation.city || ''}, ${r.userLocation.country || ''}`.trim() : '-',
            userProfile: {
              name: r.userName || `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || '-',
              email: r.userEmail || r.user?.email || '-',
              mobile: r.userMobile || r.user?.mobile || '-',
              location: r.userLocation
            },
            rawData: r
          }));

          setRedemptions(transformedRedemptions);
          setTotalRedemptions(result.data.total || transformedRedemptions.length);
        }
      } catch (error) {
        console.error('Error fetching redemptions:', error);
      } finally {
        setLoadingRedemptions(false);
      }
    };

    fetchRedemptions();
  }, []);

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  };

  const handleApprove = async (redemptionId) => {
    setLoading(prev => ({ ...prev, [redemptionId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://rewardsapi.hireagent.co/api/admin/transactions/redemptions/${redemptionId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state to reflect approval
        setRedemptions(prev =>
          prev.filter(redemption => redemption.id !== redemptionId)
        );
        setTotalRedemptions(prev => Math.max(0, prev - 1));

        // Show success message
        toast.success('Redemption approved successfully!');
      } else {
        toast.error(result.message || 'Failed to approve redemption');
      }
    } catch (error) {
      console.error('Error approving redemption:', error);
      toast.error('Failed to approve redemption. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [redemptionId]: false }));
    }
  };

  const handleReject = async (redemptionId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(prev => ({ ...prev, [redemptionId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://rewardsapi.hireagent.co/api/admin/transactions/redemptions/${redemptionId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: rejectReason
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        // Remove from list since it's no longer pending
        setRedemptions(prev =>
          prev.filter(redemption => redemption.id !== redemptionId)
        );
        setTotalRedemptions(prev => Math.max(0, prev - 1));

        // Show success message
        toast.success('Redemption rejected successfully!');

        // Close modal and reset
        setShowRejectModal(null);
        setRejectReason('');
      } else {
        toast.error(result.message || 'Failed to reject redemption');
      }
    } catch (error) {
      console.error('Error rejecting redemption:', error);
      toast.error('Failed to reject redemption. Please try again.');
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


  const filteredRedemptions = redemptions.filter(redemption => {
    const matchesVerification = !filters.verification ||
      redemption.verification.includes(filters.verification);

    return matchesVerification;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRedemptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRedemptions = filteredRedemptions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <FilterDropdown
            filterId="verification"
            label="Verification"
            options={['Face Verified', 'Face Not Verified']}
            value={filters.verification}
            onChange={handleFilterChange}
          />
        </div>
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      <span className="font-medium text-gray-900">{redemption.id}</span>
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
                    <span className="font-medium text-emerald-600">{redemption.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(redemption.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getVerificationBadge(redemption.verification)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{redemption.offerCompletion}</div>
                    <div className="text-xs text-gray-500">{redemption.createdAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {redemption.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(redemption.id)}
                            disabled={loading[redemption.id]}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] h-9"
                          >
                            {loading[redemption.id] ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing</span>
                              </div>
                            ) : (
                              <>
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setShowRejectModal(redemption.id)}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 min-w-[100px] h-9"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleSneakPeek(redemption)}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 min-w-[120px] h-9"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Sneak Peek
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRedemptions.length}
            onPageChange={setCurrentPage}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please provide a detailed reason for rejection..."
              />
            </div>
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
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRedemptions.length)} of {filteredRedemptions.length} redemption requests
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