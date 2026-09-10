'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import LoadingSpinner from '../ui/LoadingSpinner'
import { gamesAPI } from '../../data/games'
import apiClient from '../../lib/apiClient'
import toast from 'react-hot-toast'

export default function ViewTasksModule() {
  const searchParams = useSearchParams()
  const gameFilter = searchParams.get('game')

  const [gameData, setGameData] = useState(null)
  const [besitosRawData, setBesitosRawData] = useState(null)
  const [goals, setGoals] = useState([])
  const [events, setEvents] = useState([])
  const [gameTasks, setGameTasks] = useState([])
  const [savingTaskId, setSavingTaskId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch game data when component mounts
  useEffect(() => {
    if (gameFilter) {
      fetchGameData()
    }
  }, [gameFilter])

  const fetchGameData = async () => {
    if (!gameFilter) return

    setLoading(true)
    setError(null)

    try {
      const game = await gamesAPI.getGameById(gameFilter)
      setGameData(game)

      // Fetch full game data from API to get besitosRawData
      const response = await apiClient.get(
        `/admin/game-offers/games/${gameFilter}`
      )
      const fullGameData = response.data.data

      // Store entire besitosRawData
      if (fullGameData.besitosRawData) {
        setBesitosRawData(fullGameData.besitosRawData)

        // Extract goals from besitosRawData
        if (fullGameData.besitosRawData.goals) {
          setGoals(fullGameData.besitosRawData.goals)
        } else {
          setGoals([])
        }

        // Extract events from besitosRawData (for BitLabs)
        if (
          fullGameData.besitosRawData.events &&
          Array.isArray(fullGameData.besitosRawData.events)
        ) {
          setEvents(fullGameData.besitosRawData.events)
        } else {
          setEvents([])
        }
      } else {
        setBesitosRawData(null)
        setGoals([])
        setEvents([])
      }

      // Provider-synced tasks are hidden from the normal task list because a
      // game can carry 20+ of them; this screen exists to classify them, so it
      // opts in explicitly.
      try {
        const tasksResponse = await apiClient.get(
          `/admin/game-offers/games/${gameFilter}/tasks`,
          { params: { includeProviderSynced: true, limit: 200 } }
        )
        setGameTasks(tasksResponse.data?.data?.tasks || [])
      } catch (taskErr) {
        console.error('Error fetching game tasks:', taskErr)
        setGameTasks([])
      }
    } catch (err) {
      console.error('Error fetching game data:', err)
      setError('Failed to load game data. Please try again.')
      toast.error('Failed to load game data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format field names for display - use exact key name
  const formatFieldName = (key) => {
    return key
  }

  // Helper function to format field values
  const formatFieldValue = (key, value) => {
    if (value === null || value === undefined) {
      return 'N/A'
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return JSON.stringify(value, null, 2)
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'None'
      }
      // Special handling for arrays of objects
      if (value.length > 0 && typeof value[0] === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return value.join(', ')
    }
    // Handle HTML content
    if (typeof value === 'string' && value.includes('<')) {
      return value
    }
    return String(value)
  }

  // Render field value with special handling for images and URLs
  const renderFieldValue = (key, value) => {
    if (key === 'image' || key === 'square_image' || key === 'large_image') {
      console.log(value, 'value')
      return (
        <div className='mt-2'>
          <img
            src={value}
            alt={key}
            className='max-w-full h-auto rounded-md border border-gray-200'
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div
            style={{ display: 'none' }}
            className='text-xs text-gray-500 mt-1'
          >
            {value}
          </div>
        </div>
      )
    }

    // Handle URL fields - make clickable
    if (
      key === "url" ||
      key === "click_url" ||
      key === "support_url" ||
      key === "impression_url" ||
      key === "clickUrl" ||
      key === "supportUrl" ||
      key === "impressionUrl" ||
      (typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://")))
    ) {
      return (
        <a
          href={value}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-800 underline break-all'
        >
          {value}
        </a>
      )
    }

    // Handle screenshot URLs array
    if (key === "screenshot_urls" && Array.isArray(value) && value.length > 0) {
      return (
        <div
          className='text-sm text-gray-900 prose prose-sm max-w-none'
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )
    }

    // Default: format as text/JSON
    return (
      <div className='text-sm text-gray-900 break-words whitespace-pre-wrap'>
        {formatFieldValue(key, value)}
      </div>
    )
  }

  const EVENT_TYPES = ['purchase', 'milestone', 'install', 'playtime']

  // Saving always promotes the source to "admin". That is what makes a task
  // countable: keyword-inferred guesses deliberately never satisfy a purchase
  // or milestone challenge, so a Besitos goal stays inert until confirmed here.
  const toggleEventType = async (task, type) => {
    const current = Array.isArray(task.eventTypes) ? task.eventTypes : []
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]

    setSavingTaskId(task.id || task._id)
    try {
      const { data } = await apiClient.patch(
        `/admin/game-offers/tasks/${task.id || task._id}/classification`,
        { eventTypes: next }
      )
      const updated = data?.data
      setGameTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === (task.id || task._id)
            ? { ...t, eventTypes: updated?.eventTypes ?? next, classificationSource: 'admin' }
            : t
        )
      )
      toast.success('Classification updated')
    } catch (err) {
      console.error('Error updating classification:', err)
      toast.error(
        err?.response?.data?.message || 'Failed to update classification'
      )
    } finally {
      setSavingTaskId(null)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <Link
                  href='/offers/games'
                  className='text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50'
                >
                  <ArrowLeftIcon className='h-5 w-5' />
                </Link>
                <h2 className='text-lg font-semibold text-gray-900'>
                  View Tasks - Besitos Raw Data
                </h2>
                {gameFilter && (
                  <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                    Game ID: {gameFilter}
                  </span>
                )}
                {gameData && (
                  <span className='text-sm text-gray-700 bg-blue-100 px-3 py-1 rounded-full'>
                    {gameData.title}
                  </span>
                )}
              </div>
              <p className='mt-1 text-sm text-gray-600'>
                Displaying all besitosRawData fields and goals for this game
              </p>
            </div>
          </div>
        </div>

        {/* Besitos Raw Data Display */}
        {loading ? (
          <div className='px-6 py-12'>
            <LoadingSpinner message='Loading game data...' size='medium' />
          </div>
        ) : error ? (
          <div className='px-6 py-8 text-center'>
            <p className='text-red-500'>{error}</p>
          </div>
        ) : !besitosRawData ? (
          <div className='px-6 py-12 text-center'>
            <p className='text-gray-500'>
              No besitosRawData found for this game.
            </p>
          </div>
        ) : (
          <div className='p-6 space-y-6'>
            {/* Besitos Raw Data Fields (excluding goals) */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200'>
                Besitos Raw Data
              </h3>
              <div className='bg-gray-50 rounded-lg p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {Object.entries(besitosRawData)
                    .filter(
                      ([key]) =>
                        key !== "goals" &&
                        key !== "events" &&
                        key !== "app_metadata"
                    ) // Exclude goals, events, and app_metadata, will show separately
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className='bg-white border border-gray-200 rounded-lg p-4'
                      >
                        <div className='space-y-2'>
                          <div className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                            {formatFieldName(key)}
                          </div>
                          {renderFieldValue(key, value)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Screenshots from app_metadata (for BitLabs) */}
            {besitosRawData?.app_metadata?.screenshot_urls &&
              Array.isArray(besitosRawData.app_metadata.screenshot_urls) &&
              besitosRawData.app_metadata.screenshot_urls.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Screenshots (
                    {besitosRawData.app_metadata.screenshot_urls.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {besitosRawData.app_metadata.screenshot_urls.map(
                      (url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(url, "_blank")}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Task classification - what daily challenges count */}
            {gameTasks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 pb-2 border-b border-gray-200">
                  Task Classification ({gameTasks.length})
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Daily challenges asking for purchases or milestones only count
                  tasks classified here. BitLabs tasks are classified
                  automatically from the provider; Besitos has no equivalent
                  data, so its suggestions are guesses from the task text and
                  must be confirmed before they count.
                </p>
                <div className="space-y-2">
                  {gameTasks.map((task) => {
                    const id = task.id || task._id
                    const types = Array.isArray(task.eventTypes)
                      ? task.eventTypes
                      : []
                    const source = task.classificationSource
                    return (
                      <div
                        key={id}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 break-words">
                            {task.name}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {source === 'inferred' && (
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                                Needs confirmation
                              </span>
                            )}
                            {source === 'provider' && (
                              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                                From provider
                              </span>
                            )}
                            {source === 'admin' && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                                Confirmed
                              </span>
                            )}
                            {!source && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                Unclassified
                              </span>
                            )}
                            {task.externalTaskId && (
                              <span className="text-xs text-gray-400 font-mono">
                                {task.externalTaskId}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {EVENT_TYPES.map((type) => {
                            const active = types.includes(type)
                            return (
                              <button
                                key={type}
                                type="button"
                                disabled={savingTaskId === id}
                                onClick={() => toggleEventType(task, type)}
                                className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors disabled:opacity-50 ${
                                  active
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-500'
                                }`}
                              >
                                {type}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Events/Tasks Display (for BitLabs) */}
            {besitosRawData?.events &&
              Array.isArray(besitosRawData.events) &&
              besitosRawData.events.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Tasks/Events ({besitosRawData.events.length})
                  </h3>
                  <div className="space-y-3">
                    {besitosRawData.events.map((event, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-3">
                          <h4 className="text-md font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                            {event.name || `Event ${index + 1}`}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(event).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  {formatFieldName(key)}
                                </div>
                                <div className="text-sm text-gray-900 break-words">
                                  {formatFieldValue(key, value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Goals Display (for Besitos) */}
            {goals.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200'>
                  Goals ({goals.length})
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {goals.map((goal, index) => (
                    <div
                      key={goal.goal_id || index}
                      className='bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow'
                    >
                      <div className='space-y-3'>
                        <h4 className='text-md font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200'>
                          Goal #{index + 1}
                        </h4>
                        {Object.entries(goal).map(([key, value]) => (
                          <div key={key} className='space-y-1'>
                            <div className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                              {formatFieldName(key)}
                            </div>
                            <div className='text-sm text-gray-900 break-words'>
                              {formatFieldValue(key, value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
