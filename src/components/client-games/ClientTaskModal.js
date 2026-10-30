'use client';

import { useState, useEffect } from 'react';
import ModalShell from './ModalShell';
import { inputClass } from './constants';

const EMPTY = {
  name: '',
  completionRule: '',
  externalTaskId: '',
  rewardType: 'coins',
  rewardValue: 0,
  order: 1,
  isRepeatable: false,
  isActive: true,
};

/**
 * Add / edit a client-game task. A task pays when Adjust reports its event
 * token for a player; `order` sets the unlock sequence players see.
 */
export default function ClientTaskModal({ isOpen, onClose, task, nextOrder, onSave, saving }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      task
        ? {
            name: task.name || '',
            completionRule: task.completionRule || '',
            externalTaskId: task.externalTaskId || '',
            rewardType: task.rewardType || 'coins',
            rewardValue: task.rewardValue ?? 0,
            order: task.order ?? 1,
            isRepeatable: Boolean(task.isRepeatable),
            isActive: task.isActive !== false,
          }
        : { ...EMPTY, order: nextOrder || 1 }
    );
    setErrors({});
  }, [isOpen, task, nextOrder]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Task name is required';
    if (!form.completionRule.trim()) next.completionRule = 'Describe what the player must do';
    if (!form.externalTaskId.trim()) next.externalTaskId = 'Adjust event token is required';
    if (form.rewardValue === '' || Number(form.rewardValue) < 0) next.rewardValue = 'Enter a valid reward';
    if (!Number.isInteger(Number(form.order)) || Number(form.order) < 1) next.order = 'Order must be 1 or more';
    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({
      name: form.name.trim(),
      completionRule: form.completionRule.trim(),
      externalTaskId: form.externalTaskId.trim(),
      rewardType: form.rewardType,
      rewardValue: Number(form.rewardValue),
      order: Number(form.order),
      isRepeatable: form.isRepeatable,
      isActive: form.isActive,
    });
  };

  const error = (name) => errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>;
  const cls = (name) => `${inputClass} ${errors[name] ? 'border-red-300' : ''}`;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Reach level 10"
            className={cls('name')}
          />
          {error('name')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What the player must do *</label>
          <input
            type="text"
            value={form.completionRule}
            onChange={(e) => set('completionRule', e.target.value)}
            placeholder="Shown to players, e.g. Complete level 10 in the game"
            className={cls('completionRule')}
          />
          {error('completionRule')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adjust event token *</label>
          <input
            type="text"
            value={form.externalTaskId}
            onChange={(e) => set('externalTaskId', e.target.value)}
            placeholder="e.g. a1b2c3"
            className={`${cls('externalTaskId')} font-mono`}
          />
          {error('externalTaskId') || (
            <p className="mt-1 text-xs text-gray-500">
              The token of the event the game sends to Adjust for this milestone (Adjust → Events).
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward type</label>
            <select value={form.rewardType} onChange={(e) => set('rewardType', e.target.value)} className={inputClass}>
              <option value="coins">Coins</option>
              <option value="xp">XP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward value</label>
            <input
              type="number"
              min="0"
              value={form.rewardValue}
              onChange={(e) => set('rewardValue', e.target.value === '' ? '' : Number(e.target.value))}
              className={cls('rewardValue')}
            />
            {error('rewardValue') ||
              (form.rewardType === 'xp' && (
                <p className="mt-1 text-xs text-gray-500">
                  If the game has a stepwise Base XP set, XP tasks pay that instead, as for partner games.
                </p>
              ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              min="1"
              value={form.order}
              onChange={(e) => set('order', e.target.value === '' ? '' : Number(e.target.value))}
              className={cls('order')}
            />
            {error('order') || <p className="mt-1 text-xs text-gray-500">Tasks unlock in this order.</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isRepeatable}
              onChange={(e) => set('isRepeatable', e.target.checked)}
              className="mt-0.5 h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <span>
              Repeatable
              <span className="block text-xs text-gray-500">Pays every time. Otherwise once per player.</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="mt-0.5 h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <span>
              Active
              <span className="block text-xs text-gray-500">Inactive tasks are hidden and do not pay.</span>
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
