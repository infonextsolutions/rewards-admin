'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import EventDecisionModal from './EventDecisionModal';
import { REASON_LABELS, STATUS_STYLES, inputClass, reasonLabel } from './constants';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

const STATUS_FILTERS = [
  { value: 'review,failed', label: 'Needs review' },
  { value: 'held', label: 'Held (task locked)' },
  { value: 'credited', label: 'Credited' },
  { value: 'duplicate', label: 'Duplicates' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ignored', label: 'Installs / other' },
  { value: '', label: 'All' },
];

const PAGE_SIZE = 20;

/** Adjust events from client games, with the review queue as the default view. */
export default function ReviewQueue({ games }) {
  const [filters, setFilters] = useState({ status: 'review,failed', reason: '', game: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ events: [], pagination: { total: 0, pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [openEventId, setOpenEventId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await directGamesAPI.listEvents({ ...filters, page, limit: PAGE_SIZE }));
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="md:w-56">
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={inputClass}>
            {STATUS_FILTERS.map((s) => (
              <option key={s.label} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:w-64">
          <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
          <select value={filters.reason} onChange={(e) => setFilter('reason', e.target.value)} className={inputClass}>
            <option value="">Any reason</option>
            {Object.entries(REASON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:w-64">
          <label className="block text-xs font-medium text-gray-600 mb-1">Game</label>
          <select value={filters.game} onChange={(e) => setFilter('game', e.target.value)} className={inputClass}>
            <option value="">All games</option>
            {games.map((g) => (
              <option key={g._id} value={g._id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading events..." size="small" />
      ) : data.events.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          {filters.status === 'review,failed' ? 'Nothing waiting for review.' : 'No events match these filters.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Received', 'Game / task', 'Player', 'Status', 'Reason', ''].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(event.receivedAt || event.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{event.game?.title || '-'}</div>
                    <div className="text-xs text-gray-500">
                      {event.task?.name || event.eventName || <span className="font-mono">{event.eventToken}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {event.userId ? event.userId.email || `${event.userId.firstName} ${event.userId.lastName}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_STYLES[event.status] || ''}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{reasonLabel(event.reason)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenEventId(event._id)}
                      className="px-3 py-1 rounded-md text-sm bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Pagination
                currentPage={page}
                totalPages={data.pagination.pages}
                totalItems={data.pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <EventDecisionModal eventId={openEventId} onClose={() => setOpenEventId(null)} onDecided={load} />
    </div>
  );
}
