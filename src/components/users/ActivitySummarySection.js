import React from "react";

export const ActivitySummarySection = () => {
  const activityData = [
    {
      label: "Last Login",
      value: "May 28, 2025 – 11:42 AM",
    },
    {
      label: "Total Logins",
      value: "58 logins since Mar 2025",
    },
    {
      label: "Last Task Completed",
      value: "BitLabs Survey #432 – May 27",
    },
    {
      label: "Offers Redeemed",
      value: "12 game offers redeemed",
    },
    {
      label: "Last Offer Claimed",
      value: "Lucky Spin – 200 coins – May 26",
    },
    {
      label: "Total Coins Earned",
      value: "Coin Tycoon – May 27",
    },
    {
      label: "Total XP Earned",
      value: "2,850 XP",
    },
    {
      label: "Redemptions Made",
      value: "3 – 2 via PayPal, 1 Gift Card",
    },
    {
      label: "Challenge Progress",
      value: "Day 6 of 7-Day Login Challenge",
    },
    {
      label: "Spin Usage",
      value: "8 spins used – last on May 24",
    },
  ];

  return (
    <div
      className="inline-flex flex-col h-[450px] items-start gap-[30px] relative"
    >
      <dl className="flex w-[509px] items-start gap-24 relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-between relative flex-1 self-stretch grow">
          {activityData.slice(0, 4).map((item, index) => (
            <dt
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans-Medium',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </dt>
          ))}
        </div>

        <div className="flex flex-col w-[220px] items-start gap-[30px] relative">
          {activityData.slice(0, 4).map((item, index) => (
            <dd
              key={index}
              className={`relative ${index === 0 ? "self-stretch mt-[-1.00px]" : index === 1 ? "self-stretch" : "w-fit"} [font-family:'DM_Sans-Medium',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]`}
            >
              {item.value}
            </dd>
          ))}
        </div>
      </dl>

      <div className="relative w-[497px] h-[258px]">
        <dl className="inline-flex flex-col items-start gap-[30px] absolute top-0 left-0">
          {activityData.slice(4).map((item, index) => (
            <dt
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans-Medium',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]"
            >
              {item.label}
            </dt>
          ))}
        </dl>

        <div className="flex flex-col w-[220px] items-start gap-[30px] absolute top-0 left-[289px]">
          {activityData.slice(4).map((item, index) => (
            <dd
              key={index}
              className="relative w-fit mt-[-1.00px] [font-family:'DM_Sans-Medium',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]"
            >
              {item.value}
            </dd>
          ))}
        </div>
      </div>
    </div>
  );
};