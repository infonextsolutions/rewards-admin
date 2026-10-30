'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';
import ClientGameDetail from './ClientGameDetail';
import ReviewQueue from './ReviewQueue';
import ReconciliationReport from './ReconciliationReport';
import { directGamesAPI, apiErrorMessage } from '../../data/directGames';

const TABS = [
  { id: 'games', label: 'Games & Tasks' },
  { id: 'review', label: 'Events & Review Queue' },
  { id: 'report', label: 'Monthly Reconciliation' },
];

/**
 * Client games: games entered by hand whose milestones arrive from Adjust.
 * The game itself (details, targeting, placement) is edited in Games Listing
 * like any other game; this screen holds what is specific to Adjust.
 */
export default function ClientGamesModule() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get('game');
  const [tab, setTab] = useState(searchParams.get('tab') || 'games');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async () => {
    try {
      setGames(await directGamesAPI.listGames());
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to load client games'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const selectGame = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('game', id);
    else params.delete('game');
    router.replace(`/offers/client-games${params.toString() ? `?${params}` : ''}`);
  };

  const selectedGame = games.find((g) => g._id === selectedId) || null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/offers/games" className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">Client Games (Adjust)</h2>
          </div>
          <p className="text-sm text-gray-600">
            Games added by hand whose milestones are reported by Adjust. Create the game in{' '}
            <Link href="/offers/games" className="text-blue-600 hover:underline">
              Games Listing
            </Link>{' '}
            with SDK &quot;Client game (Adjust)&quot;, then link it to Adjust and add its tasks here.
          </p>
        </div>

        <div className="px-6 border-b border-gray-200">
          <nav className="flex gap-6 -mb-px overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  tab === t.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner message="Loading client games..." size="small" />
          ) : tab === 'games' ? (
            games.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No client games yet. Add one in Games Listing with SDK &quot;Client game (Adjust)&quot;.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Game', 'Section', 'Visible', 'Rewards', 'Setup', ''].map((h) => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {games.map((game) => {
                        const errors = game.issues.filter((i) => i.level === 'error').length;
                        const selected = game._id === selectedId;
                        return (
                          <tr key={game._id} className={selected ? 'bg-green-50' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{game.title}</div>
                              <div className="text-xs text-gray-500 font-mono">{game.gameId}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{game.uiSection || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{game.isActive ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-3 text-sm">
                              {game.directIntegration?.rewardsEnabled === false ? (
                                <span className="text-red-700 font-medium">Off</span>
                              ) : (
                                <span className="text-emerald-700 font-medium">On</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {errors === 0 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" /> Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-700">
                                  <XCircleIcon className="h-4 w-4" /> {errors} to fix
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => selectGame(selected ? null : game._id)}
                                className="px-3 py-1 rounded-md text-sm bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                {selected ? 'Close' : 'Manage'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedGame && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">{selectedGame.title}</h3>
                    <ClientGameDetail key={selectedGame._id} game={selectedGame} onGameChanged={loadGames} />
                  </div>
                )}
                {selectedId && !selectedGame && (
                  <p className="text-sm text-red-600">
                    This game is not a client game, or it no longer exists.
                  </p>
                )}
              </div>
            )
          ) : tab === 'review' ? (
            <ReviewQueue games={games} />
          ) : (
            <ReconciliationReport />
          )}
        </div>
      </div>
    </div>
  );
}
