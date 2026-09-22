"use client";

import { useState, useEffect } from "react";
import { UserDetailPage } from "../../../components/users/UserDetailPage";
import { useParams, useRouter } from "next/navigation";
import userAPIs from "../../../data/users/userAPI";
import toast from "react-hot-toast";

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await userAPIs.getUserDetails(userId);

        if (response.success) {
          // Map API response to component structure
          const userData = response.data;

          const mappedUser = {
            id: userData.id,
            name: userData.name,
            userId: userData.id,
            tier: userData.tier,
            xpTier: userData.xpTier,
            email: userData.email,
            status: userData.status,
            avatar: userData.avatar,
            gender: userData.gender || "N/A",
            age: userData.age || "N/A",
            phone: userData.phone,
            location: userData.location || "N/A",
            device: "N/A", // Not in API response
            ipAddress: userData.ipAddress || "N/A", // Not in API response
            appVersion: userData.appVersion,
            lastActive: userData.lastActive,
            faceVerification: userData.faceVerification,
            memberSince: userData.memberSince,
            registrationDate: userData.registrationDate,
            signupCountry: userData.signupCountry || "N/A",
            country: userData.country || "N/A",
            accountStatus: userData.accountStatus,
            lastLoginIp: "N/A", // Not in API response
            lastLoginLocation: "N/A", // Not in API response

            // Balance & Tier data
            currentXP: `${userData.xp || 0} XP`,
            coinBalance: `${userData.coinBalance || 0} Coins`,
            walletBalance: userData.wallet?.balance || userData.coinBalance || 0,
            redemptionCountAndTypes: userData.redemptionCountAndTypes || "0 redemptions",
            redemptionPreference: userData.redemptionPreference || "N/A",
            mostPlayedGame: userData.mostPlayedGame || "N/A",
            lastGamePlayed: userData.lastGamePlayed || "N/A",
            totalGamesDownloaded: `${userData.totalGamesDownloaded || userData.gamesPlayed || 0} games`,
            avgSessionDuration: userData.avgSessionDuration || "N/A",
            primaryEarningSource: userData.primaryEarningSource || "N/A",
            preferredGameCategory: userData.preferredGameCategory || "N/A",
            onboardingGoal: userData.onboardingGoal || (userData.onboarding?.completed
              ? "Completed"
              : `Step ${userData.onboarding?.step || 1}`),
            notificationSettings: userData.notificationSettings || (userData.profile?.notifications
              ? "Enabled"
              : "Disabled"),

            // Activity Summary data
            lastLogin: userData.lastLoginAt || userData.lastLogin || userData.lastActive,
            lastLoginAt: userData.lastLoginAt || userData.lastLogin,
            loginCount: userData.loginCount,
            registrationDate: userData.registrationDate || userData.memberSince,
            lastTaskCompleted: userData.lastTaskCompleted || "N/A",
            offersRedeemed: userData.offersRedeemed || 0,
            lastOfferClaimed: userData.lastOfferClaimed || "N/A",
            totalCoinsEarned: userData.totalCoinsEarned || 0,
            totalXPEarned: userData.totalXPEarned || 0,
            redemptionsMade: (() => {
              const value = typeof userData.redemptionsMade === 'number' ? userData.redemptionsMade : 0;

              return value;
            })(),
            redemptionCount: (() => {
              const value = typeof userData.redemptionsMade === 'number' ? userData.redemptionsMade : (userData.redemptionBreakdown?.count || 0);

              return value;
            })(),
            redemptionBreakdown: (() => {
              const value = userData.redemptionBreakdown || { count: 0, totalCoins: 0, lastRedeemed: null };

              return value;
            })(),
            redemptionHistory: userData.redemptionHistory || [],
            challengeProgress: userData.challengeProgress || {},
            dailyChallengesCompleted: typeof userData.dailyChallengesCompleted === 'number' ? userData.dailyChallengesCompleted : 0,
            spinUsage: (() => {
              const value = typeof userData.spinUsage === 'number' ? userData.spinUsage : (typeof userData.spinCount === 'number' ? userData.spinCount : 0);

              return value;
            })(),
            spinCount: (() => {
              const value = typeof userData.spinCount === 'number' ? userData.spinCount : (typeof userData.spinUsage === 'number' ? userData.spinUsage : 0);

              return value;
            })(),
            lastSpinAt: userData.lastSpinAt || null,

            // Additional data from API
            vip: userData.vip,
            wallet: userData.wallet,
            onboarding: userData.onboarding,
            profile: userData.profile,
            gamesPlayed: userData.gamesPlayed,
            tasksCompleted: userData.tasksCompleted,
            surveysCompleted: userData.surveysCompleted,
          };

          setUser(mappedUser);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        toast.error("Failed to load user details");
        setError(err.message);

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          User Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The user with ID &quot;{userId}&quot; could not be found.
        </p>
        <button
          onClick={() => router.push("/users")}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return <UserDetailPage user={user} />;
}
