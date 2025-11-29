import React from "react";
import Image from "next/image";

export const BalanceTierSection = ({ user }) => {
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
    { label: "XP Tier & Badge", value: user?.tier || "Bronze", isBadge: true },
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
      value: user?.totalGamesDownloaded || "17 games",
    },
    {
      label: "Notification Settings",
      value: user?.notificationSettings || "Push Enabled, Email Disabled",
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
                    {user?.tier || "Gold"}
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
