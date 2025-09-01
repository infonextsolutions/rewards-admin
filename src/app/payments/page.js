'use client';

import React, { useState } from "react";

const Frame = () => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const filterOptions = [
    {
      id: "dateRange",
      label: "Date Range",
      isOpen: dateRangeOpen,
      setOpen: setDateRangeOpen,
    },
    {
      id: "type",
      label: "Type",
      isOpen: typeOpen,
      setOpen: setTypeOpen,
    },
    {
      id: "status",
      label: "Status",
      isOpen: statusOpen,
      setOpen: setStatusOpen,
    },
  ];

  const handleFilterClick = (filterId) => {
    const filter = filterOptions.find((f) => f.id === filterId);
    if (filter) {
      filter.setOpen(!filter.isOpen);
    }
  };

  return (
    <header
      className="flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6 mb-6"
      role="banner"
    >
      <div className="flex-shrink-0">
        <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
          Payments
        </h1>
        <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
          Track all payments from users
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full lg:w-auto lg:max-w-4xl" role="toolbar" aria-label="Payment filters">
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {filterOptions.map((filter) => (
            <div key={filter.id} className="relative min-w-[150px] flex-shrink-0">
              <div className="relative h-[42px] bg-white rounded-[9.6px] shadow-[0px_3.2px_3.2px_#0000000a] border border-gray-200">
                <button
                  className="w-full h-full px-4 pr-10 bg-transparent border-none rounded-[9.6px] cursor-pointer [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14.4px] tracking-[0] leading-[normal] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-left"
                  onClick={() => handleFilterClick(filter.id)}
                  aria-expanded={filter.isOpen}
                  aria-haspopup="listbox"
                  aria-label={`Filter by ${filter.label}`}
                >
                  {filter.label}
                </button>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-3 h-2 text-[#3e4954]" fill="currentColor" viewBox="0 0 12 7">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

const tableData = [
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Approved",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983999",
    payoutMethod: "Gift Card",
    amount: "₹100",
    status: "Pending",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983999",
    payoutMethod: "Gift Card",
    amount: "₹100",
    status: "Pending",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983999",
    payoutMethod: "Gift Card",
    amount: "₹100",
    status: "Pending",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
  {
    id: "TXN-001234",
    userId: "983475",
    payoutMethod: "PayPal",
    amount: "₹100",
    status: "Active",
    requestedAt: "12/06/2025 at 21:45",
  },
];

const paginationData = [
  { label: "Prev", disabled: true },
  { label: "1", active: true },
  { label: "2", active: false },
  { label: "3", active: false },
  { label: "...", active: false },
  { label: "10", active: false },
  { label: "Next", disabled: false },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "Approved":
    case "Active":
      return "bg-[#d4f8d3] text-[#076758]";
    case "Pending":
      return "bg-[#fff2ab] text-[#6f631b]";
    default:
      return "bg-[#d4f8d3] text-[#076758]";
  }
};

const Table = () => {
  return (
    <div className="bg-white rounded-[10px] border border-gray-200 w-full">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '800px' }}>
          <thead>
            <tr className="bg-[#ecf8f1]">
              <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '120px'}}>
                Redemption ID
              </th>
              <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '100px'}}>
                User ID
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '120px'}}>
                Payout Method
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '100px'}}>
                Amount
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '90px'}}>
                Status
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '150px'}}>
                Requested At
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '100px'}}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === tableData.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="py-4 px-3">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.id}
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.userId}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.payoutMethod}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.amount}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div
                    className={`inline-flex items-center justify-center px-2 py-1.5 rounded-full min-w-0 ${getStatusStyles(row.status)}`}
                  >
                    <div className="font-medium text-sm tracking-[0.1px] leading-4 whitespace-nowrap">
                      {row.status}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#7f7f7f] text-sm tracking-[0.1px] leading-5">
                    {row.requestedAt}
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="flex items-center justify-center">
                    <button className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-[#00a389] rounded-full hover:bg-[#008a73] transition-colors cursor-pointer text-xs">
                      <div className="font-medium text-white text-xs tracking-[0] leading-4">
                        Approve
                      </div>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing 1-11 of 11 payments
        </div>
        <div className="flex items-center gap-2">
          {paginationData.map((item, index) => {
            if (item.label === "Prev" && item.disabled) {
              return (
                <button
                  key={index}
                  disabled
                  className="inline-flex px-4 py-2 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium cursor-not-allowed text-gray-400 bg-gray-50"
                >
                  {item.label}
                </button>
              );
            }

            if (item.label === "1" && item.active) {
              return (
                <button
                  key={index}
                  className="flex w-9 h-9 items-center justify-center rounded-lg text-sm font-medium bg-[#d0fee4] text-[#333333] border border-green-300"
                >
                  {item.label}
                </button>
              );
            }

            if (item.label === "...") {
              return (
                <div key={index} className="flex w-9 h-9 items-center justify-center text-sm text-gray-400">
                  {item.label}
                </div>
              );
            }

            if (item.label === "Next") {
              return (
                <button
                  key={index}
                  className="inline-flex px-4 py-2 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium cursor-pointer hover:bg-gray-50 text-gray-700"
                >
                  {item.label}
                </button>
              );
            }

            return (
              <button
                key={index}
                className="flex w-9 h-9 items-center justify-center rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-[#333333] transition-colors"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  return (
    <div className="w-full p-6">
      <Frame />
      <Table />
    </div>
  );
}