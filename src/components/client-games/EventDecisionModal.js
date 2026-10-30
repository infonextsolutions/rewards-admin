'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalShell from './ModalShell';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ACTIONABLE_STATUSES, MATCH_LABELS, STATUS_STYLES, inputClass, reasonLabel } from './constants';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);
const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

/**
 * One event from the queue: what arrived, why it stopped, and the admin
 * decision. Crediting still pays a milestone at most once per player.
 */
export default function EventDecisionModal({ eventId, onClose, onDecided }) {
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setEvent(null);
    setUserId('');
    setTaskId('');
    setNote('');
    directGamesAPI
      .getEvent(eventId)
      .then(async (data) => {
        setEvent(data);
        // Only an event without a matched task needs a task picked
        if (!data.task && data.game?._id) {
          setTasks(await directGamesAPI.listTasks(data.game._id));
        } else {
          setTasks([]);
        }
      })
      .catch((error) => toast.error(apiErrorMessage(error, 'Failed to load event')));
  }, [eventId]);

  const actionable = event && ACTIONABLE_STATUSES.includes(event.status);
  const needsUser = event && !event.userId;
  const needsTask = event && !event.task;

  const run = async (action) => {
    setBusy(true);
    try {
      let result;
      if (action === 'credit') {
        if (needsUser && !isObjectId(userId.trim())) {
          toast.error('Enter the user ID (24 characters, from the Users page)');
          return;
        }
        if (needsTask && !taskId) {
          toast.error('Choose the task this milestone completes');
          return;
        }
        result = await directGamesAPI.creditEvent(event._id, {
          userId: needsUser ? userId.trim() : undefined,
          taskId: needsTask ? taskId : undefined,
          note: note.trim() || undefined,
        });
        if (result.success) {
          toast.success('Event credited');
        } else {
          // Reached a decision, but not a payment - e.g. already rewarded
          toast.error(result.message || 'Event was not credited');
        }
      } else if (action === 'reject') {
        result = await directGamesAPI.rejectEvent(event._id, note.trim() || undefined);
        toast.success('Event rejected');
      } else {
        result = await directGamesAPI.retryEvent(event._id);
        toast.success(result.message || 'Event re-checked');
      }
      onDecided?.();
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Action failed'));
    } finally {
      setBusy(false);
    }
  };

  const row = (label, value) => (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2 text-gray-900 break-all">{value || '-'}</div>
    </div>
  );

  const userName = event?.userId
    ? `${event.userId.firstName || ''} ${event.userId.lastName || ''}`.trim() || event.userId.email
    : null;

  return (
    <ModalShell isOpen={!!eventId} onClose={onClose} title="Event details" size="max-w-3xl">
      {!event ? (
        <div className="p-6">
          <LoadingSpinner message="Loading event..." size="small" />
        </div>
      ) : (
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_STYLES[event.status] || ''}`}>
              {event.status}
            </span>
            {event.reason && <span className="text-sm text-gray-700">{reasonLabel(event.reason)}</span>}
          </div>
          {event.reasonDetail && <p className="text-sm text-gray-600 -mt-3">{event.reasonDetail}</p>}

          <div>
            {row('Game', event.game?.title)}
            {row('Task', event.task ? `${event.task.name} (${event.task.rewardValue} ${event.task.rewardType})` : null)}
            {row('Player', userName ? `${userName} - ${event.userId.email || ''}` : null)}
            {row('Matched by', MATCH_LABELS[event.matchMethod])}
            {row('Adjust event', [event.eventName, event.eventToken].filter(Boolean).join(' - '))}
            {row('Milestone time', formatDate(event.eventTime))}
            {row('Received', formatDate(event.receivedAt))}
            {row('Adjust device ID', event.adid)}
            {row('Advertising ID', event.gpsAdid)}
            {row('Launch label', event.label)}
            {event.reward?.coins || event.reward?.xp
              ? row('Paid', `${event.reward.coins || 0} coins, ${event.reward.xp || 0} XP${event.reward.coinBoxAccumulated ? ' (coin box)' : ''}`)
              : null}
            {event.review?.decidedAt &&
              row('Decision', `${event.review.decision || '-'} on ${formatDate(event.review.decidedAt)}${event.review.note ? ` - ${event.review.note}` : ''}`)}
          </div>

          {actionable && (
            <div className="space-y-3 pt-2">
              {needsUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit to user ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="User ID from the Users page"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              )}
              {needsTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task completed</label>
                  {tasks.length ? (
                    <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className={inputClass}>
                      <option value="">Choose task...</option>
                      {tasks.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.order}. {t.name} ({t.rewardValue} {t.rewardType})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No game was matched. Fix the game&apos;s Adjust setup or task mapping, then use Retry.
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why this decision, e.g. support ticket number"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run('retry')}
                  title="Run the automatic checks again, e.g. after fixing the game setup"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Retry checks
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run('reject')}
                  className="px-4 py-2 rounded-md text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busy || (needsTask && !tasks.length)}
                  onClick={() => run('credit')}
                  className="px-4 py-2 rounded-md text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  Credit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}
