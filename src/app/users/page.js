'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditUserModal from '../../components/users/EditUserModal';
import SuspendUserModal from '../../components/users/SuspendUserModal';
import { useSearch } from '../../contexts/SearchContext';

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
  const { searchTerm, registerSearchHandler } = useSearch();
  const [selectedFilters, setSelectedFilters] = useState({
    tierLevel: "",
    location: "",
    memberSince: "",
    status: "",
    gender: "",
    ageRange: "",
    dateRange: "",
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  useEffect(() => {
    registerSearchHandler((query) => {
      // Search functionality is automatically handled by filteredUsers
      setCurrentPage(1); // Reset to first page when searching
    });
  }, [registerSearchHandler]);

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
        "New York, USA",
        "Lyon, France", 
        "London, UK",
        "Delhi, India",
        "Madrid, Spain",
        "Cairo, Egypt",
        "Los Angeles, USA",
        "Berlin, Germany",
        "Chicago, USA",
        "Miami, USA",
        "Sydney, Australia",
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
    {
      id: "gender",
      label: "Gender",
      icon: "data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%233E4954' stroke-width='2'/%3E%3C/svg%3E",
      options: ["Male", "Female", "Other"],
    },
    {
      id: "ageRange",
      label: "Age Range",
      icon: "data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%233E4954' stroke-width='2'/%3E%3C/svg%3E",
      options: ["18–24", "25–34", "35–44", "45–54", "55+"],
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
    const matchesLocation = !selectedFilters.location || user.location === selectedFilters.location;
    const matchesGender = !selectedFilters.gender || user.gender === selectedFilters.gender;
    const matchesAgeRange = !selectedFilters.ageRange || user.age === selectedFilters.ageRange;
    
    // Member since filter logic (simplified for demo)
    let matchesMemberSince = true;
    if (selectedFilters.memberSince) {
      const now = new Date();
      const memberSinceDate = new Date('2025-01-01'); // Mock date
      const daysDiff = Math.floor((now - memberSinceDate) / (1000 * 60 * 60 * 24));
      
      switch (selectedFilters.memberSince) {
        case 'Last 30 days':
          matchesMemberSince = daysDiff <= 30;
          break;
        case 'Last 3 months':
          matchesMemberSince = daysDiff <= 90;
          break;
        case 'Last 6 months':
          matchesMemberSince = daysDiff <= 180;
          break;
        case 'Last year':
          matchesMemberSince = daysDiff <= 365;
          break;
        default:
          matchesMemberSince = true;
      }
    }
    
    return matchesSearch && matchesTier && matchesStatus && matchesLocation && matchesGender && matchesAgeRange && matchesMemberSince;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const exportData = () => {
    const csvContent = [
      ['User ID', 'Name', 'Email', 'Phone', 'Gender', 'Age', 'Location', 'Tier', 'Status'],
      ...filteredUsers.map(user => [
        user.userId, user.name, user.email, user.phone, user.gender, user.age, user.location, user.tier, user.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (updatedUserData) => {
    try {
      // Here you would typically make an API call to save the user data
      console.log('Saving user data:', updatedUserData);
      
      // For now, we'll just simulate a successful save
      // In a real app, you'd update the tableData state or refetch from API
      
      // Show success message
      alert('User profile updated successfully!');
      
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleSuspendUser = (user) => {
    setSuspendingUser(user);
    setShowSuspendModal(true);
  };

  const handleConfirmSuspend = async (suspendData) => {
    try {
      // Here you would typically make an API call to suspend the user
      console.log('Suspending user:', suspendData);
      
      // For now, we'll just simulate a successful suspension
      // In a real app, you'd update the user's status in tableData or refetch from API
      
      // Show success message
      alert(`User ${suspendingUser.name} has been suspended successfully!`);
      
      setShowSuspendModal(false);
      setSuspendingUser(null);
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  return (
    <div className="w-full">
      {/* Header with Filters */}
      <header className="flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6 mb-6" role="banner">
        <div className="flex-shrink-0">
          <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
            Users
          </h1>
          <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
            Track all your users activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end" role="toolbar" aria-label="User filters">
          {filterOptions.map((filter) => (
            <div key={filter.id} className="relative min-w-[130px] flex-shrink-0">
              <div className="relative h-[42px] bg-white rounded-[9.6px] shadow-[0px_3.2px_3.2px_#0000000a] border border-gray-200">
                <select
                  id={`filter-${filter.id}`}
                  value={selectedFilters[filter.id]}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full h-full px-3 pr-8 bg-transparent border-none rounded-[9.6px] cursor-pointer [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[13.5px] tracking-[0] leading-[normal] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  aria-label={`Filter by ${filter.label}`}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-3 h-2 text-[#3e4954]" fill="currentColor" viewBox="0 0 12 7">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={exportData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-[42px] whitespace-nowrap"
            title="Export user data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export
          </button>
        </div>
      </header>


      {/* Results Summary */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0  py-2 z-10 border-b border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</span>
          {filteredUsers.length < tableData.length && (
            <span className="ml-2 text-xs text-gray-600">
              (filtered from {tableData.length} total)
            </span>
          )}
          {searchTerm && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Search: &quot;{searchTerm}&quot;
            </span>
          )}
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(selectedFilters).map(([key, value]) => value && (
              <span key={key} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          {(searchTerm || Object.values(selectedFilters).some(v => v)) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedFilters({
                  tierLevel: "",
                  location: "",
                  memberSince: "",
                  status: "",
                  gender: "",
                  ageRange: "",
                  dateRange: "",
                });
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[10px] border border-gray-200 w-full">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '800px' }}>
            <thead>
              <tr className="bg-[#ecf8f1]">
                <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '150px'}}>
                  Name
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px] hidden lg:table-cell" style={{minWidth: '90px'}}>
                  User ID
                </th>
                <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '180px'}}>
                  Email ID
                </th>
                <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px] hidden md:table-cell" style={{minWidth: '120px'}}>
                  Phone
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px] hidden lg:table-cell" style={{minWidth: '70px'}}>
                  Gender
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px] hidden lg:table-cell" style={{minWidth: '70px'}}>
                  Age
                </th>
                <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px] hidden sm:table-cell" style={{minWidth: '130px'}}>
                  Location
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '90px'}}>
                  Tier
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '90px'}}>
                  Status
                </th>
                <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '120px'}}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>

              {/* Table Rows */}
              {paginatedUsers.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === paginatedUsers.length - 1 ? "border-b-0" : ""}`}
                >
                  {/* Name Column */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                        src={row.avatar}
                        alt={`${row.name} avatar`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full items-center justify-center text-sm hidden flex-shrink-0">
                        👤
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-black text-sm tracking-[0.1px] leading-5 truncate">
                          {row.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* User ID Column */}
                  <td className="py-4 px-2 text-center hidden lg:table-cell">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 truncate">
                      {row.userId}
                    </div>
                  </td>

                  {/* Email Column */}
                  <td className="py-4 px-2">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 truncate" title={row.email}>
                      {row.email}
                    </div>
                  </td>

                  {/* Phone Column */}
                  <td className="py-4 px-2 hidden md:table-cell">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 truncate" title={row.phone}>
                      {row.phone}
                    </div>
                  </td>

                  {/* Gender Column */}
                  <td className="py-4 px-2 text-center hidden lg:table-cell">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                      {row.gender}
                    </div>
                  </td>

                  {/* Age Column */}
                  <td className="py-4 px-2 text-center hidden lg:table-cell">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                      {row.age}
                    </div>
                  </td>

                  {/* Location Column */}
                  <td className="py-4 px-2 hidden sm:table-cell">
                    <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5 truncate" title={row.location}>
                      {row.location}
                    </div>
                  </td>

                  {/* Tier Column */}
                  <td className="py-4 px-2 text-center">
                    <div
                      className="inline-flex justify-center gap-1 px-2 py-1.5 rounded-full border border-solid items-center min-w-0"
                      style={{
                        backgroundColor: row.tierBg,
                        borderColor: row.tierBorder,
                      }}
                    >
                      <img
                        className="w-3 h-3 flex-shrink-0"
                        alt="Icon star"
                        src={row.tierIcon}
                      />
                      <div
                        className="font-semibold text-xs sm:text-sm text-center tracking-[0.10px] leading-4 whitespace-nowrap"
                        style={{ color: row.tierColor }}
                      >
                        {row.tier}
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="py-4 px-2 text-center">
                    <div
                      className="inline-flex items-center justify-center px-2 py-1.5 rounded-full min-w-0"
                      style={{ backgroundColor: row.statusBg }}
                    >
                      <div
                        className="font-medium text-xs sm:text-sm tracking-[0.1px] leading-4 whitespace-nowrap"
                        style={{ color: row.statusColor }}
                      >
                        {row.status}
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditUser(row)}
                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Edit user"
                      >
                        <img
                          className="w-3.5 h-3.5"
                          alt="Icon pencil"
                          src="https://c.animaapp.com/t66hdvJZ/img/---icon--pencil--10@2x.png"
                        />
                      </button>

                      <button 
                        onClick={() => router.push(`/users/${row.userId}`)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-[#00a389] rounded-full hover:bg-[#008a73] transition-colors cursor-pointer text-xs"
                      >
                        <div className="font-medium text-white text-xs tracking-[0] leading-4">
                          View
                        </div>
                      </button>

                      {row.status === "Active" && (
                        <button
                          onClick={() => handleSuspendUser(row)}
                          className=" items-center justify-center gap-1 px-2 py-1.5 bg-[#f40202] rounded-full hover:bg-[#d10000] transition-colors cursor-pointer text-xs hidden sm:flex"
                        >
                          <div className="font-medium text-white text-xs tracking-[0] leading-4">
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
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({filteredUsers.length} total results)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex px-4 py-2 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium transition-colors ${
                currentPage === 1 
                  ? "cursor-not-allowed text-gray-400 bg-gray-50" 
                  : "cursor-pointer hover:bg-gray-50 text-gray-700"
              }`}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`flex w-9 h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-[#d0fee4] text-[#333333] border border-green-300"
                      : "bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#333333]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <div className="flex w-9 h-9 items-center justify-center text-sm text-gray-400">
                  ...
                </div>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="flex w-9 h-9 items-center justify-center rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-[#333333] transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`inline-flex px-4 py-2 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium transition-colors ${
                currentPage === totalPages 
                  ? "cursor-not-allowed text-gray-400 bg-gray-50" 
                  : "cursor-pointer hover:bg-gray-50 text-gray-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

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