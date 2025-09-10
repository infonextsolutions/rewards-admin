'use client';

import { useState, useEffect } from 'react';
import FilterDropdown from '@/components/ui/FilterDropdown';
import Pagination from '@/components/ui/Pagination';
import { MagnifyingGlassIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

export default function AuditTrails() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    admin: '',
    action: '',
    dateRange: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock audit trail data
  useEffect(() => {
    const mockAuditLogs = [
      {
        id: 'AUD-20102',
        adminId: 'ADM-21',
        adminName: 'John Admin',
        action: 'Approved Redemption',
        targetUser: 'USR-38281',
        targetUserName: 'Jane Smith',
        details: {
          redemptionId: 'RED-001',
          amount: '500$',
          previousStatus: 'Pending',
          newStatus: 'Approved'
        },
        timestamp: '2025-05-28 12:01 PM',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 'AUD-20103',
        adminId: 'ADM-43',
        adminName: 'Sarah Manager',
        action: 'Wallet Adjustment',
        targetUser: 'USR-202589',
        targetUserName: 'Mike Johnson',
        details: {
          adjustmentType: 'Add XP',
          amount: '+500 XP',
          reason: 'Compensation for system error',
          previousBalance: '1250 XP',
          newBalance: '1750 XP'
        },
        timestamp: '2025-05-28 11:45 AM',
        ipAddress: '192.168.1.101',
        userAgent: 'Firefox/89.0'
      },
      {
        id: 'AUD-20104',
        adminId: 'ADM-21',
        adminName: 'John Admin',
        action: 'Rejected Redemption',
        targetUser: 'USR-202592',
        targetUserName: 'Alex Wilson',
        details: {
          redemptionId: 'RED-004',
          amount: '300$',
          reason: 'Face verification failed',
          previousStatus: 'Pending',
          newStatus: 'Rejected'
        },
        timestamp: '2025-05-28 10:30 AM',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 'AUD-20105',
        adminId: 'ADM-43',
        adminName: 'Sarah Manager',
        action: 'Transaction Approval',
        targetUser: 'USR-202590',
        targetUserName: 'Emily Davis',
        details: {
          transactionId: '#ID09015',
          type: 'Reward',
          amount: '20$',
          previousStatus: 'Pending',
          newStatus: 'Approved'
        },
        timestamp: '2025-05-28 09:15 AM',
        ipAddress: '192.168.1.101',
        userAgent: 'Firefox/89.0'
      },
      {
        id: 'AUD-20106',
        adminId: 'ADM-12',
        adminName: 'Tom Supervisor',
        action: 'Conversion Rate Update',
        targetUser: 'SYSTEM',
        targetUserName: 'System Configuration',
        details: {
          tier: 'Gold',
          previousRate: '120 XP = ₹1',
          newRate: '100 XP = ₹1',
          effectiveDate: '2025-06-01'
        },
        timestamp: '2025-05-27 04:20 PM',
        ipAddress: '192.168.1.102',
        userAgent: 'Edge/91.0'
      }
    ];
    
    setAuditLogs(mockAuditLogs);
  }, []);

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getActionBadge = (action) => {
    const styles = {
      'Approved Redemption': 'bg-green-100 text-green-800',
      'Rejected Redemption': 'bg-red-100 text-red-800',
      'Wallet Adjustment': 'bg-blue-100 text-blue-800',
      'Transaction Approval': 'bg-purple-100 text-purple-800',
      'Conversion Rate Update': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[action] || 'bg-gray-100 text-gray-800'}`}>
        {action}
      </span>
    );
  };

  const formatDetails = (action, details) => {
    switch (action) {
      case 'Approved Redemption':
      case 'Rejected Redemption':
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-900"><strong>Redemption:</strong> {details.redemptionId}</div>
            <div className="text-sm text-gray-900"><strong>Amount:</strong> {details.amount}</div>
            {details.reason && <div className="text-sm text-gray-900"><strong>Reason:</strong> {details.reason}</div>}
          </div>
        );
      case 'Wallet Adjustment':
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-900"><strong>Type:</strong> {details.adjustmentType}</div>
            <div className="text-sm text-gray-900"><strong>Amount:</strong> {details.amount}</div>
            <div className="text-sm text-gray-900"><strong>Reason:</strong> {details.reason}</div>
          </div>
        );
      case 'Transaction Approval':
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-900"><strong>Transaction:</strong> {details.transactionId}</div>
            <div className="text-sm text-gray-900"><strong>Type:</strong> {details.type}</div>
            <div className="text-sm text-gray-900"><strong>Amount:</strong> {details.amount}</div>
          </div>
        );
      case 'Conversion Rate Update':
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-900"><strong>Tier:</strong> {details.tier}</div>
            <div className="text-sm text-gray-900"><strong>New Rate:</strong> {details.newRate}</div>
            <div className="text-sm text-gray-900"><strong>Effective:</strong> {details.effectiveDate}</div>
          </div>
        );
      default:
        return <div className="text-sm text-gray-500">No details available</div>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetUserName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdmin = !filters.admin || log.adminName === filters.admin;
    const matchesAction = !filters.action || log.action === filters.action;
    
    return matchesSearch && matchesAdmin && matchesAction;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Get unique admin names and actions for filters
  const uniqueAdmins = [...new Set(auditLogs.map(log => log.adminName))];
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            filterId="admin"
            label="Admin"
            options={uniqueAdmins}
            value={filters.admin}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="action"
            label="Action"
            options={uniqueActions}
            value={filters.action}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="dateRange"
            label="Date Range"
            options={['Last 24 hours', 'Last 7 days', 'Last 30 days']}
            value={filters.dateRange}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{log.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                        <div className="text-xs text-gray-500">{log.adminId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      {log.targetUser !== 'SYSTEM' ? (
                        <button
                          onClick={() => window.open(`/users/${log.targetUser}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {log.targetUser}
                        </button>
                      ) : (
                        <span className="font-medium text-gray-900">{log.targetUser}</span>
                      )}
                      <div className="text-xs text-gray-500">{log.targetUserName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {formatDetails(log.action, log.details)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.ipAddress}</div>
                    <div className="text-xs text-gray-500">{log.userAgent}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            onPageChange={setCurrentPage}
          />
        )}
      </div>


      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} audit entries
      </div>
    </div>
  );
}