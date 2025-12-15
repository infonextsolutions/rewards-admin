"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import FilterDropdown from "../ui/FilterDropdown";
import Pagination from "../ui/Pagination";
import EditOfferModal from "./modals/EditOfferModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import ManageSegmentsModal from "./modals/ManageSegmentsModal";
import OfferPreviewModal from "../surveys-offers/modals/OfferPreviewModal";
import TierBadge from "../ui/TierBadge";
import XPTierBadge from "../ui/XPTierBadge";
import { useOffers } from "../../hooks/useOffers";

const STATUS_TYPES = ["Active", "Inactive"];
const MARKETING_CHANNELS = [
  "Facebook",
  "TikTok",
  "Google",
  "Instagram",
  "Twitter",
];
const COUNTRIES = [
  "US",
  "CA",
  "UK",
  "AU",
  "DE",
  "FR",
  "ES",
  "IT",
  "NL",
  "SE",
  "BR",
  "IN",
  "JP",
  "KR",
  "MX",
];
const SDK_PROVIDERS = [
  "BitLabs",
  "AdGem",
  "OfferWalls",
  "AdScend",
  "RewardMob",
  "MoneyWalls",
  "Internal",
];
const XP_TIER_TYPES = ["Junior", "Mid", "Senior", "All"];
const AD_OFFER_TYPES = ["Ad-Based", "Non-Ad", "Hybrid"];

export default function OffersListingModule() {
  const {
    offers: apiOffers,
    pagination: apiPagination,
    loading,
    error,
    fetchOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    getOfferById,
  } = useOffers();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    channel: "all",
    country: "all",
    sdkProvider: "all",
    xpTier: "all",
    adOffer: "all",
  });
  const [activeTab, setActiveTab] = useState("offer");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSegmentsModal, setShowSegmentsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Fetch offers on mount and when filters change
  useEffect(() => {
    const apiFilters = {
      search: searchTerm,
      status: filters.status,
      country: filters.country,
      sdkProvider: filters.sdkProvider,
      xpTier: filters.xpTier,
      adOffer: filters.adOffer,
    };
    fetchOffers(currentPage, apiFilters, itemsPerPage);
  }, [
    currentPage,
    searchTerm,
    filters.status,
    filters.country,
    filters.sdkProvider,
    filters.xpTier,
    filters.adOffer,
    itemsPerPage,
    fetchOffers,
  ]);

  // Use API data directly - server-side filtering and pagination
  const offers = apiOffers;
  const totalPages = apiPagination.totalPages;
  const paginatedOffers = offers;

  // Client-side filtering for marketing channel (not in API)
  const filteredOffers = useMemo(() => {
    if (filters.channel === "all") {
      return paginatedOffers;
    }
    return paginatedOffers.filter(
      (offer) => offer.marketingChannel === filters.channel
    );
  }, [paginatedOffers, filters.channel]);

  // Get metric chip styling based on value
  const getMetricChipStyle = (value, type) => {
    const numValue = parseFloat(value.replace("%", ""));

    if (type === "retention") {
      return numValue >= 80
        ? "bg-[#E6F9EC] text-[#0F8A3B]"
        : "bg-[#FFF7E6] text-[#B66A00]";
    } else if (type === "click") {
      return numValue >= 15
        ? "bg-[#E6F9EC] text-[#0F8A3B]"
        : "bg-[#FFF7E6] text-[#B66A00]";
    } else if (type === "install") {
      return numValue >= 8
        ? "bg-[#E6F9EC] text-[#0F8A3B]"
        : "bg-[#FFF7E6] text-[#B66A00]";
    } else if (type === "roas") {
      return numValue >= 200
        ? "bg-[#E6F9EC] text-[#0F8A3B]"
        : "bg-[#FFF7E6] text-[#B66A00]";
    }
    return "bg-[#FFF7E6] text-[#B66A00]";
  };

  const getMetricChip = (value, type) => {
    const chipStyle = getMetricChipStyle(value, type);
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${chipStyle}`}
      >
        {value}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: "bg-[#E9F7EF] text-[#0F8A3B]",
      Inactive: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  const getTierBadges = (tiers) => {
    if (!tiers || tiers.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {tiers.map((tier) => (
          <TierBadge key={tier} tier={tier} />
        ))}
      </div>
    );
  };

  const getCountryFlags = (countries) => {
    if (!countries || countries.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {countries.slice(0, 3).map((country) => (
          <span
            key={country}
            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
            title={country}
          >
            {country}
          </span>
        ))}
        {countries.length > 3 && (
          <span
            className="text-xs text-gray-500"
            title={`+${countries.length - 3} more countries`}
          >
            +{countries.length - 3}
          </span>
        )}
      </div>
    );
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "No expiry";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Expired</span>;
    } else if (diffDays <= 7) {
      return (
        <span className="text-orange-600 font-medium">{diffDays}d left</span>
      );
    } else {
      return <span className="text-gray-900">{date.toLocaleDateString()}</span>;
    }
  };

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setShowEditModal(true);
  };

  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setShowEditModal(true);
  };

  const handleSegmentsOffer = (offer) => {
    setSelectedOffer(offer);
    setShowSegmentsModal(true);
  };

  const handleViewOffer = async (offer) => {
    try {
      // Fetch fresh data from API for viewing
      const freshOfferData = await getOfferById(offer.id);
      setSelectedOffer(freshOfferData);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error fetching offer details:", error);
      // Fallback to using existing data if API call fails
      setSelectedOffer(offer);
      setShowPreviewModal(true);
    }
  };

  const handleSaveSegments = (segmentData) => {
    console.log("Applying segment changes:", segmentData);
    // TODO: Implement API call to save segment changes
    // For now, just close the modal
    setShowSegmentsModal(false);
    setSelectedOffer(null);
  };

  const handleDeleteOffer = (offer) => {
    setSelectedOffer(offer);
    setShowDeleteModal(true);
  };

  const confirmDeleteOffer = async () => {
    if (selectedOffer) {
      try {
        // Delete offer via API
        await deleteOffer(selectedOffer.id);
        setShowDeleteModal(false);
        setSelectedOffer(null);
        // Refresh data
        const apiFilters = {
          search: searchTerm,
          status: filters.status,
          country: filters.country,
          sdkProvider: filters.sdkProvider,
          xpTier: filters.xpTier,
          adOffer: filters.adOffer,
        };
        fetchOffers(currentPage, apiFilters, itemsPerPage);
      } catch (error) {
        console.error("Error deleting offer:", error);
      }
    }
  };

  const handleSaveOffer = async (offerData) => {
    try {
      if (selectedOffer) {
        // Update existing offer
        await updateOffer(selectedOffer.id, offerData);
      } else {
        // Create new offer
        await createOffer(offerData);
      }
      setShowEditModal(false);
      setSelectedOffer(null);
      // Refresh data
      const apiFilters = {
        search: searchTerm,
        status: filters.status,
        country: filters.country,
        sdkProvider: filters.sdkProvider,
        xpTier: filters.xpTier,
        adOffer: filters.adOffer,
      };
      fetchOffers(currentPage, apiFilters, itemsPerPage);
    } catch (error) {
      console.error("Error saving offer:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Offers Listing
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage all currently available offers with SDK mapping, tier
                logic, expiry, and country visibility
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateOffer}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Offer
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  aria-label="Search offers"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 flex-wrap">
              <div className="flex items-center space-x-1">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Filters:</span>
              </div>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                {STATUS_TYPES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filters.country}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, country: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by country"
              >
                <option value="all">All Countries</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                value={filters.sdkProvider}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sdkProvider: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by SDK provider"
              >
                <option value="all">All SDKs</option>
                {SDK_PROVIDERS.map((sdk) => (
                  <option key={sdk} value={sdk}>
                    {sdk}
                  </option>
                ))}
              </select>

              <select
                value={filters.xpTier}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, xpTier: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by XP Tier"
              >
                <option value="all">All XP Tiers</option>
                {XP_TIER_TYPES.map((xpTier) => (
                  <option key={xpTier} value={xpTier}>
                    {xpTier}
                  </option>
                ))}
              </select>

              <select
                value={filters.adOffer}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, adOffer: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by ad offer type"
              >
                <option value="all">All Ad Types</option>
                {AD_OFFER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={filters.channel}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, channel: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filter by channel"
              >
                <option value="all">All Channels</option>
                {MARKETING_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SDK Offer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retention Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Install Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SDK Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketing Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Countries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOffers.length === 0 ? (
                <tr>
                  <td
                    colSpan="18"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm ||
                    Object.values(filters).some((f) => f !== "all")
                      ? "No offers match your current filters."
                      : "No offers configured yet. Add your first offer to get started."}
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.offerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.sdkOffer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.rewardType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.rewardValue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.retentionRate, "retention")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.clickRate, "click")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.installRate, "install")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetricChip(offer.roas, "roas")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.sdkProvider}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <XPTierBadge xpTier={offer.xpTier} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          offer.adOffer === "Ad-Based"
                            ? "bg-orange-100 text-orange-800"
                            : offer.adOffer === "Non-Ad"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {offer.adOffer}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.marketingChannel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.campaign}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {formatExpiryDate(offer.expiryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCountryFlags(offer.countries)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTierBadges(offer.tiers)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewOffer(offer)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View offer details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit offer"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete offer"
                        >
                          <TrashIcon className="h-4 w-4" />
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
        {filteredOffers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(
                  currentPage * itemsPerPage,
                  apiPagination.totalOffers
                )}{" "}
                of {apiPagination.totalOffers} offers
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Offer Modal */}
      <EditOfferModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        onSave={handleSaveOffer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOffer(null);
        }}
        onConfirm={confirmDeleteOffer}
        title="Delete Offer"
        message={`Are you sure you want to delete the offer "${selectedOffer?.offerName}"? This action cannot be undone.`}
        confirmText="Delete Offer"
        type="warning"
      />

      {/* Manage Segments Modal */}
      <ManageSegmentsModal
        isOpen={showSegmentsModal}
        onClose={() => {
          setShowSegmentsModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        onSave={handleSaveSegments}
      />

      {/* Offer Preview Modal */}
      <OfferPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
      />
    </div>
  );
}
