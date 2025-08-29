import React from "react";

export const BalanceTierSection = ({ user }) => {
  const balanceAndTierData = [
    { label: "Current XP", value: "2,850 XP" },
    { label: "Current Coin Balance", value: "15,200 Coins", hasButton: true },
    { label: "XP Tier with Badge", value: "Gold", isBadge: true },
    { label: "Redemption Count", value: "3 redemptions" },
    { label: "Redemption Type Preference", value: "", hasImage: true },
  ];

  const activitySummaryData = [
    { label: "Most Played Game", value: "Spin Master" },
    { label: "Last Game Played", value: "Coin Tycoon – May 27" },
    { label: "Total Games Downloaded", value: "17 games" },
    { label: "Avg. Session Duration", value: "12 minutes" },
    { label: "Primary Earning Source", value: "Surveys (BitLabs)" },
    { label: "Preferred Game Category", value: "Puzzle & Trivia" },
    { label: "Onboarding Goal Selected", value: "Earn Extra Income" },
    { label: "Notification Behavior", value: "Muted – Push Disabled" },
  ];

  return (
    <div className="inline-flex flex-col items-start gap-[30px] relative flex-[0_0_auto]">
      <div className="flex items-start gap-24 relative self-stretch w-full flex-[0_0_auto]">
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
                    Gold
                  </div>
                  <img
                    className="relative w-5 h-5 mt-[-1.00px] mb-[-1.00px] aspect-[1]"
                    alt="Heroicons chevron up"
                    src="https://c.animaapp.com/OW4NDadO/img/heroicons-chevron-up-20-solid-1.svg"
                  />
                </div>
              );
            }

            if (item.hasImage) {
              return (
                <img
                  key={index}
                  className={`absolute w-[75px] h-5 ${topPositions[index]} left-0 aspect-[3.75] object-cover`}
                  alt="Image"
                  src="https://c.animaapp.com/OW4NDadO/img/image-17@2x.png"
                />
              );
            }

            return null;
          })}

          <button className="all-[unset] box-border inline-flex h-[30px] items-center justify-end gap-2.5 px-[18px] py-1.5 absolute top-[41px] left-[97px] rounded-[100px] border border-solid border-[#f68d2b] hover:bg-[#f68d2b] hover:text-white transition-colors">
            <div className="relative w-fit mt-[-1.50px] [font-family:'Inter',Helvetica] font-medium text-[#f68d2b] hover:text-white text-[13px] tracking-[0] leading-[19px] whitespace-nowrap">
              Adjust Balance
            </div>
          </button>
        </div>
      </div>

      <div className="relative w-[497px] h-[354px]">
        <div className="inline-flex flex-col items-start gap-[30px] absolute top-0 left-0">
          {activitySummaryData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="flex flex-col w-52 h-[354px] items-start gap-[30px] absolute top-0 left-[289px]">
          {activitySummaryData.map((item, index) => (
            <div
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]"
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};