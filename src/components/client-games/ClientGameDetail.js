'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../offers/modals/ConfirmationModal';
import AdjustConfigModal from './AdjustConfigModal';
import ClientTaskModal from './ClientTaskModal';
import { EVENT_TYPES } from './constants';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

/** Setup checklist, Adjust link, rewards switch and tasks for one client game. */
export default function ClientGameDetail({ game, onGameChanged }) {
  const [tasks, setTasks] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [savingTask, setSavingTask] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const [togglingRewards, setTogglingRewards] = useState(false);
  const [confirmRewardsOff, setConfirmRewardsOff] = useState(false);
  const [classifyingId, setClassifyingId] = useState(null);

  const rewardsEnabled = game.directIntegration?.rewardsEnabled !== false;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskList, check] = await Promise.all([
        directGamesAPI.listTasks(game._id),
        directGamesAPI.getValidation(game._id),
      ]);
      setTasks([...taskList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setValidation(check);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to load game setup'));
    } finally {
      setLoading(false);
    }
  }, [game._id]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshValidation = async () => {
    try {
      setValidation(await directGamesAPI.getValidation(game._id));
    } catch {
      // the next full load will show it
    }
  };

  const handleSaveTask = async (payload) => {
    setSavingTask(true);
    try {
      if (taskModal.task) {
        await directGamesAPI.updateTask(taskModal.task._id, payload);
        toast.success('Task updated');
      } else {
        await directGamesAPI.createTask(game._id, payload);
        toast.success('Task added');
      }
      setTaskModal({ open: false, task: null });
      await load();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save task'));
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await directGamesAPI.deleteTask(deleteTask._id);
      toast.success('Task deleted');
      setDeleteTask(null);
      await load();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete task'));
    }
  };

  const toggleEventType = async (task, type) => {
    const current = Array.isArray(task.eventTypes) ? task.eventTypes : [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    setClassifyingId(task._id);
    try {
      const updated = await directGamesAPI.setTaskClassification(task._id, next);
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, eventTypes: updated?.eventTypes ?? next, classificationSource: 'admin' } : t
        )
      );
      refreshValidation();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to update classification'));
    } finally {
      setClassifyingId(null);
    }
  };

  const setRewards = async (enabled) => {
    setTogglingRewards(true);
    try {
      await directGamesAPI.setRewardsEnabled(game._id, enabled);
      toast.success(enabled ? 'Rewards switched on' : 'Rewards switched off');
      setConfirmRewardsOff(false);
      onGameChanged?.();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to change rewards switch'));
    } finally {
      setTogglingRewards(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading game setup..." size="small" />;

  const nextOrder = tasks.reduce((max, t) => Math.max(max, t.order || 0), 0) + 1;

  return (
    <div className="space-y-6">
      {/* Setup checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Setup check</h4>
            {validation?.ready ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircleIcon className="h-4 w-4" /> Ready to credit milestones
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                <XCircleIcon className="h-4 w-4" /> Not ready
              </span>
            )}
          </div>
          {!validation?.errors?.length && !validation?.warnings?.length ? (
            <p className="text-sm text-gray-500">No issues found.</p>
          ) : (
            <ul className="space-y-1.5">
              {validation.errors.map((issue, i) => (
                <li key={`e${i}`} className="flex items-start gap-2 text-sm text-red-700">
                  <XCircleIcon className="h-4 w-4 mt-0.5 shrink-0" /> {issue.message}
                </li>
              ))}
              {validation.warnings.map((issue, i) => (
                <li key={`w${i}`} className="flex items-start gap-2 text-sm text-amber-700">
                  <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" /> {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Rewards</h4>
            <button
              type="button"
              disabled={togglingRewards}
              onClick={() => (rewardsEnabled ? setConfirmRewardsOff(true) : setRewards(true))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                rewardsEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle rewards"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  rewardsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {rewardsEnabled
              ? 'Milestones are credited automatically.'
              : 'Off: new milestones go to the review queue instead of being paid.'}
          </p>
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
            <div>
              App token:{' '}
              <span className="font-mono">{game.directIntegration?.adjustAppToken || '-'}</span>
            </div>
            <div className="break-all">Tracker: {game.directIntegration?.trackerUrl || '-'}</div>
            <div>Package: {game.packageName || '-'}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowConfig(true)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit Adjust setup
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Tasks ({tasks.length})</h4>
            <p className="text-xs text-gray-500">
              Each task pays when Adjust reports its event for the player. Visibility, unlock order and
              coin box rules work as for partner games.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTaskModal({ open: true, task: null })}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" /> Add task
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">No tasks yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Task', 'Adjust event', 'Reward', 'Counts toward challenges', ''].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => {
                  const types = Array.isArray(task.eventTypes) ? task.eventTypes : [];
                  return (
                    <tr key={task._id} className={task.isActive === false ? 'opacity-50' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-500">{task.order}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{task.name}</div>
                        <div className="text-xs text-gray-500">{task.completionRule}</div>
                        <div className="mt-1 flex gap-1">
                          {task.isRepeatable && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Repeatable</span>
                          )}
                          {task.isActive === false && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">Inactive</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">
                        {task.externalTaskId || <span className="text-red-600 font-sans">Missing</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {task.rewardValue} {task.rewardType === 'xp' ? 'XP' : 'coins'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {EVENT_TYPES.map((type) => {
                            const active = types.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                disabled={classifyingId === task._id}
                                onClick={() => toggleEventType(task, type)}
                                className={`text-xs px-2 py-0.5 rounded-full border capitalize transition-colors disabled:opacity-50 ${
                                  active
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-500'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setTaskModal({ open: true, task })}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit task"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTask(task)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdjustConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        game={game}
        onSaved={() => {
          onGameChanged?.();
          refreshValidation();
        }}
      />
      <ClientTaskModal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null })}
        task={taskModal.task}
        nextOrder={nextOrder}
        onSave={handleSaveTask}
        saving={savingTask}
      />
      <ConfirmationModal
        isOpen={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete task"
        message={`Delete "${deleteTask?.name}"? Milestones for its Adjust event will go to the review queue.`}
        confirmText="Delete"
      />
      <ConfirmationModal
        isOpen={confirmRewardsOff}
        onClose={() => setConfirmRewardsOff(false)}
        onConfirm={() => setRewards(false)}
        title="Switch off rewards"
        message={`Stop paying milestones for "${game.title}" and all its variants? New events will wait in the review queue.`}
        confirmText="Switch off"
        loading={togglingRewards}
      />
    </div>
  );
}
