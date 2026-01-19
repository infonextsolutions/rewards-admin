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
      } else {
        setBesitosRawData(null)
        setGoals([])
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
    if (key === 'url') {
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
    if (key === 'description' || key === 'details') {
      return (
        <div
          className='text-sm text-gray-900 prose prose-sm max-w-none'
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )
    }
    return (
      <div className='text-sm text-gray-900 break-words whitespace-pre-wrap'>
        {formatFieldValue(key, value)}
      </div>
    )
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
                    .filter(([key]) => key !== 'goals') // Exclude goals, will show separately
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

            {/* Goals Display */}
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
