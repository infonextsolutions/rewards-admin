import React from "react";

export const ActivitySummarySection = ({ user }) => {
  const activityData = [
    {
      label: "Last Login Timestamp",
      value: user?.lastLogin || "May 28, 2025 – 11:42 AM",
      isTimestamp: true
    },
    {
      label: "Total Logins Since Registration",
      value: user?.totalLogins || "58 logins since Mar 2025",
      isCount: true
    },
    {
      label: "Last Task Completed",
      value: user?.lastTaskCompleted || "BitLabs Survey #432 – May 27",
    },
    {
      label: "Offers Redeemed + Last Offer Claimed",
      value: user?.offersRedeemed || "12 offers redeemed",
      additionalInfo: user?.lastOfferClaimed || "Lucky Spin – 200 coins – May 26"
    },
    {
      label: "Total Coins Earned",
      value: user?.totalCoinsEarned || "47,250 coins earned",
      isHighlighted: true
    },
    {
      label: "Total XP Earned",
      value: user?.totalXPEarned || "2,850 XP earned",
      isHighlighted: true
    },
    {
      label: "Redemptions Made (Summary View)",
      value: user?.redemptionsMade || "3 redemptions",
      additionalInfo: "2 via PayPal ($15), 1 Gift Card ($10)"
    },
    {
      label: "Challenge Progress",
      value: user?.challengeProgress || "Day 6 of 7-Day Login Challenge",
      isProgress: true
    },
    {
      label: "Spin Usage History",
      value: user?.spinUsage || "8 spins used this month",
      additionalInfo: "Last spin: May 24 (won 150 coins)"
    },
  ];

  return (
    <div
      className="inline-flex flex-col min-h-[450px] items-start gap-[30px] relative"
    >
      {/* Export functionality for activity data */}
      <div className="mb-4 flex justify-end w-full">
        <button
          onClick={() => {
            const csvContent = [
              ['Activity Type', 'Details', 'Additional Info'],
              ...activityData.map(item => [
                item.label, 
                item.value, 
                item.additionalInfo || ''
              ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `user_activity_${user?.userId || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          title="Export activity data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export Activity
        </button>
      </div>
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
              {item.isTimestamp ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">🟢</span>
                  <span>{item.value}</span>
                </div>
              ) : item.isCount ? (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {item.value.split(' ')[0]}
                  </span>
                  <span className="text-gray-600 text-xs">{item.value.split(' ').slice(1).join(' ')}</span>
                </div>
              ) : item.isHighlighted ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                  <span className="font-semibold text-yellow-800">{item.value}</span>
                </div>
              ) : (
                <div>
                  <div>{item.value}</div>
                  {item.additionalInfo && (
                    <div className="text-xs text-gray-500 mt-1">{item.additionalInfo}</div>
                  )}
                </div>
              )}
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
              {item.isProgress ? (
                <div className="flex flex-col gap-1">
                  <span>{item.value}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85.7%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">85.7% complete</span>
                </div>
              ) : (
                <div>
                  <div>{item.value}</div>
                  {item.additionalInfo && (
                    <div className="text-xs text-gray-500 mt-1">{item.additionalInfo}</div>
                  )}
                </div>
              )}
            </dd>
          ))}
        </div>
      </div>
    </div>
  );
};