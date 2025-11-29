import React from "react";

export const ActivitySummarySection = ({ user }) => {
  // Debug: Log user data received by component
  console.log("🟡 [ActivitySummary] User data received:", user);
  console.log("🟡 [ActivitySummary] Redemption data:", {
    redemptionsMade: user?.redemptionsMade,
    redemptionCount: user?.redemptionCount,
    redemptionBreakdown: user?.redemptionBreakdown,
    wallet: user?.wallet,
  });
  console.log("🟡 [ActivitySummary] Spin data:", {
    spinUsage: user?.spinUsage,
    spinCount: user?.spinCount,
    lastSpinAt: user?.lastSpinAt,
  });

  // Helper function to get redemption data with proper breakdown
  const getRedemptionData = () => {
    const redemptionBreakdown = user?.redemptionBreakdown;
    const walletTransactions = user?.wallet?.transactions || [];

    // Get the actual count from API - check multiple possible sources
    const totalCount =
      (typeof redemptionBreakdown?.count === "number"
        ? redemptionBreakdown.count
        : null) ||
      (typeof user?.redemptionsMade === "number"
        ? user.redemptionsMade
        : null) ||
      (typeof user?.redemptionCount === "number"
        ? user.redemptionCount
        : null) ||
      0;

    console.log(
      "🟡 [ActivitySummary] getRedemptionData - totalCount calculation:",
      {
        redemptionBreakdownCount: redemptionBreakdown?.count,
        redemptionsMade: user?.redemptionsMade,
        redemptionCount: user?.redemptionCount,
        finalTotalCount: totalCount,
      }
    );

    // If no redemptions, return early
    if (totalCount === 0 || totalCount === null) {
      return {
        total: "0 redemptions",
        breakdown: "No redemptions yet",
      };
    }

    // Build breakdown from wallet transactions if available
    if (walletTransactions.length > 0) {
      const redemptionTxns = walletTransactions.filter(
        (t) =>
          t.type?.toLowerCase() === "redemption" ||
          t.type?.toLowerCase() === "withdraw" ||
          t.type?.toLowerCase() === "debit"
      );

      // Count by method
      const methodCounts = {};
      redemptionTxns.forEach((txn) => {
        const method =
          txn.method ||
          txn.redemptionType ||
          txn.metadata?.redemptionMethod ||
          "Other";
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });

      // Format breakdown
      const breakdownParts = Object.entries(methodCounts).map(
        ([method, count]) => {
          if (method.toLowerCase().includes("paypal")) {
            return `${count} via PayPal`;
          } else if (method.toLowerCase().includes("gift")) {
            return `${count} Gift Card`;
          } else {
            return `${count} via ${method}`;
          }
        }
      );

      return {
        total: `${totalCount} redemption${totalCount !== 1 ? "s" : ""}`,
        breakdown:
          breakdownParts.length > 0
            ? breakdownParts.join(", ")
            : redemptionBreakdown?.totalCoins
            ? `${redemptionBreakdown.totalCoins} coins total`
            : `${totalCount} redemption${totalCount !== 1 ? "s" : ""}`,
      };
    }

    // Fallback to just showing total coins if no transaction details
    const totalCoins = redemptionBreakdown?.totalCoins || 0;
    return {
      total: `${totalCount} redemption${totalCount !== 1 ? "s" : ""}`,
      breakdown:
        totalCoins > 0
          ? `${totalCoins.toLocaleString()} coins redeemed total`
          : `${totalCount} redemption${totalCount !== 1 ? "s" : ""} made`,
    };
  };

  // Helper function to get challenge progress data
  const getChallengeProgressData = () => {
    const challengeData = user?.challengeProgress;

    if (!challengeData) {
      return {
        name: "No active challenge",
        percentage: 0,
        showProgress: false,
      };
    }

    // Check if there's an active challenge in recentChallenges
    const activeChallenge =
      challengeData.recentChallenges?.find((c) => c.status === "in_progress") ||
      challengeData.recentChallenges?.[0];

    if (activeChallenge) {
      const percentage = activeChallenge.progress || 0;
      return {
        name:
          activeChallenge.name || activeChallenge.type || "Active Challenge",
        percentage: percentage,
        showProgress: true,
      };
    }

    // Check for streak-based challenges
    if (challengeData.currentStreak > 0) {
      // Assume a 7-day login challenge as common pattern
      const streakPercentage = (challengeData.currentStreak / 7) * 100;
      return {
        name: `${challengeData.currentStreak}-Day Login Streak`,
        percentage: Math.min(streakPercentage, 100),
        showProgress: true,
      };
    }

    // If challenges completed but none active
    if (challengeData.totalChallengesCompleted > 0) {
      return {
        name: "No active challenge",
        percentage: 0,
        showProgress: false,
      };
    }

    return {
      name: "N/A",
      percentage: 0,
      showProgress: false,
    };
  };

  const redemptionData = getRedemptionData();
  const challengeProgress = getChallengeProgressData();

  const activityData = [
    {
      label: "Last Login Timestamp",
      value: user?.lastLogin || user?.lastLoginAt || "May 28, 2025 – 11:42 AM",
      isTimestamp: true,
    },
    {
      label: "Total Logins Since Registration",
      value: user?.loginCount
        ? `${user.loginCount} logins since ${new Date(
            user.registrationDate
          ).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
        : "58 logins since Mar 2025",
      isCount: true,
    },

    {
      label: "Offers Redeemed + Last Offer Claimed",
      value: user?.offersRedeemed
        ? `${user.offersRedeemed} offers redeemed`
        : "0 offers redeemed",
      additionalInfo: user?.lastOfferClaimed || "No offers claimed yet",
    },
    {
      label: "Total Coins Earned",
      value:
        user?.totalCoinsEarned !== undefined && user.totalCoinsEarned > 0
          ? `${user.totalCoinsEarned.toLocaleString()} coins earned`
          : user?.coinBalance !== undefined && user.coinBalance > 0
          ? `${user.coinBalance.toLocaleString()} coins `
          : user?.wallet?.balance !== undefined && user.wallet.balance > 0
          ? `${user.wallet.balance.toLocaleString()} coins`
          : "0 coins earned",
      isHighlighted: true,
    },
    {
      label: "Total XP Earned",
      value:
        user?.totalXPEarned !== undefined
          ? `${user.totalXPEarned.toLocaleString()} XP earned`
          : "0 XP earned",
      isHighlighted: true,
    },
    {
      label: "Daily Challenges Completed",
      value:
        user?.dailyChallengesCompleted !== undefined
          ? `${user.dailyChallengesCompleted} challenge${
              user.dailyChallengesCompleted !== 1 ? "s" : ""
            } completed`
          : user?.challengeProgress?.totalChallengesCompleted !== undefined
          ? `${user.challengeProgress.totalChallengesCompleted} challenge${
              user.challengeProgress.totalChallengesCompleted !== 1 ? "s" : ""
            } completed`
          : "0 challenges completed",
    },
    {
      label: "Redemptions Made (Summary View)",
      value: redemptionData.total,
      additionalInfo: (() => {
        const lastRedeemed = user?.redemptionBreakdown?.lastRedeemed;

        if (lastRedeemed) {
          try {
            const date = new Date(lastRedeemed);
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return `Last redeemed: ${formattedDate}`;
            }
          } catch (e) {
            // Invalid date, ignore
          }
        }

        return "No redemptions yet";
      })(),
    },

    {
      label: "Spin Usage History",
      value: (() => {
        // Check multiple possible sources for spin count
        const spinCount =
          (typeof user?.spinUsage === "number" ? user.spinUsage : null) ||
          (typeof user?.spinCount === "number" ? user.spinCount : null) ||
          (typeof user?.wallet?.spinCount === "number"
            ? user.wallet.spinCount
            : null) ||
          0;

        console.log("🟡 [ActivitySummary] Spin count calculation:", {
          spinUsage: user?.spinUsage,
          spinCount: user?.spinCount,
          walletSpinCount: user?.wallet?.spinCount,
          finalSpinCount: spinCount,
        });

        if (spinCount > 0) {
          return `${spinCount} spin${spinCount !== 1 ? "s" : ""} used`;
        }
        return "0 spins used";
      })(),
      additionalInfo: (() => {
        const lastSpin = user?.lastSpinAt || user?.wallet?.lastSpinAt;
        if (lastSpin) {
          try {
            const date = new Date(lastSpin);
            if (!isNaN(date.getTime())) {
              return `Last spin: ${date.toLocaleDateString()}`;
            }
          } catch (e) {
            // Invalid date, ignore
          }
        }
        return "No spins yet";
      })(),
    },
  ];

  return (
    <div className="w-full">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-semibold text-gray-800">
          Activity Summary
        </h3>
        <button
          onClick={() => {
            // Filter out empty items and prepare data for export
            const validData = activityData.filter((item) => item && item.label);

            // Create CSV content with proper formatting
            const csvContent = [
              ["Activity Type", "Details", "Additional Info"],
              ...validData.map((item) => {
                // Format value for CSV (handle special characters)
                let formattedValue = item.value || "";
                // Escape quotes and wrap in quotes if contains comma
                if (
                  formattedValue.includes(",") ||
                  formattedValue.includes('"')
                ) {
                  formattedValue = `"${formattedValue.replace(/"/g, '""')}"`;
                }

                // Format additional info
                let formattedInfo = item.additionalInfo || "";
                if (
                  formattedInfo.includes(",") ||
                  formattedInfo.includes('"')
                ) {
                  formattedInfo = `"${formattedInfo.replace(/"/g, '""')}"`;
                }

                return [item.label, formattedValue, formattedInfo];
              }),
            ]
              .map((row) => row.join(","))
              .join("\n");

            const blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `user_activity_${
              user?.userId || user?.id || "unknown"
            }_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          title="Export activity data"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          Export
        </button>
      </div>
      {/* Activity Data - Single Column Layout */}
      <div className="space-y-[30px]">
        {activityData
          .filter((item) => item && item.label)
          .map((item, index) => (
            <div key={index} className="flex items-start gap-8">
              <dt className="w-[280px] flex-shrink-0 [font-family:'DM_Sans-Medium',Helvetica] font-medium text-gray-600 text-sm tracking-[0] leading-[normal]">
                {item.label}
              </dt>
              <dd className="flex-1 [font-family:'DM_Sans-Medium',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal]">
                {item.isTimestamp ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🟢</span>
                    <span>{item.value}</span>
                  </div>
                ) : item.isCount ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {item.value.split(" ")[0]}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {item.value.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                ) : item.isHighlighted ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block">
                    <span className="font-semibold text-yellow-800">
                      {item.value}
                    </span>
                  </div>
                ) : item.isProgress ? (
                  <div className="space-y-1">
                    <span>{item.value}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${item.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.progressPercentage?.toFixed(1) || 0}% complete
                    </span>
                  </div>
                ) : (
                  <div>
                    <div>{item.value}</div>
                    {item.additionalInfo && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.additionalInfo}
                      </div>
                    )}
                  </div>
                )}
              </dd>
            </div>
          ))}
      </div>
    </div>
  );
};
