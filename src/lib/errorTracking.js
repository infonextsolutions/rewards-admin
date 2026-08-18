/**
 * Error tracking via Sentry (sentry.io).
 * No-ops when NEXT_PUBLIC_SENTRY_DSN is unset, so local dev is unaffected.
 */
import * as Sentry from "@sentry/react";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// uat | production — explicit override wins, otherwise inferred from the API host
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_SENTRY_ENV ||
  ((process.env.NEXT_PUBLIC_API_BASE || "").includes("uat")
    ? "uat"
    : "production");

let initialized = false;

export const initErrorTracking = () => {
  if (initialized || typeof window === "undefined" || !DSN) return;
  initialized = true;

  Sentry.init({
    dsn: DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: 0,
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],
  });
  Sentry.setTag("app", "rewards-admin");
};

export const syncErrorTrackingUser = (user) => {
  if (!initialized) return;
  const id = user?._id || user?.id;
  if (id) {
    Sentry.setUser({ id: String(id), email: user?.email });
  } else {
    Sentry.setUser(null);
  }
};

export const reportApiFailure = ({ endpoint, method, status, message }) => {
  if (!initialized) return;

  if (status >= 500) {
    Sentry.withScope((scope) => {
      scope.setTag("api_endpoint", endpoint);
      scope.setTag("http_status", String(status));
      scope.setFingerprint(["api-failure", method, endpoint, String(status)]);
      Sentry.captureMessage(
        `API ${method} ${endpoint} failed with ${status}: ${message}`,
        "error",
      );
    });
    return;
  }

  Sentry.addBreadcrumb({
    category: "api",
    level: "warning",
    message: `${method} ${endpoint} -> ${status || "network-error"}: ${message}`,
  });
};

export { Sentry };
