'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import ModalShell from './ModalShell';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

const excludedReason = (name) => {
  if (/^s2s_/i.test(name)) return 'Server-to-server duplicate';
  if (/^make purchase of \$/i.test(name)) return 'Purchase amount event';
  if (/^refund$/i.test(name)) return 'Refund event';
  return null;
};

const makeTask = (sourceRow, token, rawName, order, gameTitle) => {
  const name = String(rawName || '').trim();
  const exclusion = excludedReason(name);
  if (exclusion) return { sourceRow, token, name, exclusion };
  if (/^app-install$/i.test(name)) return {
    sourceRow, externalTaskId: token, name: `Install and open ${gameTitle}`, completionRule: `Install and open ${gameTitle}`,
    rewardType: 'coins', rewardValue: 10, order, isRepeatable: false, isActive: false, eventTypes: ['install'],
  };
  const level = name.match(/^level\s+(\d+)$/i);
  if (level) return {
    sourceRow, externalTaskId: token, name: `Reach level ${level[1]}`, completionRule: `Complete level ${level[1]} in ${gameTitle}`,
    rewardType: 'coins', rewardValue: 10, order, isRepeatable: false, isActive: true, eventTypes: ['milestone'],
  };
  if (/^iap$/i.test(name)) return {
    sourceRow, externalTaskId: token, name: 'Make an in-app purchase', completionRule: 'Make an in-app purchase',
    rewardType: 'coins', rewardValue: 50, order, isRepeatable: true, isActive: true, eventTypes: ['purchase'],
  };
  return { sourceRow, token, name, needsMapping: true };
};

export default function ImportClientTasksModal({ isOpen, onClose, game, nextOrder, existingTasks = [], onApplied }) {
  const [tasks, setTasks] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [unmapped, setUnmapped] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const reset = () => {
    setTasks([]); setExcluded([]); setUnmapped([]); setPreview(null); setErrors([]); setLoading(false);
  };
  const close = () => { if (!loading) { reset(); onClose(); } };

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });
      const header = rows.shift().map((value) => String(value).trim().toLowerCase());
      const tokenAt = header.indexOf('token');
      const nameAt = header.indexOf('name');
      if (tokenAt < 0 || nameAt < 0) throw new Error('CSV must have token and name columns');
      const existingByToken = new Map(existingTasks.map((task) => [task.externalTaskId, task]));
      const parsed = rows.filter((row) => row.some((value) => String(value).trim())).map((row, index) => makeTask(index + 2, String(row[tokenAt] || '').trim(), row[nameAt], 0, game.title));
      const actionable = parsed.filter((row) => !row.exclusion && !row.needsMapping).sort((a, b) => {
        const key = (row) => /^Install/.test(row.name) ? -1 : /^Reach level (\d+)/.test(row.name) ? Number(row.name.match(/\d+/)[0]) : Number.MAX_SAFE_INTEGER;
        return key(a) - key(b);
      }).map((row, index) => ({ ...row, order: existingByToken.get(row.externalTaskId)?.order ?? ((Number(nextOrder) || 1) + index) }));
      setTasks(actionable);
      setExcluded(parsed.filter((row) => row.exclusion));
      setUnmapped(parsed.filter((row) => row.needsMapping));
      setPreview(null);
    } catch (error) { toast.error(error.message || 'Could not read the CSV'); }
  };

  const createPreview = async () => {
    if (!tasks.length || unmapped.length) return;
    setLoading(true);
    try { setPreview(await directGamesAPI.previewTaskImport(game._id, tasks)); }
    catch (error) { setErrors(error?.response?.data?.errors || []); toast.error(apiErrorMessage(error, 'Could not preview import')); }
    finally { setLoading(false); }
  };

  const apply = async () => {
    if (!preview?.hash) return;
    setLoading(true);
    try {
      const result = await directGamesAPI.applyTaskImport(game._id, tasks, preview.hash);
      toast.success(`Imported: ${result.counts.create} created, ${result.counts.update} updated`);
      onApplied?.(); close();
    } catch (error) { toast.error(apiErrorMessage(error, 'Could not apply import')); }
    finally { setLoading(false); }
  };

  return <ModalShell isOpen={isOpen} onClose={close} title="Import Adjust event-list CSV">
    <div className="p-6 space-y-4">
      <p className="text-sm text-gray-600">Upload Adjust&apos;s event-list CSV. Nothing is saved until you review the server preview and apply it.</p>
      <input type="file" accept=".csv,text/csv" onChange={chooseFile} disabled={loading} />
      {!!excluded.length && <p className="text-sm text-gray-600">{excluded.length} rows excluded: s2s duplicates, purchase-amount events, or refunds.</p>}
      {!!unmapped.length && <div className="rounded bg-amber-50 p-3 text-sm text-amber-800">{unmapped.length} row(s) need manual mapping before import: {unmapped.map((row) => row.name || '(blank)').join(', ')}</div>}
      {!!tasks.length && <div className="max-h-64 overflow-auto rounded border">
        <table className="min-w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Task</th><th className="p-2 text-left">Token</th><th className="p-2 text-left">Reward</th></tr></thead>
          <tbody>{tasks.map((task) => <tr key={`${task.sourceRow}-${task.externalTaskId}`} className="border-t"><td className="p-2">{task.name}{!task.isActive && <span className="ml-2 text-xs text-gray-500">inactive</span>}</td><td className="p-2 font-mono">{task.externalTaskId}</td><td className="p-2">{task.rewardValue} coins</td></tr>)}</tbody>
        </table>
      </div>}
      {preview && <div className="rounded bg-blue-50 p-3 text-sm text-blue-900">Preview: {preview.counts.create} create, {preview.counts.update} update, {preview.counts.unchanged} unchanged. Applying writes only the create/update rows.</div>}
      {!!preview?.rows?.length && <div className="text-xs text-gray-600">{preview.rows.map((row) => <div key={row.sourceRow}>{row.externalTaskId}: {row.action}</div>)}</div>}
      {!!errors.length && <div className="rounded bg-red-50 p-3 text-sm text-red-800">{errors.map((error, index) => <div key={index}>Row {error.row || '-'}: {error.message}</div>)}</div>}
      <div className="flex justify-end gap-3"><button type="button" onClick={close} disabled={loading} className="px-3 py-2 text-sm">Cancel</button>
        {!preview ? <button type="button" onClick={createPreview} disabled={loading || !tasks.length || !!unmapped.length} className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50">{loading ? 'Checking…' : 'Preview import'}</button>
          : <button type="button" onClick={apply} disabled={loading} className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50">{loading ? 'Applying…' : 'Confirm and apply'}</button>}
      </div>
    </div>
  </ModalShell>;
}
