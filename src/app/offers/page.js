"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OffersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Games Listing (the active screen) instead of unused Offers Listing
    router.replace("/offers/games");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Games Listing...</p>
      </div>
    </div>
  );
}
