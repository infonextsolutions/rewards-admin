import React from "react";
import Image from "next/image";

export const BalanceTierSection = ({ user }) => {
  const balanceAndTierData = [
    { label: "Current XP (Read-only)", value: user?.currentXP || "2,850 XP" },
    { label: "Current Coin Balance (Read-only)", value: user?.coinBalance || "15,200 Coins" },
    { label: "XP Tier & Badge", value: user?.tier || "Gold", isBadge: true },
    { label: "Redemption Count & Types", value: user?.redemptionCountAndTypes || "0 redemptions" },
    { label: "Redemption Preference", value: user?.redemptionPreference && user?.redemptionPreference !== "NONE" && user?.redemptionPreference !== "N/A" ? user.redemptionPreference : "N/A", isPreference: true },
  ];

  const engagementData = [
    { label: "Total Games Downloaded", value: user?.totalGamesDownloaded || "17 games" },
    { label: "Notification Settings", value: user?.notificationSettings || "Push Enabled, Email Disabled" },
  ];

  return (
    <div className="inline-flex flex-col items-start gap-[30px] relative flex-[0_0_auto]">
      <div className="flex items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-between relative flex-1 self-stretch grow">
          {balanceAndTierData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="relative w-[204px] h-56">
          {balanceAndTierData.map((item, index) => {
            const topPositions = [
              "-top-px",
              "top-[47px]",
              "top-24",
              "top-[155px]",
              "top-[204px]",
            ];

            if (item.value) {
              return (
                <div
                  key={index}
                  className={`absolute ${topPositions[index]} left-0 [font-family:'DM_Sans',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]`}
                >
                  {item.value}
                </div>
              );
            }

            if (item.isBadge) {
              return (
                <div
                  key={index}
                  className={`inline-flex h-[30px] items-center gap-1.5 px-3 py-1.5 absolute ${topPositions[index]} left-0 bg-[#fff2ab] rounded-[20px] border border-solid border-[#ffde5b]`}
                >
                  <div className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans',Helvetica] font-semibold text-[#464154] text-sm tracking-[0] leading-[normal]">
                    {user?.tier || "Gold"}
                  </div>
                  <Image
                    className="relative w-5 h-5 mt-[-1.00px] mb-[-1.00px] aspect-[1]"
                    alt="Heroicons chevron up"
                    src="https://c.animaapp.com/OW4NDadO/img/heroicons-chevron-up-20-solid-1.svg"
                    width={20}
                    height={20}
                  />
                </div>
              );
            }

            if (item.isPreference) {
              return (
                <div
                  key={index}
                  className={`absolute ${topPositions[index]} left-0 flex items-center gap-2`}
                >
                  <Image
                    className="w-6 h-6 rounded"
                    alt={item.value}
                    src={item.value === 'PayPal' ? 
                      'https://cdn.worldvectorlogo.com/logos/paypal-2.svg' : 
                      'https://cdn-icons-png.flaticon.com/128/891/891462.png'
                    }
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium text-black">{item.value}</span>
                </div>
              );
            }

            return null;
          })}

          {/* Adjust Balance button removed per requirements */}
        </div>
      </div>

      <div className="relative w-[497px] h-[354px]">
        <div className="inline-flex flex-col items-start gap-[30px] absolute top-0 left-0">
          {engagementData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="flex flex-col w-52 h-[354px] items-start gap-[30px] absolute top-0 left-[289px]">
          {engagementData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]"
            >
              {item.label === "Notification Settings" ? ( // Notification settings with icon
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    item.value.includes('Push Enabled') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.value.includes('Push Enabled') ? '🔔' : '🔕'} {item.value}
                  </span>
                </div>
              ) : (
                item.value
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};