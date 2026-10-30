'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalShell from './ModalShell';
import { inputClass } from './constants';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

const EMPTY = { adjustAppToken: '', trackerUrl: '', packageName: '', storeUrl: '', iconUrl: '' };

/** Links a client game to its Adjust app. */
export default function AdjustConfigModal({ isOpen, onClose, game, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !game) return;
    setForm({
      adjustAppToken: game.directIntegration?.adjustAppToken || '',
      trackerUrl: game.directIntegration?.trackerUrl || '',
      packageName: game.packageName || '',
      storeUrl: game.storeUrl || '',
      iconUrl: game.iconUrl || '',
    });
    setErrors({});
  }, [isOpen, game]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Fills the package name from a Play Store link, where it is the `id` param
  const handleStoreUrl = (value) => {
    set('storeUrl', value);
    try {
      const id = new URL(value).searchParams.get('id');
      if (id && !form.packageName) set('packageName', id);
    } catch {
      // not a full URL yet
    }
  };

  const validate = () => {
    const next = {};
    const isUrl = (v) => {
      try {
        return ['http:', 'https:'].includes(new URL(v).protocol);
      } catch {
        return false;
      }
    };
    if (!form.adjustAppToken.trim()) next.adjustAppToken = 'App token is required';
    if (!isUrl(form.trackerUrl)) next.trackerUrl = 'Enter the full tracker link, e.g. https://app.adjust.com/abc123';
    if (form.storeUrl && !isUrl(form.storeUrl)) next.storeUrl = 'Enter a valid link';
    if (form.iconUrl && !isUrl(form.iconUrl)) next.iconUrl = 'Enter a valid link';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await directGamesAPI.saveConfig(game._id, {
        adjustAppToken: form.adjustAppToken.trim(),
        trackerUrl: form.trackerUrl.trim(),
        packageName: form.packageName.trim(),
        storeUrl: form.storeUrl.trim(),
        iconUrl: form.iconUrl.trim(),
      });
      toast.success('Adjust setup saved');
      onSaved?.(result);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save Adjust setup'));
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}, help) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={form[name]}
        onChange={(e) => (name === 'storeUrl' ? handleStoreUrl(e.target.value) : set(name, e.target.value))}
        className={`${inputClass} ${errors[name] ? 'border-red-300' : ''}`}
        {...props}
      />
      {errors[name] ? (
        <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
      ) : (
        help && <p className="mt-1 text-xs text-gray-500">{help}</p>
      )}
    </div>
  );

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={`Adjust setup - ${game?.title || ''}`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {field(
          'adjustAppToken',
          'Adjust app token *',
          { placeholder: 'e.g. abc123def456' },
          "The client game's app token in Adjust (App settings). Identifies which game an event belongs to."
        )}
        {field(
          'trackerUrl',
          'Adjust tracker link *',
          { placeholder: 'https://app.adjust.com/abc123' },
          'Opened when a player taps Play. Jackson adds a one-time label to it to recognise the player.'
        )}
        {field(
          'storeUrl',
          'Play Store link',
          { placeholder: 'https://play.google.com/store/apps/details?id=com.client.game' },
          'The package name is filled in from this link.'
        )}
        {field('packageName', 'Package name', { placeholder: 'com.client.game' }, 'Lets the app check whether the game is installed.')}
        {field('iconUrl', 'Icon URL', { placeholder: 'https://...' }, 'Optional. The game thumbnail from the game form is used where set.')}

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
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
