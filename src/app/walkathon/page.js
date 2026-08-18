"use client";

import { useCallback, useEffect, useState } from "react";
import { walkathonAPI } from "../../data/walkathon";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(new Date(value)) + " UTC"
    : "—";

const getErrorMessage = (error) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  "Request failed";

export default function WalkathonPage() {
  const [walkathons, setWalkathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [notice, setNotice] = useState(null);

  const loadWalkathons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await walkathonAPI.getChallenges();
      setWalkathons(data?.walkathons || []);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalkathons();
  }, [loadWalkathons]);

  const syncLifecycle = async () => {
    setAction("sync");
    try {
      const data = await walkathonAPI.syncLifecycle();
      setNotice({
        type: "success",
        text: `Current walkathon ${data?.currentWalkathon?.weekKey || "created"} is ready.`,
      });
      await loadWalkathons();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setAction("");
    }
  };

  const activate = async (walkathon) => {
    setAction(walkathon.id);
    try {
      await walkathonAPI.activate(walkathon.id);
      setNotice({
        type: "success",
        text: `${walkathon.title} is now active.`,
      });
      await loadWalkathons();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setAction("");
    }
  };

  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Walkathon Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage weekly availability, rewards, and activation status.
          </p>
        </div>
        <button
          type="button"
          onClick={syncLifecycle}
          disabled={Boolean(action)}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action === "sync" ? "Activating…" : "Ensure Current Walkathon"}
        </button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        “Ensure Current Walkathon” creates the current week when missing,
        activates a scheduled current week, and prepares next week. Cancelled or
        manually disabled campaigns remain disabled.
      </div>

      {notice && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-5 py-3">Week</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reward tiers</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                    Loading walkathons…
                  </td>
                </tr>
              ) : walkathons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                    No walkathons configured. Use the button above to create the current week.
                  </td>
                </tr>
              ) : (
                walkathons.map((walkathon) => {
                  const isCurrent =
                    new Date(walkathon.weekStart).getTime() <= now &&
                    new Date(walkathon.weekEnd).getTime() >= now;
                  const canActivate =
                    isCurrent &&
                    walkathon.status !== "active" &&
                    walkathon.status !== "cancelled";

                  return (
                    <tr key={walkathon.id}>
                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-gray-900">
                          {walkathon.title}
                        </div>
                        <div className="mt-1 text-gray-500">{walkathon.weekKey}</div>
                      </td>
                      <td className="px-5 py-4 align-top text-gray-600">
                        <div>{formatDate(walkathon.weekStart)}</div>
                        <div className="mt-1">to {formatDate(walkathon.weekEnd)}</div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            walkathon.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : walkathon.status === "upcoming"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {walkathon.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-gray-600">
                        {(walkathon.rewardTiers || []).map((tier) => (
                          <div key={tier.stepMilestone}>
                            {tier.stepMilestone.toLocaleString()} steps: {tier.xpReward} XP
                            {tier.coinReward ? ` + ${tier.coinReward} coins` : ""}
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-right align-top">
                        {canActivate ? (
                          <button
                            type="button"
                            onClick={() => activate(walkathon)}
                            disabled={Boolean(action)}
                            className="rounded-md border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {action === walkathon.id ? "Activating…" : "Activate"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {walkathon.status === "active" ? "Active now" : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
