// Human-readable text for the reasons the backend attaches to an event
// (utils/directGameProcessor.js). Unknown reasons fall back to the raw code.
export const REASON_LABELS = {
  unmatched_user: 'No user matched',
  ambiguous_device: 'Device linked to several users',
  device_match_needs_review: 'Matched by advertising ID only',
  ticket_device_mismatch: 'Launch link used on another device',
  ticket_game_mismatch: 'Launch link belongs to another game',
  unknown_game: 'No game has this Adjust app token',
  unknown_event: 'No task mapped to this Adjust event',
  ambiguous_task: 'Several tasks share this Adjust event',
  rewards_disabled: 'Rewards were switched off',
  late_event: 'Received too late',
  user_inactive: 'User account not active',
  user_not_found: 'User not found',
  malformed_callback: 'Incomplete callback from Adjust',
  processing_failed: 'Processing failed repeatedly',
  processing_error: 'Processing error, retrying',
  task_locked: 'Task still locked for the user',
  already_rewarded: 'Milestone already rewarded',
  already_completed: 'Task already completed',
  attribution_only: 'Install / attribution',
  unsupported_activity: 'Not a milestone event',
  sandbox_event: 'Adjust sandbox event',
  admin_rejected: 'Rejected by admin',
};

export const reasonLabel = (reason) => (reason ? REASON_LABELS[reason] || reason : '');

export const STATUS_STYLES = {
  credited: 'bg-emerald-100 text-emerald-800',
  held: 'bg-blue-100 text-blue-800',
  review: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-200 text-gray-700',
  duplicate: 'bg-gray-100 text-gray-600',
  ignored: 'bg-gray-100 text-gray-500',
  received: 'bg-gray-100 text-gray-600',
  processing: 'bg-gray-100 text-gray-600',
};

export const MATCH_LABELS = {
  ticket: 'Launch link',
  adjust_device: 'Known device',
  advertising_id: 'Advertising ID',
  admin: 'Assigned by admin',
};

// Statuses an admin can still act on
export const ACTIONABLE_STATUSES = ['review', 'held', 'failed'];

export const EVENT_TYPES = ['purchase', 'milestone', 'install', 'playtime'];

export const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500';
