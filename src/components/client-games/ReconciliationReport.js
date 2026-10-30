'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { inputClass } from './constants';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

const currentMonth = () => new Date().toISOString().slice(0, 7);

/** UTC calendar month bounds for a YYYY-MM value. */
const monthRange = (month) => {
  const [y, m] = month.split('-').map(Number);
  return {
    from: new Date(Date.UTC(y, m - 1, 1)).toISOString(),
    to: new Date(Date.UTC(y, m, 1) - 1).toISOString(),
  };
};

const COLUMNS = [
  ['credited', 'Credited'],
  ['held', 'Held'],
  ['review', 'Review'],
  ['failed', 'Failed'],
  ['duplicate', 'Duplicate'],
  ['rejected', 'Rejected'],
];

/**
 * Monthly figures per game and Adjust event. "Received" is what to compare
 * against Adjust's own event count for the same month.
 */
export default function ReconciliationReport() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await directGamesAPI.getSummary(monthRange(month)));
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to load report'));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = data?.rows || [];
  const totals = rows.reduce(
    (acc, r) => ({
      received: acc.received + r.received,
      coins: acc.coins + r.coinsCredited,
      xp: acc.xp + r.xpCredited,
    }),
    { received: 0, coins: 0, xp: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="md:w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Month (UTC)</label>
          <input type="month" value={month} max={currentMonth()} onChange={(e) => setMonth(e.target.value)} className={inputClass} />
        </div>
        {data && (
          <p className="text-sm text-gray-600">
            Compare <strong>Received</strong> with the event counts in Adjust for the same month.
            {data.openReview > 0 && (
              <span className="text-amber-700"> {data.openReview} event(s) are waiting for review across all months.</span>
            )}
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading report..." size="small" />
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          No milestone events received this month.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Game', 'Adjust event', 'Received', ...COLUMNS.map(([, l]) => l), 'Coins paid', 'XP paid'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={`${r.adjustAppToken}:${r.eventToken}`}>
                  <td className="px-4 py-2 text-sm text-gray-900">{r.game || <span className="font-mono text-gray-500">{r.adjustAppToken}</span>}</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-700">{r.eventToken || '-'}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900">{r.received}</td>
                  {COLUMNS.map(([key]) => (
                    <td key={key} className="px-4 py-2 text-sm text-gray-700">
                      {r.byStatus[key] || 0}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-sm text-gray-700">{r.coinsCredited.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{r.xpCredited.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-2 text-sm font-semibold text-gray-900" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-gray-900">{totals.received}</td>
                <td colSpan={COLUMNS.length}></td>
                <td className="px-4 py-2 text-sm font-semibold text-gray-900">{totals.coins.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm font-semibold text-gray-900">{totals.xp.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
