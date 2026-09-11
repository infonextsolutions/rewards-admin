"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import {
  initErrorTracking,
  syncErrorTrackingUser,
} from "../lib/errorTracking";
import { useAuth } from "../contexts/AuthContext";

// Init at module load so errors during first render are already captured
initErrorTracking();

function CrashFallback({ resetError }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <p className="text-lg font-semibold mb-2">Something went wrong</p>
      <p className="text-sm text-gray-500 mb-6">
        The error has been reported. Please reload the page.
      </p>
      <button
        onClick={() => {
          if (resetError) resetError();
          window.location.reload();
        }}
        className="px-6 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold"
      >
        Reload
      </button>
    </div>
  );
}

/**
 * Wraps the admin in a Sentry ErrorBoundary and keeps the tracked user in
 * sync with auth state. Must be mounted inside AuthProvider.
 */
export default function ErrorTrackingProvider({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    syncErrorTrackingUser(user);
  }, [user]);

  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => <CrashFallback resetError={resetError} />}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
