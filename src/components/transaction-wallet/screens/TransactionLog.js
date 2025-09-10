'use client';

import { useState, useEffect } from 'react';
import FilterDropdown from '@/components/ui/FilterDropdown';
import Pagination from '@/components/ui/Pagination';
import { CheckIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { getDateRangeFilter } from '@/utils/dateFilters';

export default function TransactionLog({ onSneakPeek }) {
  const [filters, setFilters] = useState({
    dateRange: '',
    type: '',
    status: '',
    approval: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);

  // Mock data
  useEffect(() => {
    const mockTransactions = [
      {
        id: '#ID09012',
        userId: 'USR-202589',
        type: 'Reward',
        amount: '20$',
        createdOn: '12/06/2025',
        approvedOn: '12/06/2025',
        status: 'Completed',
        approval: 'Yes'
      },
      {
        id: '#ID09013',
        userId: 'USR-202590',
        type: 'XP',
        amount: '150 XP',
        createdOn: '12/06/2025',
        approvedOn: '12/06/2025',
        status: 'Pending',
        approval: 'No'
      },
      {
        id: '#ID09014',
        userId: 'USR-202591',
        type: 'Redemption',
        amount: '500$',
        createdOn: '11/06/2025',
        approvedOn: '-',
        status: 'Failed',
        approval: 'No'
      },
      {
        id: '#ID09015',
        userId: 'USR-202592',
        type: 'Spin',
        amount: '10$',
        createdOn: '11/06/2025',
        approvedOn: '11/06/2025',
        status: 'Completed',
        approval: 'Yes'
      }
    ];
    setTransactions(mockTransactions);
  }, []);

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      ['Transaction ID', 'User ID', 'Type', 'Amount', 'Created On', 'Approved On', 'Status', 'Approval'],
      ...filteredTransactions.map(t => [
        t.id, t.userId, t.type, t.amount, t.createdOn, t.approvedOn, t.status, t.approval
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };


  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesStatus = !filters.status || transaction.status === filters.status;
    const matchesApproval = !filters.approval || transaction.approval === filters.approval;
    const matchesDateRange = getDateRangeFilter(filters.dateRange, 'createdOn')(transaction);
    
    return matchesSearch && matchesType && matchesStatus && matchesApproval && matchesDateRange;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            filterId="dateRange"
            label="Date Range"
            options={['Last 7 days', 'Last 30 days', 'Last 3 months']}
            value={filters.dateRange}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="type"
            label="Type"
            options={['XP', 'Reward', 'Redemption', 'Spin']}
            value={filters.type}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="status"
            label="Status"
            options={['Completed', 'Pending', 'Failed']}
            value={filters.status}
            onChange={handleFilterChange}
          />
          <FilterDropdown
            filterId="approval"
            label="Approval"
            options={['Yes', 'No']}
            value={filters.approval}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Transaction ID or User ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-4 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => window.open(`/transactions/${transaction.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {transaction.id}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => window.open(`/users/${transaction.userId}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {transaction.userId}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{transaction.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{transaction.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{transaction.createdOn}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{transaction.approvedOn}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {transaction.approval === 'Yes' ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="w-5 h-5 text-red-500 flex items-center justify-center">✕</span>
                      )}
                      <span className="ml-2 text-sm text-gray-600">{transaction.approval}</span>
                    </div>
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
            totalItems={filteredTransactions.length}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
      </div>
    </div>
  );
}