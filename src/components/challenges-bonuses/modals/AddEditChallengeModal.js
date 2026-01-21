'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useMasterData } from '../../../hooks/useMasterData'
import { gamesAPI } from '../../../data/games'
import apiClient from '../../../lib/apiClient'

// Only allow creation of supported challenge types
const CHALLENGE_TYPES = ['Spin', 'Game']
const CLAIM_TYPES = ['Watch Ad', 'Auto']

export default function AddEditChallengeModal({
  isOpen,
  onClose,
  onSave,
  challenge = null,
  selectedDate = null,
  existingChallenges = [],
  loading = false,
}) {
  const { sdkProviders, countries } = useMasterData()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Spin',
    date: '',
    coinReward: '',
    xpReward: '',
    claimType: 'Watch Ad',
    visibility: true,
    status: 'Scheduled',
    gameId: '',
    sdkProvider: '',
    // Timer-based challenge configuration (Game type)
    playTimeMinutes: '',
    // Target audience (age / country / gender only)
    countriesInput: '',
    ageMin: '',
    ageMax: '',
    genders: [],
  })
  const [errors, setErrors] = useState({})
  const [gamesList, setGamesList] = useState([])
  const [loadingGames, setLoadingGames] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (challenge) {
      // Editing existing challenge
      let challengeDate = challenge.date || ''
      // If date is in ISO format, convert to YYYY-MM-DD for input
      if (challengeDate && challengeDate.includes('T')) {
        challengeDate = new Date(challengeDate).toISOString().split('T')[0]
      }
      // Convert Survey type to Spin if it exists (Survey is no longer supported)
      const challengeType =
        challenge.type === 'Survey' ? 'Spin' : challenge.type || 'Spin'

      setFormData({
        title: challenge.title || '',
        description:
          challenge.description !== undefined && challenge.description !== null
            ? challenge.description
            : challenge.title || '',
        type: challengeType,
        date: challengeDate,
        coinReward: challenge.coinReward?.toString() || '',
        xpReward: challenge.xpReward?.toString() || '',
        claimType: challenge.claimType || 'Watch Ad',
        visibility: challenge.visibility !== false,
        status: challenge.status || 'Scheduled',
        gameId: challenge.gameId || '',
        sdkProvider: challenge.sdkProvider || '',
        // Timer-based challenge: required play time (minutes)
        playTimeMinutes:
          challenge.playTimeMinutes !== undefined &&
          challenge.playTimeMinutes !== null
            ? String(challenge.playTimeMinutes)
            : challenge.requirements?.timeLimit !== undefined &&
                challenge.requirements?.timeLimit !== null
              ? String(challenge.requirements.timeLimit)
              : '',
        countriesInput: challenge.targetAudience?.countries?.[0] || '',
        ageMin:
          challenge.targetAudience?.ageRange?.min !== undefined
            ? String(challenge.targetAudience.ageRange.min)
            : '',
        ageMax:
          challenge.targetAudience?.ageRange?.max !== undefined
            ? String(challenge.targetAudience.ageRange.max)
            : '',
        genders: (challenge.targetAudience?.gender || []).map((g) => {
          const lower = String(g).toLowerCase()
          if (lower === 'male') return 'Male'
          if (lower === 'female') return 'Female'
          if (lower === 'other') return 'Other'
          return g
        }),
      })
    } else {
      // Creating new challenge - always set date if selectedDate is provided
      let dateString = ''
      if (selectedDate) {
        // Handle both Date object and string formats
        if (selectedDate instanceof Date) {
          dateString = selectedDate.toISOString().split('T')[0]
        } else if (typeof selectedDate === 'string') {
          // If it's already a date string, use it directly or convert if needed
          if (selectedDate.includes('T')) {
            dateString = new Date(selectedDate).toISOString().split('T')[0]
          } else {
            dateString = selectedDate
          }
        }
      }
      setFormData((prev) => ({
        ...prev,
        date: dateString || prev.date,
      }))
    }
  }, [challenge, selectedDate, isOpen])

  // Fetch games when SDK provider is selected and type is Game or SDK Game
  useEffect(() => {
    const fetchGamesBySDK = async () => {
      if (
        (formData.type === 'Game' || formData.type === 'SDK Game') &&
        formData.sdkProvider
      ) {
        setLoadingGames(true)
        try {
          const sdkName = formData.sdkProvider.toLowerCase()
          const response = await apiClient.get(
            `/admin/game-offers/games/by-sdk/${sdkName}`,
          )
          const result = response.data

          if (result.success && result.data) {
            setGamesList(
              result.data.map((game) => ({
                id: game._id || game.id,
                title: game.title || game.name,
                gameId: game.gameId || game._id || game.id,
              })),
            )
          } else {
            setGamesList([])
          }
        } catch (error) {
          console.error('Error fetching games:', error)
          setGamesList([])
        } finally {
          setLoadingGames(false)
        }
      } else {
        setGamesList([])
        if (formData.type !== 'Game' && formData.type !== 'SDK Game') {
          setFormData((prev) => ({ ...prev, gameId: '', sdkProvider: '' }))
        }
      }
    }

    fetchGamesBySDK()
  }, [formData.sdkProvider, formData.type])

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Challenge title is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.coinReward || parseInt(formData.coinReward) < 0) {
      newErrors.coinReward = 'Coin reward must be 0 or greater'
    }

    if (!formData.xpReward || parseInt(formData.xpReward) < 0) {
      newErrors.xpReward = 'XP reward must be 0 or greater'
    }

    // Validate game-specific requirements for Game/SDK Game types
    if (formData.type === 'Game' || formData.type === 'SDK Game') {
      if (!formData.sdkProvider) {
        newErrors.sdkProvider = 'SDK Provider is required for Game challenges'
      }
      if (!formData.gameId) {
        newErrors.gameId = 'Game is required for Game challenges'
      }
      // Timer-based game: require positive play time in minutes
      if (
        formData.type === 'Game' &&
        (formData.playTimeMinutes === '' ||
          Number.isNaN(Number(formData.playTimeMinutes)) ||
          Number(formData.playTimeMinutes) <= 0)
      ) {
        newErrors.playTimeMinutes =
          'Required play time (minutes) must be greater than 0'
      }
    }

    // Validate past dates
    const selectedDateObj = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDateObj < today && !challenge) {
      newErrors.date = 'Cannot create challenges for past dates'
    }

    // Validate segment conflict: check if a challenge with the same segment already exists for the selected date
    if (
      !challenge &&
      formData.date &&
      existingChallenges &&
      existingChallenges.length > 0
    ) {
      // Get the target audience for the new challenge
      const countries = formData.countriesInput
        ? [formData.countriesInput.trim().toUpperCase()]
        : []
      const ageMin =
        formData.ageMin !== '' && !Number.isNaN(Number(formData.ageMin))
          ? Number(formData.ageMin)
          : undefined
      const ageMax =
        formData.ageMax !== '' && !Number.isNaN(Number(formData.ageMax))
          ? Number(formData.ageMax)
          : undefined
      const genders =
        formData.genders && formData.genders.length > 0
          ? formData.genders
              .map((g) => {
                const lower = String(g).toLowerCase()
                if (lower === 'male') return 'male'
                if (lower === 'female') return 'female'
                if (lower === 'other') return 'other'
                return null
              })
              .filter((g) => g !== null)
          : []

      // Check for conflicts with existing challenges on the same date
      const conflictingChallenge = existingChallenges.find((existing) => {
        // Convert dates to YYYY-MM-DD format for comparison
        let existingDate = existing.date || existing.challengeDate || ''
        if (existingDate && existingDate.includes('T')) {
          existingDate = new Date(existingDate).toISOString().split('T')[0]
        }

        if (existingDate !== formData.date) {
          return false // Different dates, no conflict
        }

        // Same date - check if segments match
        const existingAudience = existing.targetAudience || {}
        const existingCountries = existingAudience.countries || []
        const existingAgeRange = existingAudience.ageRange || {}
        const existingGenders = existingAudience.gender || []

        // Check if country segment matches
        const countriesMatch =
          (countries.length === 0 && existingCountries.length === 0) ||
          (countries.length > 0 &&
            existingCountries.length > 0 &&
            countries[0] === existingCountries[0])

        // Check if age range segment matches
        const ageMin1 = ageMin !== undefined ? ageMin : null
        const ageMax1 = ageMax !== undefined ? ageMax : null
        const ageMin2 =
          existingAgeRange.min !== undefined ? existingAgeRange.min : null
        const ageMax2 =
          existingAgeRange.max !== undefined ? existingAgeRange.max : null

        const ageRangeMatches =
          (ageMin1 === null &&
            ageMax1 === null &&
            ageMin2 === null &&
            ageMax2 === null) ||
          (ageMin1 === ageMin2 && ageMax1 === ageMax2)

        // Check if gender segment matches
        const gendersMatch =
          (genders.length === 0 && existingGenders.length === 0) ||
          (genders.length > 0 &&
            existingGenders.length > 0 &&
            genders.length === existingGenders.length &&
            genders.every((g) => existingGenders.includes(g)))

        // Return true if any segment dimension matches (same segment)
        return countriesMatch || ageRangeMatches || gendersMatch
      })

      if (conflictingChallenge) {
        const segmentDesc = []
        if (formData.countriesInput) {
          segmentDesc.push(`country: ${formData.countriesInput}`)
        }
        if (formData.ageMin || formData.ageMax) {
          const minAge = formData.ageMin || 'any'
          const maxAge = formData.ageMax || 'any'
          segmentDesc.push(`age: ${minAge}-${maxAge}`)
        }
        if (formData.genders.length > 0) {
          segmentDesc.push(`gender: ${formData.genders.join(', ')}`)
        }

        const segmentText =
          segmentDesc.length > 0
            ? ` (${segmentDesc.join(', ')})`
            : ' (same segment)'

        newErrors.date = `A challenge with the same segment${segmentText} already exists on this date. Please adjust the target audience or select a different date.`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const countries = formData.countriesInput
      ? [formData.countriesInput.trim().toUpperCase()]
      : []

    const ageMin =
      formData.ageMin !== '' && !Number.isNaN(Number(formData.ageMin))
        ? Number(formData.ageMin)
        : undefined
    const ageMax =
      formData.ageMax !== '' && !Number.isNaN(Number(formData.ageMax))
        ? Number(formData.ageMax)
        : undefined

    const mapGenderToApi = (label) => {
      const lower = String(label).toLowerCase()
      if (lower === 'male') return 'male'
      if (lower === 'female') return 'female'
      if (lower === 'other') return 'other'
      return null
    }

    const genders =
      formData.genders && formData.genders.length > 0
        ? Array.from(
            new Set(
              formData.genders
                .map((g) => mapGenderToApi(g))
                .filter((g) => g !== null),
            ),
          )
        : []

    const targetAudience = {
      ...(countries.length > 0 && { countries }),
      ...(ageMin !== undefined || ageMax !== undefined
        ? {
            ageRange: {
              ...(ageMin !== undefined && { min: ageMin }),
              ...(ageMax !== undefined && { max: ageMax }),
            },
          }
        : {}),
      ...(genders.length > 0 && { gender: genders }),
    }

    const challengeData = {
      title: formData.title.trim(),
      // Always include description - use trimmed value if provided, otherwise fallback to title
      description: formData.description.trim() || formData.title.trim(),
      type: formData.type,
      date: formData.date,
      coinReward: parseInt(formData.coinReward) || 0,
      xpReward: parseInt(formData.xpReward) || 0,
      claimType: formData.claimType,
      visibility: formData.visibility,
      status: formData.status || 'Scheduled',
      ...(formData.gameId && { gameId: formData.gameId }),
      ...(formData.sdkProvider && { sdkProvider: formData.sdkProvider }),
      // Timer-based game configuration: required play time in minutes
      ...(formData.type === 'Game' &&
        formData.playTimeMinutes &&
        !Number.isNaN(Number(formData.playTimeMinutes)) &&
        Number(formData.playTimeMinutes) > 0 && {
          playTimeMinutes: Number(formData.playTimeMinutes),
        }),
      targetAudience,
    }

    try {
      await onSave(challengeData)

      // Reset form after successful save
      let resetDate = ''
      if (selectedDate) {
        if (selectedDate instanceof Date) {
          resetDate = selectedDate.toISOString().split('T')[0]
        } else if (typeof selectedDate === 'string') {
          if (selectedDate.includes('T')) {
            resetDate = new Date(selectedDate).toISOString().split('T')[0]
          } else {
            resetDate = selectedDate
          }
        }
      }

      setFormData({
        title: '',
        description: '',
        type: 'Spin',
        date: resetDate,
        coinReward: '',
        xpReward: '',
        claimType: 'Watch Ad',
        visibility: true,
        status: 'Scheduled',
        gameId: '',
        sdkProvider: '',
        playTimeMinutes: '',
        countriesInput: '',
        ageMin: '',
        ageMax: '',
        genders: [],
      })
      setErrors({})
      setGamesList([])
    } catch (error) {
      console.error('Error saving challenge:', error)

      // Try to surface specific backend message about duplicate daily challenge
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        (typeof error === 'string' ? error : null)

      if (
        backendMessage &&
        backendMessage.toLowerCase().includes('daily challenge already exists')
      ) {
        setErrors((prev) => ({
          ...prev,
          date: 'A daily challenge already exists for the selected date',
        }))
      }
    }
  }

  const handleClose = () => {
    // Reset form data
    let resetDate = ''
    if (selectedDate) {
      // Preserve selectedDate when closing if it exists
      if (selectedDate instanceof Date) {
        resetDate = selectedDate.toISOString().split('T')[0]
      } else if (typeof selectedDate === 'string') {
        if (selectedDate.includes('T')) {
          resetDate = new Date(selectedDate).toISOString().split('T')[0]
        } else {
          resetDate = selectedDate
        }
      }
    }
    setFormData({
      title: '',
      description: '',
      type: 'Spin',
      date: resetDate,
      coinReward: '',
      xpReward: '',
      claimType: 'Watch Ad',
      visibility: true,
      status: 'Scheduled',
      gameId: '',
      sdkProvider: '',
      playTimeMinutes: '',
      countriesInput: '',
      ageMin: '',
      ageMax: '',
      genders: [],
    })
    setErrors({})
    setGamesList([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>
            {challenge ? 'Edit Challenge' : 'Add New Challenge'}
          </h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Challenge Title *
              </label>
              <input
                type='text'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='e.g., Play Puzzle Game Challenge'
              />
              {errors.title && (
                <p className='mt-1 text-sm text-red-600'>{errors.title}</p>
              )}
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='e.g., Complete a puzzle game to earn rewards'
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.description}
                </p>
              )}
              <p className='mt-1 text-xs text-gray-500'>
                If left empty, the title will be used as description
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Challenge Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value
                  setFormData({
                    ...formData,
                    type: newType,
                    // Clear game fields if not Game or SDK Game
                    ...(newType !== 'Game' &&
                      newType !== 'SDK Game' && {
                        gameId: '',
                        sdkProvider: '',
                      }),
                  })
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
              >
                {CHALLENGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Date *
              </label>
              <div className='relative'>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <CalendarIcon className='absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none' />
              </div>
              {errors.date && (
                <p className='mt-1 text-sm text-red-600'>{errors.date}</p>
              )}
            </div>
          </div>

          {/* Target Audience / Segmentation (age / country / gender) */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900'>
              Target Audience (optional)
            </h3>
            <p className='text-xs text-gray-500'>
              Configure which users should see this challenge by country, age,
              or gender. Leave all fields blank to target all users.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Countries (optional)
                </label>
                <select
                  value={formData.countriesInput}
                  onChange={(e) =>
                    setFormData({ ...formData, countriesInput: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
                >
                  <option value=''>Select a country (optional)</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <p className='mt-1 text-xs text-gray-500'>
                  Select a country to target specific users. Leave blank for all
                  countries.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Min Age
                </label>
                <input
                  type='number'
                  min='0'
                  value={formData.ageMin}
                  onChange={(e) =>
                    setFormData({ ...formData, ageMin: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
                  placeholder='e.g., 18'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Max Age
                </label>
                <input
                  type='number'
                  min='0'
                  value={formData.ageMax}
                  onChange={(e) =>
                    setFormData({ ...formData, ageMax: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
                  placeholder='e.g., 65'
                />
              </div>
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Gender
                  </label>
                  {formData.genders.length > 0 && (
                    <button
                      type='button'
                      onClick={() => setFormData({ ...formData, genders: [] })}
                      className='text-xs text-emerald-600 hover:text-emerald-700 font-medium'
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  multiple
                  value={formData.genders}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map(
                      (o) => o.value,
                    )
                    setFormData({ ...formData, genders: options })
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 h-24'
                >
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
                <p className='mt-1 text-xs text-gray-500'>
                  Hold Ctrl/Cmd to select multiple. Leave empty to include all
                  genders.
                </p>
              </div>
            </div>
          </div>

          {/* Game and SDK Provider Fields (only for Game and SDK Game types) */}
          {(formData.type === 'Game' || formData.type === 'SDK Game') && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  SDK Provider *
                </label>
                <select
                  value={formData.sdkProvider}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      sdkProvider: e.target.value,
                      gameId: '', // Clear game when SDK changes
                    })
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
                  required={
                    formData.type === 'Game' || formData.type === 'SDK Game'
                  }
                >
                  <option value=''>Select SDK Provider</option>
                  {sdkProviders.map((sdk) => (
                    <option key={sdk.id || sdk.name} value={sdk.id || sdk.name}>
                      {sdk.name || sdk.id}
                    </option>
                  ))}
                </select>
                {errors.sdkProvider && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.sdkProvider}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Game *
                </label>
                <select
                  value={formData.gameId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      gameId: e.target.value,
                    })
                  }}
                  disabled={!formData.sdkProvider || loadingGames}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                  required={
                    formData.type === 'Game' || formData.type === 'SDK Game'
                  }
                >
                  <option value=''>
                    {loadingGames
                      ? 'Loading games...'
                      : formData.sdkProvider
                        ? 'Select Game'
                        : 'Select SDK Provider first'}
                  </option>
                  {gamesList.map((game) => (
                    <option key={game.id} value={game.gameId || game.id}>
                      {game.title || game.name}
                    </option>
                  ))}
                </select>
                {errors.gameId && (
                  <p className='mt-1 text-sm text-red-600'>{errors.gameId}</p>
                )}
              </div>
            </div>
          )}

          {/* Game Timer-Based Configuration (only for Game type) */}
          {formData.type === 'Game' && (
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-gray-900'>
                Game Challenge Type
              </h3>
              <p className='text-xs text-gray-500'>
                This daily challenge uses a{' '}
                <span className='font-semibold'>Timer-Based Challenge</span>.
                Users must play the selected game for the required minutes to
                earn the reward.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-end'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Challenge Mechanic
                  </label>
                  <input
                    type='text'
                    value='Timer-Based Challenge'
                    readOnly
                    className='w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Required Play Time (minutes) *
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={formData.playTimeMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        playTimeMinutes: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.playTimeMinutes
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder='e.g., 15'
                  />
                  {errors.playTimeMinutes && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.playTimeMinutes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Coin Reward *
              </label>
              <input
                type='number'
                min='0'
                value={formData.coinReward}
                onChange={(e) =>
                  setFormData({ ...formData, coinReward: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.coinReward ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='100'
              />
              {errors.coinReward && (
                <p className='mt-1 text-sm text-red-600'>{errors.coinReward}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                XP Reward *
              </label>
              <input
                type='number'
                min='0'
                value={formData.xpReward}
                onChange={(e) =>
                  setFormData({ ...formData, xpReward: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.xpReward ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='50'
              />
              {errors.xpReward && (
                <p className='mt-1 text-sm text-red-600'>{errors.xpReward}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Claim Type *
              </label>
              <select
                value={formData.claimType}
                onChange={(e) =>
                  setFormData({ ...formData, claimType: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
              >
                {CLAIM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
              >
                <option value='Scheduled'>Scheduled</option>
                <option value='Live'>Live</option>
                <option value='Expired'>Expired</option>
              </select>
            </div>
          </div>

          {/* Visibility */}
          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              id='visibility'
              checked={formData.visibility}
              onChange={(e) =>
                setFormData({ ...formData, visibility: e.target.checked })
              }
              className='h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded'
            />
            <label
              htmlFor='visibility'
              className='text-sm font-medium text-gray-700'
            >
              Visible to users
            </label>
            <p className='text-xs text-gray-500'>
              Uncheck to hide this challenge from users while keeping it in the
              system
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end space-x-3 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={handleClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading
                ? 'Saving...'
                : challenge
                  ? 'Update Challenge'
                  : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
