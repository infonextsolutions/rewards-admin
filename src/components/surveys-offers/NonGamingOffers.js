"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Pagination from "../ui/Pagination";
import LoadingSpinner from "../ui/LoadingSpinner";
import surveyAPIs from "../../data/surveys/surveyAPI";
import toast from "react-hot-toast";
import OfferPreviewModal from "./modals/OfferPreviewModal";
import TargetAudienceModal from "./modals/TargetAudienceModal";
import * as XLSX from "xlsx";

export default function NonGamingOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sdkFilter, setSdkFilter] = useState("bitlabs"); // bitlabs | everflow
  const fetchIdRef = useRef(0); // ignore stale responses when provider/filters change
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [typeFilter, setTypeFilter] = useState("cashback"); // cashback (default), magic-receipts, shopping, all (surveys excluded)
  const [deviceFilter, setDeviceFilter] = useState("all"); // all, android, iphone, ipad
  const [countryFilter, setCountryFilter] = useState("US"); // Country code filter (default: US)
  const [cashbackSort, setCashbackSort] = useState(""); // "", "high-to-low", "low-to-high"
  const [epcSort, setEpcSort] = useState(""); // "", "high-to-low", "low-to-high" - for shopping offers
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [configuredOffers, setConfiguredOffers] = useState([]);
  const [showConfigured, setShowConfigured] = useState(false);
  const [togglingOffers, setTogglingOffers] = useState(new Set()); // Track which offers are being toggled
  const [showTargetAudienceModal, setShowTargetAudienceModal] = useState(false);
  const [pendingSyncAction, setPendingSyncAction] = useState(null); // Store sync action details
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedOfferForPreview, setSelectedOfferForPreview] = useState(null);

  // Fetch non-game offers
  const fetchOffers = async (
    page = pagination.currentPage,
    type = typeFilter
  ) => {
    const thisFetchId = ++fetchIdRef.current;
    console.log("NonGamingOffers: fetchOffers called", {
      page,
      type,
      country: countryFilter,
      sdkFilter,
      thisFetchId,
    });
    setLoading(true);
    try {
      let response;

      // Everflow does not provide BitLabs-specific non-gaming types (cashback/magic receipts/shopping)
      // For Everflow, we fetch all offers and map them into the same UI shape.
      if (sdkFilter === "everflow") {
        response = await surveyAPIs.getEverflowOffers({
          type: "all",
          ...(countryFilter &&
            countryFilter !== "US" && { country: countryFilter }),
        });

        if (thisFetchId !== fetchIdRef.current) return; // stale response, ignore

        if (response.success && Array.isArray(response.data)) {
          const mappedOffers = response.data.map((offer) => {
            const coins = offer.userRewardCoins ?? offer.coinReward ?? 0;
            const xp = offer.userRewardXP ?? 0;
            return {
              id:
                offer.id ??
                offer.offerId ??
                offer.network_offer_id?.toString() ??
                offer.networkOfferId?.toString(),
              offerId:
                offer.offerId ??
                offer.network_offer_id?.toString() ??
                offer.networkOfferId?.toString(),
              title: offer.title || offer.name || "Untitled Offer",
              description: offer.description || offer.html_description || "",
              type: offer.offerType || offer.type || "other",
              category:
                offer.relationship?.category?.name ||
                offer.category ||
                offer.category_name ||
                offer.network_category_id?.toString() ||
                "General",
              icon: offer.thumbnailUrl || offer.thumbnail_url || "",
              banner: offer.thumbnailUrl || offer.thumbnail_url || "",
              coinReward: offer.coinReward ?? coins,
              userRewardCoins: coins,
              userRewardXP: xp,
              reward: offer.reward || {
                coins,
                currency: offer.currency || "USD",
                xp,
              },
              clickUrl:
                offer.clickUrl ||
                offer.tracking_url ||
                offer.trackingUrl ||
                offer.preview_url ||
                offer.previewUrl ||
                offer.tracking_link ||
                "",
              provider: "everflow",
              estimatedTime: offer.estimatedTime ?? offer.loi ?? 0,
              isAvailable: offer.isAvailable !== false,
              sdkProvider: "everflow",
              merchant_name: offer.title || offer.name || "",
              primary_category:
                offer.relationship?.category?.name ||
                offer.category ||
                offer.category_name ||
                offer.network_category_id?.toString() ||
                "",
              currency: offer.currency || offer.currency_id || "USD",
              payoutAmount: offer.payoutAmount ?? offer.relationship?.payouts?.entries?.[0]?.payout_amount,
              creativeBundleUrl: offer.creativeBundleUrl || offer.relationship?.creative_bundle?.url || "",
              total_points: offer.payoutAmount?.toString() ?? offer.total_points ?? "0",
              epc: offer.epc || "0",
              pending_time: offer.pending_time ?? 0,
              reward_delay_days: offer.reward_delay_days ?? 0,
              confirmation_time: offer.confirmation_time || "",
              status: offer.status || (offer.offer_status === "active" ? "live" : "live"),
            };
          });

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: 1,
            totalItems: mappedOffers.length,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
        return;
      }

      if (type === "cashback") {
        // Use admin route with type filter - only send necessary params
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "cashback",
          ...(countryFilter &&
            countryFilter !== "US" && { country: countryFilter }),
          ...(devices && { devices: devices }),
        });

        if (thisFetchId !== fetchIdRef.current) return;

        if (response.success && response.categorized) {
          const cashbackOffers = response.categorized.cashback || [];
          const mappedOffers = cashbackOffers.map((offer) => {
            const payout = offer.events?.[0];
            const payoutNum = payout ? parseFloat(payout.payout) : parseFloat(offer.total_points) || 0;
            const pointsNum = parseFloat(offer.total_points) || (payout ? parseFloat(payout.points) : 0) || 0;
            const userCoins = offer.userRewardCoins ?? Math.round(payoutNum * 0.2);
            const userXP = offer.userRewardXP ?? Math.round(userCoins * 0.5);
            const epcVal = offer.epc != null ? parseFloat(offer.epc) : 0;
            const pendingTimeSec = offer.pending_time != null ? Number(offer.pending_time) : 0;
            return {
              id: offer.id ?? offer.offerId ?? offer.merchant_id?.toString(),
              offerId: offer.offerId ?? offer.id ?? offer.merchant_id?.toString(),
              title:
                offer.title ||
                offer.name ||
                offer.anchor ||
                offer.merchant_name ||
                "Untitled Cashback Offer",
              description: offer.description || "",
              type: "cashback",
              category:
                typeof offer.category === "string"
                  ? offer.category
                  : Array.isArray(offer.categories) && offer.categories[0]
                  ? offer.categories[0]
                  : offer.category?.name || offer.primary_category || "Cashback",
              icon:
                offer.creatives?.icon ||
                offer.icon ||
                offer.banner ||
                offer.images?.cardImageSmall ||
                "",
              banner:
                offer.creatives?.icon ||
                offer.banner ||
                offer.icon ||
                offer.images?.cardImage ||
                "",
              reward: offer.reward || { coins: userCoins, currency: "points", xp: userXP },
              clickUrl: offer.clickUrl || offer.url || offer.click_url || "",
              provider: offer.provider || "bitlabs",
              merchant_name: offer.merchant_name || offer.name || offer.anchor || "",
              cashback: offer.cashback || offer.original_cashback || "0",
              currency: offer.currency || "USD",
              primary_category: offer.primary_category || offer.categories?.[0] || "",
              images: offer.images || {},
              reward_delay_days: offer.reward_delay_days ?? (pendingTimeSec ? Math.round(pendingTimeSec / 86400) : 0),
              flat_payout: offer.flat_payout || false,
              up_to: offer.up_to || false,
              country_code: offer.country_code || offer.geo_targeting?.countries?.[0]?.country_code || "",
              terms: offer.terms || [],
              tier_mappings: offer.tier_mappings || [],
              rank: offer.rank || 0,
              total_points: offer.total_points ?? payout?.points ?? "0",
              epc: offer.epc != null ? String(offer.epc) : "0",
              pending_time: offer.pending_time ?? 0,
              events: offer.events || [],
              userRewardCoins: userCoins,
              userRewardXP: userXP,
              estimatedTime: offer.estimatedTime ?? (pendingTimeSec ? Math.round(pendingTimeSec / 3600) : 0),
              isAvailable: offer.isAvailable !== false,
              sdkProvider: offer.sdkProvider || offer.provider || "bitlabs",
            };
          });

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.cashback?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.cashback?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else if (type === "magic-receipts") {
        // Use admin route with type filter - only send necessary params
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "magic_receipt",
          ...(countryFilter &&
            countryFilter !== "US" && { country: countryFilter }),
          ...(devices && { devices: devices }),
        });

        if (thisFetchId !== fetchIdRef.current) return;

        if (response.success && response.categorized) {
          const magicReceipts = response.categorized.magicReceipts || [];
          const mappedOffers = magicReceipts.map((offer) => ({
            id: offer.id || offer.offerId || offer.id?.toString(),
            offerId: offer.offerId || offer.id || offer.id?.toString(),
            title:
              offer.title ||
              offer.name ||
              offer.anchor ||
              offer.product_name ||
              "Untitled Magic Receipt",
            description: offer.description || "",
            type: "magic-receipt",
            category:
              typeof offer.category === "string"
                ? offer.category
                : Array.isArray(offer.categories) && offer.categories.length > 0
                ? offer.categories[0]
                : offer.category?.name || "Magic Receipt",
            icon:
              offer.icon ||
              offer.banner ||
              offer.icon_url ||
              offer.creatives?.icon ||
              "",
            banner:
              offer.banner ||
              offer.icon ||
              offer.creatives?.images?.["600x300"] ||
              offer.creatives?.icon ||
              "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            clickUrl: offer.clickUrl || offer.url || offer.click_url || "",
            provider: offer.provider || "bitlabs",
            // Magic Receipt-specific fields
            anchor: offer.anchor || "",
            product_name: offer.product_name || "",
            product_id: offer.product_id || "",
            total_points: offer.total_points || "0",
            confirmation_time:
              offer.confirmation_time || offer.confirmationTime || "",
            pending_time: offer.pending_time || offer.pendingTime || 0,
            offer_expires_at:
              offer.offer_expires_at || offer.offerExpiresAt || null,
            creatives: offer.creatives || {},
            categories: offer.categories || [],
            epc: offer.epc || "0",
            events: offer.events || [],
            requirements: offer.requirements || "",
            things_to_know: offer.things_to_know || offer.thingsToKnow || [],
            mobile_verification_required:
              offer.mobile_verification_required ||
              offer.mobileVerificationRequired ||
              false,
            is_game: offer.is_game || offer.isGame || false,
            is_sticky: offer.is_sticky || offer.isSticky || false,
            disclaimer: offer.disclaimer || "",
            support_url: offer.support_url || offer.supportUrl || "",
            session_hours: offer.session_hours || offer.sessionHours || 0,
            // Additional fields
            estimatedTime: offer.estimatedTime || 0,
            isAvailable: offer.isAvailable !== false,
            sdkProvider: offer.sdkProvider || offer.provider || "bitlabs",
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.magicReceipts?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.magicReceipts?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else if (type === "shopping") {
        // Use admin route with type filter - only send necessary params
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "shopping",
          ...(countryFilter &&
            countryFilter !== "US" && { country: countryFilter }),
          ...(devices && { devices: devices }),
        });

        if (thisFetchId !== fetchIdRef.current) return;

        if (response.success && response.categorized) {
          const shoppingOffers = response.categorized.shopping || [];
          const mappedOffers = shoppingOffers.map((offer) => {
            const payout = offer.events?.[0];
            const pointsNum = parseFloat(offer.total_points) || (payout ? parseFloat(payout.points) : 0) || 0;
            const payoutNum = payout ? parseFloat(payout.payout) : 0;
            const valueForReward = pointsNum > 0 ? pointsNum : payoutNum;
            const userCoins = offer.userRewardCoins ?? Math.round(valueForReward * 0.2);
            const userXP = offer.userRewardXP ?? Math.round(userCoins * 0.5);
            return {
            id: offer.id ?? offer.offerId ?? offer.id?.toString(),
            offerId: offer.offerId ?? offer.id ?? offer.id?.toString(),
            title:
              offer.title ||
              offer.name ||
              offer.anchor ||
              offer.product_name ||
              "Untitled Shopping Offer",
            description: offer.description || "",
            type: "shopping",
            category:
              typeof offer.category === "string"
                ? offer.category
                : Array.isArray(offer.categories) && offer.categories.length > 0
                ? offer.categories[0]
                : offer.category?.name || "Shopping",
            icon:
              offer.icon ||
              offer.banner ||
              offer.icon_url ||
              offer.creatives?.icon ||
              "",
            banner:
              offer.banner ||
              offer.icon ||
              offer.creatives?.images?.["600x300"] ||
              offer.creatives?.icon ||
              "",
            reward: offer.reward || { coins: userCoins, currency: "points", xp: userXP },
            userRewardCoins: userCoins,
            userRewardXP: userXP,
            clickUrl: offer.clickUrl || offer.url || offer.click_url || "",
            provider: offer.provider || "bitlabs",
            anchor: offer.anchor || "",
            product_name: offer.product_name || "",
            product_id: offer.product_id || "",
            total_points: offer.total_points || "0",
            confirmation_time:
              offer.confirmation_time || offer.confirmationTime || "",
            pending_time: offer.pending_time ?? offer.pendingTime ?? 0,
            offer_expires_at:
              offer.offer_expires_at || offer.offerExpiresAt || null,
            creatives: offer.creatives || {},
            categories: offer.categories || [],
            epc: offer.epc || "0",
            events: offer.events || [],
            requirements: offer.requirements || "",
            things_to_know: offer.things_to_know || offer.thingsToKnow || [],
            mobile_verification_required:
              offer.mobile_verification_required ||
              offer.mobileVerificationRequired ||
              false,
            is_game: offer.is_game || offer.isGame || false,
            is_sticky: offer.is_sticky || offer.isSticky || false,
            disclaimer: offer.disclaimer || "",
            support_url: offer.support_url || offer.supportUrl || "",
            session_hours: offer.session_hours || offer.sessionHours || 0,
            // Additional fields
            estimatedTime: offer.estimatedTime || 0,
            isAvailable: offer.isAvailable !== false,
            sdkProvider: offer.sdkProvider || offer.provider || "bitlabs",
            };
          });

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              (response.categorized.shopping?.length || 0) /
                pagination.itemsPerPage
            ),
            totalItems: response.categorized.shopping?.length || 0,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      } else {
        // Get all non-game offers from admin route (excluding surveys) - only send necessary params
        const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
        response = await surveyAPIs.getBitLabNonGameOffers({
          type: "all",
          ...(countryFilter &&
            countryFilter !== "US" && { country: countryFilter }),
          ...(devices && { devices: devices }),
        });

        if (thisFetchId !== fetchIdRef.current) return;

        if (response.success && response.data) {
          // Admin route returns: { data: offers[], categorized: {}, breakdown: {}, total: number, estimatedEarnings: number }
          // Filter out surveys from the response
          const allOffers = (response.data || []).filter(
            (offer) => offer.type !== "survey" && offer.type !== "surveys"
          );
          const mappedOffers = allOffers.map((offer) => ({
            id: offer.id ?? offer.offerId ?? offer.surveyId ?? offer.product_id ?? offer.merchant_id,
            offerId: offer.offerId ?? offer.id ?? offer.surveyId,
            title: offer.title || offer.name || offer.anchor || offer.product_name || offer.merchant_name || "Untitled Offer",
            description: offer.description || "",
            type: offer.type || "other",
            category:
              typeof offer.category === "string"
                ? offer.category
                : Array.isArray(offer.categories) && offer.categories[0]
                ? (typeof offer.categories[0] === "string" ? offer.categories[0] : offer.categories[0]?.name)
                : offer.category?.name || "General",
            icon: offer.creatives?.icon || offer.icon || offer.banner || "",
            banner: offer.creatives?.icon || offer.banner || offer.icon || "",
            reward: offer.reward || { coins: 0, currency: "points", xp: 0 },
            clickUrl:
              offer.clickUrl ||
              offer.click_url ||
              offer.surveyUrl ||
              offer.downloadUrl ||
              offer.url ||
              "",
            provider: offer.provider || "bitlabs",
            estimatedTime: offer.estimatedTime ?? offer.duration ?? 0,
            isAvailable: offer.isAvailable !== false,
          }));

          setOffers(mappedOffers);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(
              mappedOffers.length / pagination.itemsPerPage
            ),
            totalItems: mappedOffers.length,
            itemsPerPage: pagination.itemsPerPage,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching non-game offers:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
      });

      // Provide more helpful error messages
      let errorMessage = error.message || "Failed to load non-game offers";
      if (error.message && error.message.includes("Connection refused")) {
        errorMessage =
          "Backend server is not running. Please start the backend server on port 4001.";
      } else if (error.message && error.message.includes("Network Error")) {
        errorMessage =
          "Cannot connect to backend server. Please ensure the backend server is running on port 4001.";
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch configured offers from database (Bitlabs, Besitos, or Everflow by sdkFilter)
  const fetchConfiguredOffers = async () => {
    try {
      console.log("Fetching configured offers...", { sdkFilter });
      const response = await surveyAPIs.getConfiguredBitLabOffers({
        offerType: "all",
        status: "all",
        sdk: sdkFilter === "everflow" ? "everflow" : sdkFilter === "besitos" ? "besitos" : "bitlabs",
      });
      console.log("Configured offers response:", response);
      if (response.success) {
        setConfiguredOffers(response.data.configuredOffers || []);
        console.log(
          "Configured offers set:",
          response.data.configuredOffers?.length || 0
        );
      }
    } catch (error) {
      console.error("Error fetching configured offers:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
      });
      // Show error to user
      if (error.message && !error.message.includes("404")) {
        toast.error("Failed to load configured offers: " + error.message);
      }
    }
  };

  // Single effect: fetch when filters or provider change (including initial mount).
  // Avoids duplicate fetches on mount and prevents stale Bitlabs response overwriting Everflow after switch.
  useEffect(() => {
    console.log("NonGamingOffers: Fetching offers...", {
      typeFilter,
      countryFilter,
      deviceFilter,
      sdkFilter,
    });
    setSelectedOffers([]); // Clear selection when filter changes
    if (typeFilter !== "cashback") setCashbackSort("");
    if (typeFilter !== "shopping") setEpcSort("");
    fetchOffers(1, typeFilter);
    fetchConfiguredOffers();
  }, [typeFilter, countryFilter, deviceFilter, sdkFilter]);

  // Sort offers by cashback percentage or EPC when sort is active
  const sortedOffers = useMemo(() => {
    if (typeFilter === "cashback" && cashbackSort) {
      const sorted = [...offers];
      sorted.sort((a, b) => {
        const cashbackA = parseFloat(a.cashback || a.original_cashback || "0");
        const cashbackB = parseFloat(b.cashback || b.original_cashback || "0");

        if (cashbackSort === "high-to-low") {
          return cashbackB - cashbackA; // Descending
        } else if (cashbackSort === "low-to-high") {
          return cashbackA - cashbackB; // Ascending
        }
        return 0;
      });
      return sorted;
    } else if (typeFilter === "shopping" && epcSort) {
      const sorted = [...offers];
      sorted.sort((a, b) => {
        const epcA = parseFloat(a.epc || "0");
        const epcB = parseFloat(b.epc || "0");

        if (epcSort === "high-to-low") {
          return epcB - epcA; // Descending
        } else if (epcSort === "low-to-high") {
          return epcA - epcB; // Ascending
        }
        return 0;
      });
      return sorted;
    }
    return offers;
  }, [offers, typeFilter, cashbackSort, epcSort]);

  const handlePageChange = (newPage) => {
    fetchOffers(newPage, typeFilter);
  };

  // Check if offer is already configured (compare multiple ID fields as strings)
  // This matches both new records (externalId = Bitlabs offer.id) and any older records
  // where we might have used product_id or other fields.
  const isConfigured = (offerId) => {
    if (offerId == null) return false;
    const idStr = String(offerId);
    return configuredOffers.some((c) => {
      const externalId = c.externalId != null ? String(c.externalId) : null;
      const offerIdField = c.offerId != null ? String(c.offerId) : null;
      const idField = c.id != null ? String(c.id) : null;
      return externalId === idStr || offerIdField === idStr || idField === idStr;
    });
  };

  // Get configured offer by ID (check externalId, offerId and _id)
  const getConfiguredOffer = (offerId) => {
    if (offerId == null) return null;
    const idStr = String(offerId);
    return (
      configuredOffers.find((c) => {
        const externalId = c.externalId != null ? String(c.externalId) : null;
        const offerIdField = c.offerId != null ? String(c.offerId) : null;
        const idField = c.id != null ? String(c.id) : null;
        return externalId === idStr || offerIdField === idStr || idField === idStr;
      }) || null
    );
  };

  // Handle toggle for individual offer
  const handleToggleOffer = async (offer) => {
    const offerId = offer.id;
    const isCurrentlyConfigured = isConfigured(offerId);

    console.log("Toggle offer clicked:", {
      offerId,
      isCurrentlyConfigured,
      offer,
    });

    setTogglingOffers((prev) => new Set(prev).add(offerId));

    try {
      if (isCurrentlyConfigured) {
        // Unsync/Delete the offer
        const configuredOffer = getConfiguredOffer(offerId);
        console.log("Deleting offer:", configuredOffer);
        if (configuredOffer?.id) {
          const response = await surveyAPIs.deleteConfiguredOffer(
            configuredOffer.id
          );
          console.log("Delete response:", response);
          toast.success("Offer removed successfully");
        } else {
          console.warn("No configured offer ID found for:", offerId);
          toast.error("Could not find offer to delete");
        }
      } else {
        if (sdkFilter === "everflow") {
          setPendingSyncAction({
            type: "single_everflow",
            offerId: offerId,
          });
          setShowTargetAudienceModal(true);
          return;
        } else {
          setPendingSyncAction({
            type: "single",
            offerId: offerId,
            offerType: offer.type || typeFilter,
          });
          setShowTargetAudienceModal(true);
          return;
        }
      }

      await fetchConfiguredOffers();
    } catch (error) {
      console.error("Error toggling offer:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.data,
        stack: error.stack,
      });
      toast.error(
        error.message || error.data?.message || "Failed to toggle offer"
      );
    } finally {
      setTogglingOffers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  // Handle offer selection
  const handleSelectOffer = (offerId) => {
    setSelectedOffers((prev) =>
      prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(offers.map((o) => o.id));
    }
  };

  // Map frontend type to backend type
  const getBackendOfferType = (frontendType) => {
    const typeMap = {
      cashback: "cashback",
      shopping: "shopping",
      "magic-receipts": "magic_receipt",
      all: "all",
    };
    return typeMap[frontendType] || "all";
  };

  // Export offers to Excel
  const handleExportToExcel = () => {
    if (sortedOffers.length === 0) {
      toast.error("No offers to export");
      return;
    }

    try {
      // Prepare data for Excel based on offer type
      const isCashback = typeFilter === "cashback";
      const isShopping = typeFilter === "shopping";
      const isMagicReceipt = typeFilter === "magic-receipts";

      const excelData = sortedOffers.map((offer) => {
        const baseData = {
          "Offer ID": offer.id || "",
          Title:
            offer.title ||
            offer.merchant_name ||
            offer.anchor ||
            offer.product_name ||
            "",
          Description: offer.description || "",
          Type: offer.type || "",
          Category:
            isShopping || isMagicReceipt
              ? offer.categories && offer.categories.length > 0
                ? offer.categories[0]
                : ""
              : offer.primary_category || offer.category || "",
          Status: offer.isAvailable !== false ? "Available" : "Unavailable",
          Provider: offer.provider || offer.sdkProvider || "bitlabs",
        };

        if (isCashback) {
          return {
            ...baseData,
            "Merchant Name": offer.merchant_name || "",
            Cashback: offer.cashback || offer.original_cashback || "0",
            Currency: offer.currency || "USD",
            "Reward Delay (Days)": offer.reward_delay_days || 0,
            "Up To": offer.up_to ? "Yes" : "No",
            "Flat Payout": offer.flat_payout ? "Yes" : "No",
            "Country Code": offer.country_code || "",
            Rank: offer.rank || 0,
          };
        } else if (isShopping || isMagicReceipt) {
          return {
            ...baseData,
            "Product Name": offer.product_name || "",
            Anchor: offer.anchor || "",
            "Total Points": offer.total_points || "0",
            EPC: offer.epc ? `$${offer.epc}` : "",
            "Confirmation Time": offer.confirmation_time || "",
            "Pending Time (Hours)": offer.pending_time
              ? Math.floor(offer.pending_time / 3600)
              : 0,
            "Expires At": offer.offer_expires_at
              ? new Date(offer.offer_expires_at).toLocaleDateString()
              : "",
            "Mobile Verification Required": offer.mobile_verification_required
              ? "Yes"
              : "No",
            "Is Game": offer.is_game ? "Yes" : "No",
            Requirements: offer.requirements || "",
          };
        }

        return baseData;
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Offers");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `non-gaming-offers-${typeFilter}-${timestamp}.xlsx`;

      // Write file and trigger download
      XLSX.writeFile(wb, filename);
      toast.success(`Exported ${sortedOffers.length} offers to Excel`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export offers to Excel");
    }
  };

  // Handle preview button click
  const handlePreviewOffer = (offer) => {
    // Map offer to format expected by OfferPreviewModal
    const isCashback = offer.type === "cashback";
    const isShopping = offer.type === "shopping";
    const isMagicReceipt = offer.type === "magic-receipt";

    const previewOffer = {
      id: offer.id,
      title: isCashback
        ? offer.merchant_name || offer.title || "Untitled Offer"
        : isShopping || isMagicReceipt
        ? offer.anchor || offer.product_name || offer.title || "Untitled Offer"
        : offer.title || "Untitled Offer",
      description: offer.description || "",
      coinReward:
        isShopping || isMagicReceipt
          ? parseInt(offer.total_points) || 0
          : offer.reward?.coins || 0,
      estimatedTime: offer.estimatedTime || 0,
      difficulty: "Easy", // Default
      category:
        (isShopping || isMagicReceipt) &&
        offer.categories &&
        offer.categories.length > 0
          ? offer.categories[0]
          : offer.category || offer.primary_category || "General",
      sdkSource: offer.sdkProvider || offer.provider || "bitlabs",
      // Cashback-specific fields
      merchant_name: offer.merchant_name,
      cashback: offer.cashback,
      currency: offer.currency,
      primary_category: offer.primary_category,
      images: offer.images,
      reward_delay_days: offer.reward_delay_days,
      flat_payout: offer.flat_payout,
      up_to: offer.up_to,
      country_code: offer.country_code,
      terms: offer.terms,
      tier_mappings: offer.tier_mappings,
      rank: offer.rank,
      // Shopping-specific fields
      anchor: offer.anchor,
      product_name: offer.product_name,
      product_id: offer.product_id,
      total_points: offer.total_points,
      confirmation_time: offer.confirmation_time || offer.confirmationTime,
      pending_time: offer.pending_time || offer.pendingTime,
      offer_expires_at: offer.offer_expires_at || offer.offerExpiresAt,
      creatives: offer.creatives,
      categories: offer.categories,
      epc: offer.epc,
      events: offer.events,
      requirements: offer.requirements,
      things_to_know: offer.things_to_know || offer.thingsToKnow,
      mobile_verification_required:
        offer.mobile_verification_required || offer.mobileVerificationRequired,
      is_game: offer.is_game || offer.isGame,
      is_sticky: offer.is_sticky || offer.isSticky,
      disclaimer: offer.disclaimer,
      support_url: offer.support_url || offer.supportUrl,
      session_hours: offer.session_hours || offer.sessionHours,
      clickUrl: offer.clickUrl,
      type: offer.type,
      // Include all original offer data for detailed preview
      ...offer,
    };
    setSelectedOfferForPreview(previewOffer);
    setShowPreviewModal(true);
  };

  // Sync selected offers to database
  const handleSyncSelected = () => {
    if (selectedOffers.length === 0) {
      toast.error("Please select at least one offer to sync");
      return;
    }

    // Store sync action and show modal
    setPendingSyncAction({
      type: "selected",
      offerIds: selectedOffers,
    });
    setShowTargetAudienceModal(true);
  };

  // Actual sync function called after modal confirmation
  const performSync = async (targetAudience) => {
    if (!pendingSyncAction) return;

    setSyncing(true);
    try {
      const backendType = getBackendOfferType(typeFilter);
      const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
      const country = countryFilter;

      // Prepare target audience data for each offer
      const offersWithAudience = pendingSyncAction.offerIds.map((offerId) => ({
        offerId,
        targetAudience: targetAudience,
      }));

      const response = await surveyAPIs.syncBitLabOffers({
        offerIds: pendingSyncAction.offerIds,
        offerType: backendType === "all" ? "all" : backendType,
        autoActivate: true,
        devices: devices,
        country: country,
        targetAudience: offersWithAudience,
      });

      if (response.success) {
        toast.success(
          `Successfully synced ${response.data.syncedCount} offer(s)! ${
            response.data.updatedCount > 0
              ? `${response.data.updatedCount} updated.`
              : ""
          }`
        );
        setSelectedOffers([]);
        // Refresh offers and configured list
        fetchOffers(1, typeFilter);
        fetchConfiguredOffers();
      }
    } catch (error) {
      console.error("Error syncing offers:", error);
      toast.error(error.message || "Failed to sync offers");
    } finally {
      setSyncing(false);
      setPendingSyncAction(null);
    }
  };

  // Sync all offers of current type to database
  const handleSyncAll = () => {
    // Get all offer IDs from current page
    const allOfferIds = sortedOffers.map((offer) => offer.id);

    if (allOfferIds.length === 0) {
      toast.error("No offers to sync");
      return;
    }

    // Store sync action and show modal
    setPendingSyncAction({
      type: "all",
      offerIds: allOfferIds,
    });
    setShowTargetAudienceModal(true);
  };

  // Actual sync all function called after modal confirmation
  const performSyncAll = async (targetAudience) => {
    if (!pendingSyncAction) return;

    setSyncing(true);
    try {
      const backendType = getBackendOfferType(typeFilter);
      const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
      const country = countryFilter;

      // Prepare target audience data for each offer
      const offersWithAudience = pendingSyncAction.offerIds.map((offerId) => ({
        offerId,
        targetAudience: targetAudience,
      }));

      const response = await surveyAPIs.syncBitLabOffers({
        offerIds: pendingSyncAction.offerIds,
        offerType: backendType === "all" ? "all" : backendType,
        autoActivate: true,
        devices: devices,
        country: country,
        targetAudience: offersWithAudience,
      });

      if (response.success) {
        toast.success(
          `Successfully synced ${response.data.syncedCount} offer(s)! ${
            response.data.updatedCount > 0
              ? `${response.data.updatedCount} updated.`
              : ""
          }`
        );
        setSelectedOffers([]);
        // Refresh offers and configured list
        fetchOffers(1, typeFilter);
        fetchConfiguredOffers();
      }
    } catch (error) {
      console.error("Error syncing all offers:", error);
      toast.error(error.message || "Failed to sync offers");
    } finally {
      setSyncing(false);
      setPendingSyncAction(null);
    }
  };

  // Handle single Everflow offer sync after modal confirmation
  const performSingleEverflowSync = async (targetAudience) => {
    if (!pendingSyncAction || pendingSyncAction.type !== "single_everflow") return;

    const offerId = pendingSyncAction.offerId;
    setTogglingOffers((prev) => new Set(prev).add(offerId));
    setShowTargetAudienceModal(false);
    setPendingSyncAction(null);
    try {
      const response = await surveyAPIs.syncEverflowOffers({
        offerIds: [offerId],
        autoActivate: true,
        targetAudience: [{ offerId: String(offerId), targetAudience }],
      });
      if (response?.success) {
        toast.success("Everflow offer added (30 coins, 10 XP)");
        await fetchConfiguredOffers();
      }
    } catch (error) {
      console.error("Error syncing Everflow offer:", error);
      toast.error(error.message || "Failed to sync Everflow offer");
    } finally {
      setTogglingOffers((prev) => {
        const next = new Set(prev);
        next.delete(offerId);
        return next;
      });
    }
  };

  // Handle single offer sync after modal confirmation
  const performSingleSync = async (targetAudience) => {
    if (!pendingSyncAction || pendingSyncAction.type !== "single") return;

    const offerId = pendingSyncAction.offerId;
    setTogglingOffers((prev) => new Set(prev).add(offerId));
    try {
      const backendType = getBackendOfferType(
        pendingSyncAction.offerType || typeFilter
      );
      const devices = deviceFilter !== "all" ? [deviceFilter] : undefined;
      const country = countryFilter;

      const response = await surveyAPIs.syncSingleBitLabOffer(
        offerId,
        backendType === "all" ? "survey" : backendType,
        devices,
        country,
        targetAudience
      );

      if (response.success) {
        toast.success("Offer synced successfully");
        await fetchConfiguredOffers();
      }
    } catch (error) {
      console.error("Error syncing offer:", error);
      toast.error(error.message || "Failed to sync offer");
    } finally {
      setTogglingOffers((prev) => {
        const next = new Set(prev);
        next.delete(offerId);
        return next;
      });
      setPendingSyncAction(null);
    }
  };

  // Handle modal confirmation
  const handleTargetAudienceConfirm = (targetAudience) => {
    if (!pendingSyncAction) return;

    if (pendingSyncAction.type === "single_everflow") {
      performSingleEverflowSync(targetAudience);
    } else if (pendingSyncAction.type === "single") {
      performSingleSync(targetAudience);
    } else if (pendingSyncAction.type === "selected") {
      performSync(targetAudience);
    } else if (pendingSyncAction.type === "all") {
      performSyncAll(targetAudience);
    }
  };

  const typeOptions = [
    { value: "all", label: "All Offers" },
    { value: "cashback", label: "Cashback" },
    { value: "magic-receipts", label: "Magic Receipts" },
    { value: "shopping", label: "Shopping" },
  ];

  const deviceOptions = [
    { value: "all", label: "All Devices" },
    { value: "android", label: "Android" },
    { value: "iphone", label: "iPhone" },
    { value: "ipad", label: "iPad" },
  ];

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Non-Gaming Offers
          </h2>
          <p className="text-gray-600 mt-1">
            Toggle offers to show on user side
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportToExcel}
            disabled={loading || sortedOffers.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          {/* COMMENTED OUT: Sync Selected button (checkboxes are hidden) */}
          {/* {selectedOffers.length > 0 && (
            <button
              onClick={handleSyncSelected}
              disabled={syncing}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Sync Selected ({selectedOffers.length})</span>
            </button>
          )} */}
          {/* COMMENTED OUT: Sync All Offers button */}
          {/* <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>
              {syncing
                ? "Syncing..."
                : `Sync All ${
                    typeFilter === "all"
                      ? "Offers"
                      : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
                  }`}
            </span>
          </button> */}
          {/* COMMENTED OUT: Configured button */}
          {/* <button
            onClick={() => setShowConfigured(!showConfigured)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Configured ({configuredOffers.length})</span>
          </button> */}
        </div>
      </div>

      {/* COMMENTED OUT: Configured Offers Section */}
      {/* {showConfigured && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configured Offers (Shown to Users)
            </h3>
            <span className="text-sm text-gray-600">
              {configuredOffers.length} offers configured
            </span>
          </div>
          {configuredOffers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No offers configured yet. Select and sync offers from the list
              below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Offer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reward
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Synced
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configuredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.title || "Untitled"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {offer.description || ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {typeof offer.offerType === "string"
                            ? offer.offerType
                            : "survey"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {typeof offer.coinReward === "number"
                          ? offer.coinReward
                          : 0}{" "}
                        coins
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            offer.status === "live"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {typeof offer.status === "string"
                            ? offer.status
                            : "paused"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {offer.createdAt
                          ? new Date(offer.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )} */}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex gap-4">
          {/* SDK Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={sdkFilter}
              onChange={(e) => {
                const next = e.target.value;
                setSdkFilter(next);
                // For Everflow, force "all" since BitLabs-specific types don't apply
                if (next === "everflow") setTypeFilter("all");
                if (next === "bitlabs" && typeFilter === "all") setTypeFilter("cashback");
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="bitlabs">BitLabs</option>
              <option value="everflow">Everflow</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              disabled={sdkFilter === "everflow"}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Device Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Filter by Device
            </label>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {deviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Filter by Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cashback Sort Filter - Only show for cashback type */}
          {typeFilter === "cashback" && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Sort by Cashback
              </label>
              <select
                value={cashbackSort}
                onChange={(e) => setCashbackSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="">No Sort</option>
                <option value="high-to-low">High to Low</option>
                <option value="low-to-high">Low to High</option>
              </select>
            </div>
          )}

          {/* EPC Sort Filter - Only show for shopping type */}
          {typeFilter === "shopping" && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Sort by EPC
              </label>
              <select
                value={epcSort}
                onChange={(e) => setEpcSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="">No Sort</option>
                <option value="high-to-low">High to Low</option>
                <option value="low-to-high">Low to High</option>
              </select>
            </div>
          )}
        </div>

        {/* Filter Results Summary */}
        <div className="text-sm text-gray-600 lg:ml-auto">
          Showing {sortedOffers.length} offers
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner message="Loading non-gaming offers..." />
      ) : (
        <>
          {/* Offers Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* HIDDEN: Checkbox column */}
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedOffers.length === offers.length &&
                          offers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {typeFilter === "cashback"
                        ? "Merchant"
                        : typeFilter === "shopping" ||
                          typeFilter === "magic-receipts"
                        ? "Product/Offer"
                        : "Merchant/Offer"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {typeFilter === "cashback"
                        ? "Points / Cashback"
                        : typeFilter === "shopping" ||
                          typeFilter === "magic-receipts"
                        ? "Points"
                        : "Reward"}
                    </th>
                    {sdkFilter === "everflow" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payout
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creative bundle
                        </th>
                      </>
                    )}
                    {(typeFilter === "cashback" ||
                      typeFilter === "shopping" ||
                      typeFilter === "magic-receipts") && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EPC
                      </th>
                    )}
                    {(typeFilter === "cashback" ||
                      typeFilter === "shopping" ||
                      typeFilter === "magic-receipts") && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User reward (coins / XP)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {typeFilter === "cashback"
                        ? "Reward Delay"
                        : typeFilter === "shopping" ||
                          typeFilter === "magic-receipts"
                        ? "Confirmation"
                        : "Delay"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Add/Remove
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedOffers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          (typeFilter === "cashback"
                            ? 10
                            : typeFilter === "shopping" ||
                              typeFilter === "magic-receipts"
                            ? 10
                            : 8) + (sdkFilter === "everflow" ? 2 : 0)
                        }
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No offers found
                      </td>
                    </tr>
                  ) : (
                    sortedOffers.map((offer) => {
                      const configured = isConfigured(offer.id);
                      // Determine offer type
                      const isCashback = offer.type === "cashback";
                      const isShopping = offer.type === "shopping";
                      const isMagicReceipt = offer.type === "magic-receipt";

                      // Display name based on type
                      const displayName = isCashback
                        ? offer.merchant_name || offer.title || "Untitled"
                        : isShopping || isMagicReceipt
                        ? offer.anchor ||
                          offer.product_name ||
                          offer.title ||
                          "Untitled"
                        : offer.title || "Untitled";

                      // Image source based on type (Publisher API: creatives.icon, icon)
                      const imageSrc = isCashback
                        ? offer.creatives?.icon || offer.icon || offer.images?.cardImageSmall
                        : isShopping || isMagicReceipt
                        ? offer.creatives?.icon || offer.icon_url || offer.icon
                        : null;

                      return (
                        <tr
                          key={offer.id}
                          className={`hover:bg-gray-50 ${
                            configured ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {imageSrc && (
                                <img
                                  src={imageSrc}
                                  alt={displayName}
                                  className="w-10 h-10 rounded object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {displayName}
                                </div>
                                {offer.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {offer.description}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 font-mono mt-1">
                                  ID: {offer.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isCashback &&
                            (offer.cashback || offer.original_cashback) &&
                            parseFloat(offer.cashback || offer.original_cashback) > 0 ? (
                              <div className="text-sm">
                                <span className="font-semibold text-emerald-600">
                                  {offer.cashback || offer.original_cashback}%
                                </span>
                                {offer.currency && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    {offer.currency}
                                  </span>
                                )}
                                {offer.up_to && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (up to)
                                  </span>
                                )}
                              </div>
                            ) : (isCashback && (offer.total_points || offer.events?.[0]?.points)) ||
                              ((isShopping || isMagicReceipt) && offer.total_points) ? (
                              <div className="text-sm">
                                <span className="font-semibold text-emerald-600">
                                  {parseInt(
                                    offer.total_points ||
                                      offer.events?.[0]?.points ||
                                      0
                                  ).toLocaleString()}{" "}
                                  pts
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </td>
                          {sdkFilter === "everflow" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  {offer.payoutAmount != null && offer.payoutAmount !== ""
                                    ? `${Number(offer.payoutAmount)} ${offer.currency || "EUR"}`
                                    : "—"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {offer.creativeBundleUrl ? (
                                  <a
                                    href={offer.creativeBundleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    <img
                                      src={offer.creativeBundleUrl}
                                      alt="Bundle"
                                      className="w-10 h-10 rounded object-cover border border-gray-200 bundle-img"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        const fallback = e.target.parentElement?.querySelector(".bundle-fallback");
                                        if (fallback) fallback.classList.remove("hidden");
                                      }}
                                    />
                                    <span className="bundle-fallback hidden">View bundle</span>
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                            </>
                          )}
                          {(typeFilter === "cashback" ||
                            typeFilter === "shopping" ||
                            typeFilter === "magic-receipts") && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {offer.epc != null && String(offer.epc) !== "0" ? (
                                <div className="text-sm">
                                  <span className="font-semibold text-blue-600">
                                    ${offer.epc}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  N/A
                                </span>
                              )}
                            </td>
                          )}
                          {(typeFilter === "cashback" ||
                            typeFilter === "shopping" ||
                            typeFilter === "magic-receipts") && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {offer.pending_time != null &&
                              Number(offer.pending_time) > 0 ? (
                                <div className="text-sm text-gray-900">
                                  {Number(offer.pending_time) >= 86400
                                    ? `${Math.round(Number(offer.pending_time) / 86400)} days`
                                    : `${Math.round(Number(offer.pending_time) / 3600)} hrs`}
                                </div>
                              ) : offer.reward_delay_days != null ? (
                                <div className="text-sm text-gray-900">
                                  {offer.reward_delay_days} days
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">N/A</span>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <span className="font-medium text-emerald-700">
                                {offer.userRewardCoins ?? offer.reward?.coins ?? 0} coins
                              </span>
                              <span className="text-gray-500 mx-1">/</span>
                              <span className="font-medium text-amber-700">
                                {offer.userRewardXP ?? offer.reward?.xp ?? 0} XP
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {(isShopping || isMagicReceipt) &&
                              offer.categories &&
                              offer.categories.length > 0
                                ? offer.categories[0]
                                : offer.primary_category ||
                                  offer.category ||
                                  "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isCashback &&
                            offer.reward_delay_days !== undefined ? (
                              <div className="text-sm text-gray-900">
                                {offer.reward_delay_days} days
                              </div>
                            ) : (isShopping || isMagicReceipt) &&
                              offer.confirmation_time ? (
                              <div className="text-sm text-gray-900">
                                {offer.confirmation_time}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  offer.isAvailable !== false
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {offer.isAvailable !== false
                                  ? "Available"
                                  : "Unavailable"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleOffer(offer)}
                                disabled={togglingOffers.has(offer.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                  configured ? "bg-emerald-600" : "bg-gray-200"
                                } ${togglingOffers.has(offer.id) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    configured
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                              {togglingOffers.has(offer.id) ? (
                                <span className="text-xs text-gray-500">
                                  Syncing...
                                </span>
                              ) : (
                                <span className="text-xs text-gray-700 font-medium">
                                  {configured ? "Synced" : "Not Synced"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handlePreviewOffer(offer)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Preview
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Offer Preview Modal */}
      <OfferPreviewModal
        isOpen={showPreviewModal}
        offer={selectedOfferForPreview}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedOfferForPreview(null);
        }}
      />

      {/* Target Audience Modal */}
      <TargetAudienceModal
        isOpen={showTargetAudienceModal}
        onClose={() => {
          setShowTargetAudienceModal(false);
          setPendingSyncAction(null);
        }}
        onConfirm={handleTargetAudienceConfirm}
        offerCount={
          pendingSyncAction?.type === "single" ||
          pendingSyncAction?.type === "single_everflow"
            ? 1
            : pendingSyncAction?.offerIds?.length || 0
        }
        offerTitle={
          pendingSyncAction?.type === "single" ||
          pendingSyncAction?.type === "single_everflow"
            ? "offer"
            : "offers"
        }
      />
    </div>
  );
}
