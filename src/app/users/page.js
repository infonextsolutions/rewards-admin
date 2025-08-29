'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const tableData = [
  {
    id: 1,
    name: "Neil Jackson",
    userId: "IDO9012",
    tier: "Silver",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--10@2x.png",
    tierBg: "#f4f4f4",
    tierBorder: "#9aa7b8",
    tierColor: "#6f85a4",
    email: "neil.jackson@gmail.com",
    phone: "+1 (555) 123-4567",
    gender: "Male",
    age: "25–34",
    location: "New York, USA",
    status: "Active",
    statusBg: "#d3f8d2",
    statusColor: "#066657",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar.svg",
  },
  {
    id: 2,
    name: "Samuel Joh",
    userId: "IDIO8202",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "samthegamer@gmail.com",
    phone: "+33 6 45 32 19 87",
    gender: "Male",
    age: "18–24",
    location: "Lyon, France",
    status: "Active",
    statusBg: "#d3f8d2",
    statusColor: "#066657",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-1.svg",
  },
  {
    id: 3,
    name: "Peter Wilson",
    userId: "ID780212",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "peter.wilson@gmail.com",
    phone: "+44 20 7946 0958",
    gender: "Male",
    age: "35–44",
    location: "London, UK",
    status: "Inactive",
    statusBg: "#ffdbd4",
    statusColor: "#f40202",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-2.svg",
  },
  {
    id: 4,
    name: "Patrica G",
    userId: "ID677980",
    tier: "Bronze",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--3@2x.png",
    tierBg: "#ffefda",
    tierBorder: "#c77023",
    tierColor: "#f68d2b",
    email: "patricia.gam@gmail.com",
    phone: "+91-9876543210",
    gender: "Female",
    age: "25–34",
    location: "Delhi, India",
    status: "Paused",
    statusBg: "#fff2ab",
    statusColor: "#6f631b",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-2.svg",
  },
  {
    id: 5,
    name: "Portia Mondelez",
    userId: "ID69780",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "P_Mode@gmail.com",
    phone: "+34-612-345-678",
    gender: "Female",
    age: "18–24",
    location: "Madrid, Spain",
    status: "Inactive",
    statusBg: "#ffdbd4",
    statusColor: "#f40202",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-4.svg",
  },
  {
    id: 6,
    name: "Naman Jain",
    userId: "ID65886",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "namantoall@gmail.com",
    phone: "+20-100-123-4567",
    gender: "Male",
    age: "25–34",
    location: "Cairo, Egypt",
    status: "Inactive",
    statusBg: "#ffdbd4",
    statusColor: "#f40202",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-5.svg",
  },
  {
    id: 7,
    name: "Gabriel Jackson",
    userId: "ID88080",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "Goldilocks123@gmail.com",
    phone: "+1 (555) 987-6543",
    gender: "Male",
    age: "35–44",
    location: "Los Angeles, USA",
    status: "Inactive",
    statusBg: "#ffdbd4",
    statusColor: "#f40202",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-6.svg",
  },
  {
    id: 8,
    name: "Phillip Jourdes",
    userId: "ID908964",
    tier: "Silver",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--10@2x.png",
    tierBg: "#f4f4f4",
    tierBorder: "#9aa7b8",
    tierColor: "#6f85a4",
    email: "Phil.borntoplay@gmail.com",
    phone: "+49 30 12345678",
    gender: "Male",
    age: "25–34",
    location: "Berlin, Germany",
    status: "Active",
    statusBg: "#d3f8d2",
    statusColor: "#066657",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-7.svg",
  },
  {
    id: 9,
    name: "Neil Jackson",
    userId: "IDW7697",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "neil.jackson@gmail.com",
    phone: "+1 (555) 234-5678",
    gender: "Male",
    age: "25–34",
    location: "Chicago, USA",
    status: "Inactive",
    statusBg: "#ffdbd4",
    statusColor: "#f40202",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-8.svg",
  },
  {
    id: 10,
    name: "Sarah Parker",
    userId: "ID908865",
    tier: "Gold",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--9@2x.png",
    tierBg: "#fffddf",
    tierBorder: "#f0c92e",
    tierColor: "#c7a20f",
    email: "sarahathome@gmail.com",
    phone: "+1 (555) 345-6789",
    gender: "Female",
    age: "35–44",
    location: "Miami, USA",
    status: "Inactive",
    statusBg: "#ffdbd4",
    statusColor: "#f40202",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-9.svg",
  },
  {
    id: 11,
    name: "Richard Woode",
    userId: "ID56799",
    tier: "Silver",
    tierIcon: "https://c.animaapp.com/t66hdvJZ/img/---icon--star--10@2x.png",
    tierBg: "#f4f4f4",
    tierBorder: "#9aa7b8",
    tierColor: "#6f85a4",
    email: "ricktheprick@gmail.com",
    phone: "+61 2 1234 5678",
    gender: "Male",
    age: "45–54",
    location: "Sydney, Australia",
    status: "Active",
    statusBg: "#d3f8d2",
    statusColor: "#066657",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-10.svg",
  },
];

const paginationData = [
  { page: "Prev", isActive: false, isDisabled: true },
  { page: "1", isActive: true, isDisabled: false },
  { page: "2", isActive: false, isDisabled: false },
  { page: "3", isActive: false, isDisabled: false },
  { page: "...", isActive: false, isDisabled: false },
  { page: "10", isActive: false, isDisabled: false },
  { page: "Next", isActive: false, isDisabled: false },
];

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    tierLevel: "",
    location: "",
    memberSince: "",
    status: "",
  });

  const filterOptions = [
    {
      id: "tierLevel",
      label: "Tier Level",
      icon: "data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%233E4954' stroke-width='2'/%3E%3C/svg%3E",
      options: ["Bronze", "Silver", "Gold"],
    },
    {
      id: "location",
      label: "Location",
      icon: "data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%233E4954' stroke-width='2'/%3E%3C/svg%3E",
      options: [
        "North America",
        "Europe",
        "Asia",
        "South America",
        "Africa",
        "Oceania",
      ],
    },
    {
      id: "memberSince",
      label: "Member since",
      icon: "data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%233E4954' stroke-width='2'/%3E%3C/svg%3E",
      options: [
        "Last 30 days",
        "Last 3 months",
        "Last 6 months",
        "Last year",
        "More than a year",
      ],
    },
    {
      id: "status",
      label: "Status",
      icon: "data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%233E4954' stroke-width='2'/%3E%3C/svg%3E",
      options: ["Active", "Inactive", "Paused"],
    },
  ];

  const handleFilterChange = (filterId, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const filteredUsers = tableData.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = !selectedFilters.tierLevel || user.tier === selectedFilters.tierLevel;
    const matchesStatus = !selectedFilters.status || user.status === selectedFilters.status;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="max-w-full">
      {/* Header with Filters */}
      <header className="flex w-full items-end justify-between mb-6" role="banner">
        <div className="relative w-[189px] h-[58.2px]">
          <h1 className="absolute top-0 left-0 [font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
            Users
          </h1>
          <p className="absolute top-[39px] left-0 [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal]">
            Track all your users activity
          </p>
        </div>

        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]" role="toolbar" aria-label="User filters">
          {filterOptions.map((filter) => (
            <div key={filter.id} className="relative w-[178px] h-[42px]">
              <div className="h-[42px] bg-white rounded-[9.6px] shadow-[0px_3.2px_3.2px_#0000000a] border border-gray-200">
                <div className="inline-flex items-center gap-[22px] relative top-[9px] left-[18px]">
                  <div className="relative w-[97.73px] h-[19px]">
                    <label
                      htmlFor={`filter-${filter.id}`}
                      className="absolute w-24 top-0 left-0 [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14.4px] tracking-[0] leading-[normal] cursor-pointer"
                    >
                      {filter.label}
                    </label>
                  </div>
                  <div className="relative w-6 h-6 aspect-[1]">
                    <img
                      className="absolute w-3 h-[7px] top-[9px] left-1.5 pointer-events-none"
                      alt={`${filter.label} dropdown arrow`}
                      src={filter.icon}
                    />
                  </div>
                </div>
                <select
                  id={`filter-${filter.id}`}
                  value={selectedFilters[filter.id]}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label={`Filter by ${filter.label}`}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#00a389] focus:border-[#00a389] text-sm"
            placeholder="Search by name, email, user ID, phone, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {tableData.length} users
          {searchTerm && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Search: &quot;{searchTerm}&quot;
            </span>
          )}
          {(selectedFilters.tierLevel || selectedFilters.status) && (
            <span className="ml-2 text-xs text-gray-500">
              (Filtered)
            </span>
          )}
        </div>
        {(searchTerm || selectedFilters.tierLevel || selectedFilters.status) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedFilters({
                tierLevel: "",
                location: "",
                memberSince: "",
                status: "",
              });
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[10px] border border-gray-200 w-full">
        <div className="overflow-x-auto" style={{ maxWidth: 'calc(100vw - 256px - 48px)' }}>
          <table className="w-full" style={{ minWidth: '1200px' }}>
            <thead>
              <tr className="bg-[#ecf8f1]">
                <th className="text-left py-4 px-6 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[180px] whitespace-nowrap">
                  Name
                </th>
                <th className="text-center py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[120px] whitespace-nowrap">
                  User ID
                </th>
                <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[200px] whitespace-nowrap">
                  Email ID
                </th>
                <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[150px] whitespace-nowrap">
                  Phone
                </th>
                <th className="text-center py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[100px] whitespace-nowrap">
                  Gender
                </th>
                <th className="text-center py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[100px] whitespace-nowrap">
                  Age
                </th>
                <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[160px] whitespace-nowrap">
                  Location
                </th>
                <th className="text-center py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[120px] whitespace-nowrap">
                  Tier
                </th>
                <th className="text-center py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[100px] whitespace-nowrap">
                  Status
                </th>
                <th className="text-center py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px] min-w-[180px] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>

              {/* Table Rows */}
              {filteredUsers.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === filteredUsers.length - 1 ? "border-b-0" : ""}`}
                >
                  {/* Name Column */}
                  <td className="py-4 px-6 min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        src={row.avatar}
                        alt={`${row.name} avatar`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center text-sm hidden flex-shrink-0">
                        👤
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-black text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                          {row.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* User ID Column */}
                  <td className="py-4 px-3 text-center min-w-[120px]">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                      {row.userId}
                    </div>
                  </td>

                  {/* Email Column */}
                  <td className="py-4 px-3 min-w-[200px]">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                      {row.email}
                    </div>
                  </td>

                  {/* Phone Column */}
                  <td className="py-4 px-3 min-w-[150px]">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                      {row.phone}
                    </div>
                  </td>

                  {/* Gender Column */}
                  <td className="py-4 px-3 text-center min-w-[100px]">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                      {row.gender}
                    </div>
                  </td>

                  {/* Age Column */}
                  <td className="py-4 px-3 text-center min-w-[100px]">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                      {row.age}
                    </div>
                  </td>

                  {/* Location Column */}
                  <td className="py-4 px-3 min-w-[160px]">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 whitespace-nowrap">
                      {row.location}
                    </div>
                  </td>

                  {/* Tier Column */}
                  <td className="py-4 px-3 text-center min-w-[120px]">
                    <div
                      className="inline-flex justify-center gap-2 px-3 py-1.5 rounded-full border border-solid items-center"
                      style={{
                        backgroundColor: row.tierBg,
                        borderColor: row.tierBorder,
                      }}
                    >
                      <img
                        className="w-3.5 h-3.5 flex-shrink-0"
                        alt="Icon star"
                        src={row.tierIcon}
                      />
                      <div
                        className="font-semibold text-sm text-center tracking-[0.10px] leading-4 whitespace-nowrap"
                        style={{ color: row.tierColor }}
                      >
                        {row.tier}
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="py-4 px-3 text-center min-w-[100px]">
                    <div
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: row.statusBg }}
                    >
                      <div
                        className="font-medium text-sm tracking-[0.1px] leading-4 whitespace-nowrap"
                        style={{ color: row.statusColor }}
                      >
                        {row.status}
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-3 min-w-[180px]">
                    <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                      <button
                        onClick={() => console.log(`Edit user: ${row.userId}`)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Edit user"
                      >
                        <img
                          className="w-4 h-4"
                          alt="Icon pencil"
                          src="https://c.animaapp.com/t66hdvJZ/img/---icon--pencil--10@2x.png"
                        />
                      </button>

                      <button 
                        onClick={() => router.push(`/users/${row.userId}`)}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-[#00a389] rounded-full hover:bg-[#008a73] transition-colors cursor-pointer flex-shrink-0"
                      >
                        <div className="font-medium text-white text-sm tracking-[0] leading-4 whitespace-nowrap">
                          View
                        </div>
                      </button>

                      {row.status === "Active" && (
                        <button
                          onClick={() => console.log(`Suspend user: ${row.userId}`)}
                          className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-[#f40202] rounded-full hover:bg-[#d10000] transition-colors cursor-pointer flex-shrink-0"
                        >
                          <div className="font-medium text-white text-sm tracking-[0] leading-4 whitespace-nowrap">
                            Suspend
                          </div>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-6 border-t border-gray-200">
          {paginationData.map((item, index) => (
            <div
              key={index}
              className={`${item.page === "Prev" || item.page === "Next" ? "inline-flex px-4 py-2" : "flex w-9 h-9"} ${item.page === "..." ? "bg-white" : item.isActive ? "bg-[#d0fee4]" : "bg-white"} items-center justify-center relative rounded-lg ${!item.isActive && item.page !== "..." && item.page !== "Prev" && item.page !== "Next" ? "border border-gray-200 hover:border-gray-300" : ""} ${item.isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"} transition-colors`}
            >
              <div
                className={`font-semibold text-sm ${item.isDisabled ? "text-gray-400" : "text-[#333333]"}`}
              >
                {item.page}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}