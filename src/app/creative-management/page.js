'use client';

import React, { useState, useEffect } from "react";
import { useSearch } from "../../contexts/SearchContext";
import Pagination from "../../components/ui/Pagination";

// Mock data for creatives
const creativesData = [
  {
    id: "CRE-001",
    title: "Spin Promo Banner",
    placement: "Spin Wheel",
    campaignPID: "fb_spin_223",
    status: "Active",
    segment: "Gold, India",
    views: 12450,
    clicks: 2800,
    ctr: "22.5%",
    imageUrl: "/placeholder-banner.jpg",
    isDeleted: false,
    auditLog: []
  },
  {
    id: "CRE-002",
    title: "Daily Login Banner",
    placement: "Home Top",
    campaignPID: "organic_default",
    status: "Inactive",
    segment: "All Users",
    views: 5900,
    clicks: 1000,
    ctr: "16.9%",
    imageUrl: "/placeholder-banner.jpg",
    isDeleted: false,
    auditLog: []
  },
  {
    id: "CRE-003",
    title: "Welcome Bonus",
    placement: "Home Middle",
    campaignPID: "google_welcome_456",
    status: "Active",
    segment: "New Users",
    views: 8750,
    clicks: 1875,
    ctr: "21.4%",
    imageUrl: "/placeholder-banner.jpg",
    isDeleted: false,
    auditLog: []
  },
  {
    id: "CRE-004",
    title: "VIP Rewards",
    placement: "Profile Top",
    campaignPID: "internal_vip_789",
    status: "Active",
    segment: "VIP Users",
    views: 3200,
    clicks: 640,
    ctr: "20.0%",
    imageUrl: "/placeholder-banner.jpg",
    isDeleted: false,
    auditLog: []
  },
  {
    id: "CRE-005",
    title: "Weekend Special",
    placement: "Offers Top",
    campaignPID: "weekend_special_101",
    status: "Inactive",
    segment: "Bronze Tier, Silver Tier",
    views: 7500,
    clicks: 900,
    ctr: "12.0%",
    imageUrl: "/placeholder-banner.jpg",
    isDeleted: false,
    auditLog: []
  }
];

// Mock data for placements
const placementOptions = [
  "Home Top", "Home Middle", "Home Bottom", "Spin Wheel", "Offers Top", 
  "Offers Bottom", "Profile Top", "Profile Middle", "Games Top", "Rewards Top"
];

// Mock data for segments
const segmentOptions = [
  "All Users", "New Users", "VIP Users", "Gold Tier", "Silver Tier", "Bronze Tier",
  "India", "USA", "UK", "High Spenders", "Active Players"
];

// Mock valid PIDs (simulating existing campaigns)
const validPIDs = [
  "fb_spin_223", "organic_default", "google_welcome_456", "internal_vip_789",
  "weekend_special_101", "tiktok_promo_334", "instagram_boost_567", "youtube_campaign_890"
];

// Validation functions
const validateTitle = (title, existingCreatives, currentId = null) => {
  if (!title.trim()) return "Title is required";
  if (!/^[a-zA-Z0-9\s]+$/.test(title)) return "Title must be alphanumeric only";
  if (title.length < 3) return "Title must be at least 3 characters";
  if (title.length > 50) return "Title must be less than 50 characters";
  
  const isDuplicate = existingCreatives.some(creative => 
    creative.title.toLowerCase() === title.toLowerCase() && creative.id !== currentId
  );
  if (isDuplicate) return "Title must be unique";
  
  return null;
};

const validateFile = (file) => {
  if (!file) return "Creative file is required";
  
  const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return "Only PNG, JPG, JPEG, and WEBP files are allowed";
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return "File size must be less than 5MB";
  }
  
  return null;
};

const validatePID = (pid) => {
  if (!pid.trim()) return "Campaign PID is required";
  if (!/^[a-zA-Z0-9_]+$/.test(pid)) return "PID must contain only alphanumeric characters and underscores";
  if (!validPIDs.includes(pid)) return "PID must match an existing campaign";
  return null;
};

const validateSegment = (segments) => {
  if (!segments || segments.length === 0) return "At least one target segment must be selected";
  return null;
};

const Frame = ({ activeTab, setActiveTab, filters, onFilterChange, onAddNew }) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pidOpen, setPidOpen] = useState(false);
  const [segmentOpen, setSegmentOpen] = useState(false);

  const placementFilterOptions = ["All Placements", ...placementOptions];
  const statusFilterOptions = ["All Status", "Active", "Inactive"];
  const pidFilterOptions = ["All PIDs", ...validPIDs];
  const segmentFilterOptions = ["All Segments", ...segmentOptions];

  const filterOptions = [
    {
      id: "dateRange",
      label: filters.dateRange || "Date Range",
      isOpen: dateRangeOpen,
      setOpen: setDateRangeOpen,
      options: null,
    },
    {
      id: "placement",
      label: filters.placement || "Placement",
      isOpen: placementOpen,
      setOpen: setPlacementOpen,
      options: placementFilterOptions,
    },
    {
      id: "pid",
      label: filters.pid || "Campaign PID",
      isOpen: pidOpen,
      setOpen: setPidOpen,
      options: pidFilterOptions,
    },
    {
      id: "segment",
      label: filters.segment || "Segment",
      isOpen: segmentOpen,
      setOpen: setSegmentOpen,
      options: segmentFilterOptions,
    },
    {
      id: "status",
      label: filters.status || "Status",
      isOpen: statusOpen,
      setOpen: setStatusOpen,
      options: statusFilterOptions,
    },
  ];

  const handleFilterClick = (filterId) => {
    const filter = filterOptions.find((f) => f.id === filterId);
    if (filter) {
      filter.setOpen(!filter.isOpen);
    }
  };

  const handleFilterSelect = (filterId, value) => {
    onFilterChange(filterId, value);
    const filter = filterOptions.find((f) => f.id === filterId);
    if (filter) {
      filter.setOpen(false);
    }
  };

  const handleDateRangeSelect = (range) => {
    onFilterChange("dateRange", range);
    setDateRangeOpen(false);
  };

  return (
    <div>
      <header className="flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6 mb-6" role="banner">
        <div className="flex-shrink-0">
          <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
            Creative Management
          </h1>
          <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
            Manage and track creative assets and performance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2 w-full lg:w-auto lg:max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {filterOptions.map((filter) => (
                <div key={filter.id} className="relative min-w-[150px] flex-shrink-0">
                  <div className="relative h-[42px] bg-white rounded-[9.6px] border border-gray-200">
                    <button
                      className="w-full h-full px-4 pr-10 bg-transparent border-none rounded-[9.6px] cursor-pointer font-medium text-[#3e4954] text-[14.4px] text-left"
                      onClick={() => handleFilterClick(filter.id)}
                    >
                      {filter.label}
                    </button>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-3 h-2 text-[#3e4954]" fill="currentColor" viewBox="0 0 12 7">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {filter.isOpen && filter.options && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[9.6px] shadow-lg border border-gray-200 z-10">
                      {filter.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          className="w-full px-4 py-3 text-left bg-white font-medium text-[#3e4954] text-[14.4px]"
                          onClick={() => handleFilterSelect(filter.id, option)}
                        >
                          {option}
                        </button>
                      ))}
                      <button
                        className="w-full px-4 py-3 text-left bg-white font-medium text-[#666666] text-[14.4px] border-t border-gray-200"
                        onClick={() => handleFilterSelect(filter.id, null)}
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}

                  {/* Date Range Picker */}
                  {filter.id === "dateRange" && filter.isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[9.6px] shadow-lg border border-gray-200 z-10 p-4 min-w-[300px]">
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-[#333333] mb-2">Select Date Range</div>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                            onClick={() => handleDateRangeSelect("Today")}
                          >
                            Today
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                            onClick={() => handleDateRangeSelect("Yesterday")}
                          >
                            Yesterday
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                            onClick={() => handleDateRangeSelect("Last 7 days")}
                          >
                            Last 7 days
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[14px]"
                            onClick={() => handleDateRangeSelect("Last 30 days")}
                          >
                            Last 30 days
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14px] border-t border-gray-200 mt-2 pt-3"
                            onClick={() => handleDateRangeSelect(null)}
                          >
                            Clear Filter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-[#00a389] text-white rounded-[9.6px] font-medium text-[14.4px] whitespace-nowrap"
          >
            Add New Creative
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === "upload" 
              ? "border-[#00a389] text-[#00a389]" 
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload & Assign Creatives
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === "tracker" 
              ? "border-[#00a389] text-[#00a389]" 
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("tracker")}
        >
          Creative Campaign Tracker
        </button>
      </div>
    </div>
  );
};

// Upload & Assign Creatives Table
const UploadTable = ({ data, onEdit, onDelete, onToggle, onPreview, currentPage, totalPages, totalItems, onPageChange }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#d4f8d3] text-[#076758]";
      case "Inactive":
        return "bg-[#ffebee] text-[#c62828]";
      default:
        return "bg-[#d4f8d3] text-[#076758]";
    }
  };

  return (
    <div className="bg-white rounded-[10px] border border-gray-200 w-full">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '1000px' }}>
          <thead>
            <tr className="bg-[#ecf8f1]">
              <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '200px'}}>
                Creative Title
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '120px'}}>
                Placement
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '150px'}}>
                Campaign PID
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '90px'}}>
                Status
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '150px'}}>
                Segment
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '200px'}}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-[#d0d6e7] ${index === data.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="py-4 px-3">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.title}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.placement}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.campaignPID}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className={`inline-flex items-center justify-center px-2 py-1.5 rounded-full min-w-0 ${getStatusStyles(row.status)}`}>
                    <div className="font-medium text-sm tracking-[0.1px] leading-4 whitespace-nowrap">
                      {row.status}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.segment}
                  </div>
                </td>


                <td className="py-4 px-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onPreview(row)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onEdit(row)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onToggle(row)}
                      className={`px-2 py-1 text-xs rounded ${
                        row.status === "Active" 
                          ? "bg-orange-100 text-orange-700" 
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {row.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
};

// Creative Campaign Tracker Table
const TrackerTable = ({ data, onView, currentPage, totalPages, totalItems, onPageChange }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#d4f8d3] text-[#076758]";
      case "Inactive":
        return "bg-[#ffebee] text-[#c62828]";
      default:
        return "bg-[#d4f8d3] text-[#076758]";
    }
  };

  return (
    <div className="bg-white rounded-[10px] border border-gray-200 w-full">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '1200px' }}>
          <thead>
            <tr className="bg-[#ecf8f1]">
              <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '200px'}}>
                Creative Title
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '120px'}}>
                Placement
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '150px'}}>
                Campaign PID
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '90px'}}>
                Status
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '120px'}}>
                Segment
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '100px'}}>
                Views
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '100px'}}>
                Clicks
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '80px'}}>
                CTR
              </th>
              <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm tracking-[0.1px]" style={{minWidth: '100px'}}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-[#d0d6e7] ${index === data.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="py-4 px-3">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.title}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.placement}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.campaignPID}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className={`inline-flex items-center justify-center px-2 py-1.5 rounded-full min-w-0 ${getStatusStyles(row.status)}`}>
                    <div className="font-medium text-sm tracking-[0.1px] leading-4 whitespace-nowrap">
                      {row.status}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.segment}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.views.toLocaleString()}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#333333] text-sm tracking-[0.1px] leading-5">
                    {row.clicks.toLocaleString()}
                  </div>
                </td>

                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-[#00a389] text-sm tracking-[0.1px] leading-5">
                    {row.ctr}
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="flex items-center justify-center">
                    <button 
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#00a389] rounded-full cursor-pointer text-xs"
                      onClick={() => onView(row)}
                    >
                      <div className="font-medium text-white text-xs tracking-[0] leading-4">
                        👁️ View
                      </div>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
};

// Add/Edit Creative Modal
const AddEditCreativeModal = ({ isOpen, onClose, creative, onSave, existingCreatives }) => {
  const [formData, setFormData] = useState({
    title: "",
    placement: "",
    campaignPID: "",
    segment: [],
    status: "Active",
    file: null
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (creative) {
      setFormData({
        title: creative.title,
        placement: creative.placement,
        campaignPID: creative.campaignPID,
        segment: creative.segment.split(", "),
        status: creative.status,
        file: null
      });
    } else {
      setFormData({
        title: "",
        placement: "",
        campaignPID: "",
        segment: [],
        status: "Active",
        file: null
      });
    }
  }, [creative]);

  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    const titleError = validateTitle(formData.title, existingCreatives, creative?.id);
    if (titleError) newErrors.title = titleError;
    
    // File validation (only for new creatives or if file is selected)
    if (!creative || formData.file) {
      const fileError = validateFile(formData.file);
      if (fileError) newErrors.file = fileError;
    }
    
    // PID validation
    const pidError = validatePID(formData.campaignPID);
    if (pidError) newErrors.campaignPID = pidError;
    
    // Segment validation
    const segmentError = validateSegment(formData.segment);
    if (segmentError) newErrors.segment = segmentError;
    
    // Placement validation
    if (!formData.placement) newErrors.placement = "Placement is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const auditEntry = {
      action: creative ? 'EDIT' : 'CREATE',
      adminId: 'admin_001',
      timestamp: new Date().toISOString()
    };
    
    onSave({
      ...formData,
      segment: formData.segment.join(", "),
      id: creative ? creative.id : `CRE-${Date.now()}`,
      isDeleted: false,
      auditLog: creative ? [...(creative.auditLog || []), auditEntry] : [auditEntry],
      views: creative ? creative.views : 0,
      clicks: creative ? creative.clicks : 0,
      ctr: creative ? creative.ctr : "0%"
    });
    
    onClose();
  };

  const handleSegmentChange = (segment) => {
    setFormData(prev => ({
      ...prev,
      segment: prev.segment.includes(segment) 
        ? prev.segment.filter(s => s !== segment)
        : [...prev.segment, segment]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {creative ? "Edit Creative" : "Add New Creative"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Creative Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creative Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Spin Promo Banner"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Creative *
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                setFormData(prev => ({ ...prev, file: e.target.files[0] }));
                if (errors.file) setErrors(prev => ({ ...prev, file: null }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent ${
                errors.file ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="text-xs text-gray-700 mt-1">Supported formats: PNG, JPG, WEBP (Max: 5MB)</p>
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
          </div>

          {/* Assign Placement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Placement *
            </label>
            <select
              required
              value={formData.placement}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, placement: e.target.value }));
                if (errors.placement) setErrors(prev => ({ ...prev, placement: null }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent ${
                errors.placement ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Placement</option>
              {placementOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.placement && <p className="text-red-500 text-xs mt-1">{errors.placement}</p>}
          </div>

          {/* Campaign PID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PID / Campaign ID *
            </label>
            <input
              type="text"
              required
              value={formData.campaignPID}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, campaignPID: e.target.value }));
                if (errors.campaignPID) setErrors(prev => ({ ...prev, campaignPID: null }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a389] focus:border-transparent ${
                errors.campaignPID ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="fb_campaign_123"
            />
            <p className="text-xs text-gray-700 mt-1">Must match existing campaign: {validPIDs.join(', ')}</p>
            {errors.campaignPID && <p className="text-red-500 text-xs mt-1">{errors.campaignPID}</p>}
          </div>

          {/* Target Segment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Segment *
            </label>
            <div className={`border rounded-md p-3 max-h-32 overflow-y-auto ${
              errors.segment ? 'border-red-500' : 'border-gray-300'
            }`}>
              {segmentOptions.map(segment => (
                <label key={segment} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.segment.includes(segment)}
                    onChange={() => {
                      handleSegmentChange(segment);
                      if (errors.segment) setErrors(prev => ({ ...prev, segment: null }));
                    }}
                    className="mr-2 text-[#00a389] focus:ring-[#00a389]"
                  />
                  <span className="text-sm text-gray-800">{segment}</span>
                </label>
              ))}
            </div>
            {errors.segment && <p className="text-red-500 text-xs mt-1">{errors.segment}</p>}
          </div>

          {/* Launch Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Launch Status
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.status === "Active"}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.checked ? "Active" : "Inactive" 
                }))}
                className="mr-2 text-[#00a389] focus:ring-[#00a389]"
              />
              <span className="text-sm text-gray-800">Active (visible in app)</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00a389] text-white rounded-md"
            >
              Save Creative
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview Modal
const PreviewModal = ({ isOpen, onClose, creative }) => {
  if (!isOpen || !creative) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Preview: {creative.title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mobile Preview */}
          <div>
            <h3 className="text-lg font-medium mb-4">Mobile Preview</h3>
            <div className="bg-gray-100 rounded-lg p-4 max-w-sm mx-auto">
              {/* Mock Mobile Layout */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-800 text-white p-2 text-center text-sm">
                  Mobile App - {creative.placement}
                </div>
                <div className="p-4 space-y-3">
                  {/* Navigation Bar */}
                  <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span className="text-xs text-gray-600">🏠 Home</span>
                    <span className="text-xs text-gray-600">💰 1,250 pts</span>
                  </div>
                  
                  {creative.placement === "Home Top" && (
                    <div className="w-full">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
                        <div className="font-bold text-sm">{creative.title}</div>
                        <div className="text-xs opacity-90 mt-1">🎯 {creative.segment}</div>
                        <div className="text-xs opacity-75 mt-1">Tap to claim!</div>
                      </div>
                    </div>
                  )}
                  
                  {creative.placement === "Home Middle" && (
                    <>
                      <div className="bg-gray-200 p-3 rounded text-center text-xs">Daily Tasks</div>
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg shadow-md">
                        <div className="font-semibold text-sm">{creative.title}</div>
                        <div className="text-xs opacity-90">🎁 Special offer for {creative.segment}</div>
                      </div>
                      <div className="bg-gray-200 p-3 rounded text-center text-xs">Recent Activities</div>
                    </>
                  )}
                  
                  {creative.placement === "Home Bottom" && (
                    <>
                      <div className="bg-gray-200 p-2 rounded text-center text-xs">Tasks</div>
                      <div className="bg-gray-200 p-2 rounded text-center text-xs">Games</div>
                      <div className="bg-orange-500 text-white p-3 rounded-lg shadow-md">
                        <div className="font-semibold text-sm">{creative.title}</div>
                        <div className="text-xs opacity-90">🔥 Limited time offer!</div>
                      </div>
                    </>
                  )}

                  {creative.placement === "Spin Wheel" && (
                    <div className="text-center space-y-3">
                      <div className="text-xs text-gray-600">Daily Spin</div>
                      <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">SPIN</span>
                      </div>
                      <div className="bg-green-500 text-white p-2 rounded-lg shadow-md">
                        <div className="font-semibold text-sm">{creative.title}</div>
                        <div className="text-xs opacity-90">🎯 For {creative.segment}</div>
                      </div>
                    </div>
                  )}
                  
                  {creative.placement === "Profile Top" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-gray-100 rounded">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          U
                        </div>
                        <div className="text-xs">
                          <div className="font-semibold">User Profile</div>
                          <div className="text-gray-600">Level 5 • {creative.segment}</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg shadow-md">
                        <div className="font-semibold text-sm">🌟 {creative.title}</div>
                        <div className="text-xs opacity-90">Exclusive for you!</div>
                      </div>
                    </div>
                  )}
                  
                  {creative.placement.includes("Offers") && (
                    <div className="space-y-2">
                      <div className="text-center text-xs text-gray-600 font-semibold">🎁 Special Offers</div>
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-lg shadow-md">
                        <div className="font-bold text-sm">{creative.title}</div>
                        <div className="text-xs opacity-90">💰 Earn more points!</div>
                        <div className="text-xs opacity-75 mt-1">Target: {creative.segment}</div>
                      </div>
                      <div className="bg-gray-200 p-2 rounded text-center text-xs">More offers below...</div>
                    </div>
                  )}
                  
                  {creative.placement.includes("Games") && (
                    <div className="space-y-2">
                      <div className="text-center text-xs text-gray-600 font-semibold">🎮 Featured Games</div>
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg shadow-md">
                        <div className="font-bold text-sm">🎯 {creative.title}</div>
                        <div className="text-xs opacity-90">Play & Earn Points!</div>
                        <div className="text-xs opacity-75 mt-1">PID: {creative.campaignPID}</div>
                      </div>
                    </div>
                  )}
                  
                  {creative.placement.includes("Rewards") && (
                    <div className="space-y-2">
                      <div className="text-center text-xs text-gray-600 font-semibold">🏆 Rewards Center</div>
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-3 rounded-lg shadow-md">
                        <div className="font-bold text-sm">⭐ {creative.title}</div>
                        <div className="text-xs opacity-90">Redeem your points!</div>
                        <div className="text-xs opacity-75 mt-1">Available for {creative.segment}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Navigation */}
                  <div className="flex justify-around items-center bg-gray-800 text-white p-2 rounded text-xs">
                    <span className="opacity-75">🏠 Home</span>
                    <span className="opacity-75">🎮 Games</span>
                    <span className="opacity-75">🎁 Offers</span>
                    <span className="opacity-75">👤 Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Creative Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-800">Title:</span>
                <span className="ml-2 text-gray-900">{creative.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Placement:</span>
                <span className="ml-2 text-gray-900">{creative.placement}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Campaign PID:</span>
                <span className="ml-2 text-gray-900">{creative.campaignPID}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  creative.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {creative.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Target Segment:</span>
                <span className="ml-2 text-gray-900">{creative.segment}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Views:</span>
                <span className="ml-2 text-gray-900 font-semibold">{creative.views?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Clicks:</span>
                <span className="ml-2 text-gray-900 font-semibold">{creative.clicks?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">CTR:</span>
                <span className="ml-2 text-[#00a389] font-semibold">{creative.ctr || "0%"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// View Details Modal
const ViewDetailsModal = ({ isOpen, onClose, creative }) => {
  if (!isOpen || !creative) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Campaign Details: {creative.title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{creative.views?.toLocaleString()}</div>
                <div className="text-sm text-blue-600">Total Views</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{creative.clicks?.toLocaleString()}</div>
                <div className="text-sm text-green-600">Total Clicks</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{creative.ctr}</div>
                <div className="text-sm text-purple-600">Click Through Rate</div>
              </div>
            </div>
          </div>

          {/* Campaign Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Campaign Information</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-800">Creative ID:</span>
                <span className="ml-2 text-gray-900 font-mono">{creative.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Title:</span>
                <span className="ml-2 text-gray-900">{creative.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Placement:</span>
                <span className="ml-2 text-gray-900">{creative.placement}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Campaign PID:</span>
                <span className="ml-2 text-gray-900 font-mono">{creative.campaignPID}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  creative.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {creative.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Target Segment:</span>
                <span className="ml-2 text-gray-900">{creative.segment}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, creative, onConfirm }) => {
  if (!isOpen || !creative) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Delete Creative</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        
        <p className="text-gray-800 mb-6">
          Are you sure you want to delete "<span className="font-semibold">{creative.title}</span>"? This creative will be archived and removed from active display.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(creative.id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function CreativeManagementPage() {
  const { searchTerm, registerSearchHandler } = useSearch();
  const [activeTab, setActiveTab] = useState("upload");
  const [filters, setFilters] = useState({
    dateRange: null,
    placement: null,
    pid: null,
    segment: null,
    status: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [creativesDataState, setCreativesDataState] = useState(creativesData);
  const [modals, setModals] = useState({
    addEdit: false,
    preview: false,
    view: false,
    delete: false
  });
  const [selectedCreative, setSelectedCreative] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    registerSearchHandler((query) => {
      setCurrentPage(1);
    });
  }, [registerSearchHandler]);

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredData = creativesDataState.filter(creative => {
    // Exclude soft-deleted items
    if (creative.isDeleted) return false;
    
    const matchesSearch = searchTerm === "" || 
      creative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.campaignPID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.placement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.segment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlacement = !filters.placement || filters.placement === "All Placements" || creative.placement === filters.placement;
    const matchesPID = !filters.pid || filters.pid === "All PIDs" || creative.campaignPID === filters.pid;
    const matchesSegment = !filters.segment || filters.segment === "All Segments" || 
      creative.segment.split(', ').some(seg => seg.trim() === filters.segment);
    const matchesStatus = !filters.status || filters.status === "All Status" || creative.status === filters.status;
    
    return matchesSearch && matchesPlacement && matchesPID && matchesSegment && matchesStatus;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Modal handlers
  const openModal = (modalType, creative = null) => {
    setSelectedCreative(creative);
    setModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
    setSelectedCreative(null);
  };

  const handleSave = (creativeData) => {
    if (selectedCreative) {
      // Edit existing
      setCreativesDataState(prev => 
        prev.map(creative => 
          creative.id === selectedCreative.id ? { ...creative, ...creativeData } : creative
        )
      );
    } else {
      // Add new
      setCreativesDataState(prev => [...prev, {
        ...creativeData,
        views: 0,
        clicks: 0,
        ctr: "0%"
      }]);
    }
  };


  const handleDelete = (creativeId) => {
    const auditEntry = {
      action: 'DELETE',
      adminId: 'admin_001',
      timestamp: new Date().toISOString()
    };
    
    setCreativesDataState(prev => 
      prev.map(creative => 
        creative.id === creativeId 
          ? { 
              ...creative, 
              isDeleted: true,
              auditLog: [...(creative.auditLog || []), auditEntry]
            }
          : creative
      )
    );
  };
  
  const handleToggle = (creative) => {
    const auditEntry = {
      action: 'TOGGLE_STATUS',
      adminId: 'admin_001',
      timestamp: new Date().toISOString()
    };
    
    setCreativesDataState(prev => 
      prev.map(c => 
        c.id === creative.id 
          ? { 
              ...c, 
              status: c.status === "Active" ? "Inactive" : "Active",
              auditLog: [...(c.auditLog || []), auditEntry]
            }
          : c
      )
    );
  };

  return (
    <div className="w-full p-6">
      <Frame 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddNew={() => openModal('addEdit')}
      />

      {activeTab === "upload" ? (
        <UploadTable
          data={paginatedData}
          onEdit={(creative) => openModal('addEdit', creative)}
          onDelete={(creative) => openModal('delete', creative)}
          onToggle={handleToggle}
          onPreview={(creative) => openModal('preview', creative)}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      ) : (
        <TrackerTable
          data={paginatedData}
          onView={(creative) => openModal('view', creative)}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <AddEditCreativeModal
        isOpen={modals.addEdit}
        onClose={() => closeModal('addEdit')}
        creative={selectedCreative}
        onSave={handleSave}
        existingCreatives={creativesDataState.filter(c => !c.isDeleted)}
      />

      <PreviewModal
        isOpen={modals.preview}
        onClose={() => closeModal('preview')}
        creative={selectedCreative}
      />

      <ViewDetailsModal
        isOpen={modals.view}
        onClose={() => closeModal('view')}
        creative={selectedCreative}
      />

      <DeleteModal
        isOpen={modals.delete}
        onClose={() => closeModal('delete')}
        creative={selectedCreative}
        onConfirm={handleDelete}
      />
    </div>
  );
}