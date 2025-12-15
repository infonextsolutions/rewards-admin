import React, { useState, useEffect } from "react";
import Image from "next/image";
import apiClient from "../../lib/apiClient";

export const BalanceTierSection = ({ user }) => {
  const [xpTierName, setXpTierName] = useState("Junior");
  const [loadingTier, setLoadingTier] = useState(true);

  // Format redemption data from API
  const redemptionCount =
    user?.redemptionBreakdown?.count || user?.redemptionsMade || 0;
  const totalCoinsRedeemed = user?.redemptionBreakdown?.totalCoins || 0;
  const lastRedeemed = user?.redemptionBreakdown?.lastRedeemed;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "N/A";
    }
  };

  // Calculate XP tier name based on user XP and admin config
  useEffect(() => {
    const calculateXPTier = async () => {
      try {
        setLoadingTier(true);
        // Get user's XP value (extract number from string like "2850 XP" or use direct number)
        let userXP = 0;
        if (user?.xp !== undefined && typeof user.xp === "number") {
          userXP = user.xp;
        } else if (user?.currentXP) {
          // Extract number from "2850 XP" format or use as number
          if (typeof user.currentXP === "number") {
            userXP = user.currentXP;
          } else {
            const xpMatch = String(user.currentXP).match(/(\d+)/);
            userXP = xpMatch ? parseInt(xpMatch[1]) : 0;
          }
        } else if (user?.xpTier !== undefined) {
          // If we only have tier number, we can't calculate from XP, so use fallback
          userXP = 0;
        }

        // Fetch XP tiers from admin config
        const response = await apiClient.get("/admin/rewards/xp-tiers", {
          params: { status: true },
        });

        if (response.data?.success && response.data?.data) {
          const tiers = response.data.data;

          // Sort tiers by xpMin descending to check highest tiers first (Senior -> Middle -> Junior)
          const sortedTiers = [...tiers].sort(
            (a, b) => (b.xpMin || 0) - (a.xpMin || 0)
          );

          // Find the tier that matches user's XP
          let matchedTier = null;

          // Check from highest tier to lowest
          for (const tier of sortedTiers) {
            const xpMin = tier.xpMin || 0;
            const xpMax = tier.xpMax;

            // If user's XP meets the minimum requirement for this tier
            if (userXP >= xpMin) {
              // If xpMax is null/undefined, it means unlimited (Senior tier with no upper limit)
              if (xpMax === null || xpMax === undefined) {
                matchedTier = tier;
                break; // User qualifies for this tier (unlimited upper bound)
              }
              // If userXP is within the tier's range (xpMin <= userXP <= xpMax)
              else if (userXP <= xpMax) {
                matchedTier = tier;
                break; // User qualifies for this tier
              }
              // If userXP > xpMax but >= xpMin, user has exceeded this tier
              // They should be in the highest tier they've reached
              // Since we're checking from highest to lowest, if we reach here,
              // it means userXP exceeds this tier's max, so assign to highest tier
              else {
                // User exceeds this tier's max, but they've reached at least this tier
                // Assign to the highest tier (first in sorted array)
                matchedTier = sortedTiers[0];
                break;
              }
            }
          }

          // If no tier matched (userXP is below all tier mins), assign to lowest tier
          if (!matchedTier) {
            matchedTier = sortedTiers[sortedTiers.length - 1] || sortedTiers[0];
          }

          setXpTierName(matchedTier?.tierName || "Junior");
        } else {
          // Fallback to old logic if API fails
          const XP_TIER_MAP = {
            1: "Junior",
            2: "Mid",
            3: "Senior",
          };
          setXpTierName(XP_TIER_MAP[user?.xpTier || 1] || "Junior");
        }
      } catch (error) {
        console.error("Error fetching XP tiers:", error);
        // Fallback to old logic on error
        const XP_TIER_MAP = {
          1: "Junior",
          2: "Mid",
          3: "Senior",
        };
        setXpTierName(XP_TIER_MAP[user?.xpTier || 1] || "Junior");
      } finally {
        setLoadingTier(false);
      }
    };

    if (user) {
      calculateXPTier();
    }
  }, [user]);

  // Get subscription tier (from tier field or vip.level)
  const subscriptionTier = user?.tier || user?.vip?.level || "Free";

  // Format subscription tier (capitalize first letter)
  const formattedSubscriptionTier =
    subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1);

  // Combine XP tier and subscription tier
  const tierAndSubscriptionValue = `${xpTierName} & ${formattedSubscriptionTier}`;

  const redemptionDisplay =
    redemptionCount > 0
      ? `${redemptionCount} redemption${redemptionCount !== 1 ? "s" : ""}`
      : "0 redemptions";

  const balanceAndTierData = [
    { label: "Current XP (Read-only)", value: user?.currentXP || "0 XP" },
    {
      label: "Current Coin Balance (Read-only)",
      value: user?.coinBalance || "0 Coins",
    },
    {
      label: "XP Tier & Subscription",
      value: tierAndSubscriptionValue,
      isBadge: true,
    },
    { label: "Redemption Count & Types", value: redemptionDisplay },
    // { label: "Redemption Preference", value: user?.redemptionPreference && user?.redemptionPreference !== "NONE" && user?.redemptionPreference !== "N/A" ? user.redemptionPreference : "N/A", isPreference: true },
    {
      label: "Last Redemption Date",
      value: lastRedeemed ? formatDate(lastRedeemed) : "N/A",
      isDate: true,
    },
  ];

  const engagementData = [
    {
      label: "Total Games Downloaded",
      value: user?.totalGamesDownloaded || "0 games",
    },
  ];

  return (
    <div className="inline-flex flex-col items-start gap-[30px] relative flex-[0_0_auto]">
      <div className="flex items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-6 relative flex-1 self-stretch grow">
          {balanceAndTierData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-6 relative w-[200px]">
          {balanceAndTierData.map((item, index) => {
            if (item.isBadge) {
              return (
                <div key={index} className="inline-flex  items-center gap-1.5 ">
                  <div className="relative [font-family:'DM_Sans',Helvetica]  text-black text-sm tracking-[0] leading-[normal]">
                    {item.value}
                  </div>
                </div>
              );
            }

            if (item.isPreference) {
              return (
                <div key={index} className="flex items-center gap-2">
                  <Image
                    className="w-6 h-6 rounded"
                    alt={item.value}
                    src={
                      item.value === "PayPal"
                        ? "https://cdn.worldvectorlogo.com/logos/paypal-2.svg"
                        : "https://cdn-icons-png.flaticon.com/128/891/891462.png"
                    }
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium text-black">
                    {item.value}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]"
              >
                {item.value}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-6 relative flex-1 self-stretch grow">
          {engagementData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-6 relative w-[200px]">
          {engagementData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]"
            >
              {item.label === "Notification Settings" ? ( // Notification settings with icon
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      item.value.includes("Push Enabled")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.value.includes("Push Enabled") ? "🔔" : "🔕"}{" "}
                    {item.value}
                  </span>
                </div>
              ) : (
                item.value
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Redemption Map/History - Hidden per user request */}
    </div>
  );
};
