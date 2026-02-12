'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

// Only expose supported challenge types in the calendar filters
const CHALLENGE_TYPES = ['Spin', 'Game']
const CLAIM_TYPES = ['Watch Ad', 'Auto']
const STATUS_TYPES = ['Scheduled', 'Live', 'Expired']
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+']

// Keep status handling consistent with the List View:
// - If a valid explicit status is set, respect it
// - Otherwise, derive status from the date
const getActualStatus = (status, date) => {
  if (STATUS_TYPES.includes(status)) {
    return status
  }

  const today = new Date()
  const challengeDate = new Date(date)

  if (Number.isNaN(challengeDate.getTime())) {
    return status || 'Pending'
  }

  if (challengeDate.toDateString() === today.toDateString()) {
    return 'Live'
  }
  if (challengeDate > today) {
    return 'Scheduled'
  }
  if (challengeDate < today) {
    return 'Expired'
  }

  return status || 'Pending'
}

export default function DailyChallengeCalendarView({
  challenges = [],
  onAddChallenge,
  onUpdateChallenge,
  onDeleteChallenge,
  selectedDate,
  onDateSelect,
  loading = false,
}) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [viewMode, setViewMode] = useState('month') // month, week, day
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [selectedDateChallenges, setSelectedDateChallenges] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [countryFilter, setCountryFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')

  const today = new Date()

  // Get unique countries and genders from challenges for filter options
  const filterOptions = useMemo(() => {
    const countries = new Set()
    const genders = new Set()

    challenges.forEach((challenge) => {
      const audience = challenge.targetAudience || {}

      // Collect countries
      if (Array.isArray(audience.countries) && audience.countries.length > 0) {
        audience.countries.forEach((country) => countries.add(country))
      }

      // Collect genders
      if (Array.isArray(audience.gender) && audience.gender.length > 0) {
        audience.gender.forEach((g) => genders.add(g))
      }
    })

    return {
      countries: Array.from(countries).sort(),
      genders: Array.from(genders).sort(),
    }
  }, [challenges])

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)

      // Create date string in YYYY-MM-DD format using local date components
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const dayStr = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${dayStr}`

      // Match challenges by date - handle both ISO string and Date object formats
      const dayChallenges = challenges.filter((challenge) => {
        if (!challenge.date) return false

        // Normalize the challenge date to YYYY-MM-DD format
        const challengeDateString =
          typeof challenge.date === 'string'
            ? challenge.date.split('T')[0]
            : new Date(challenge.date).toISOString().split('T')[0]

        return challengeDateString === dateString
      })

      days.push({
        date,
        day,
        challenges: dayChallenges,
        isToday: date.toDateString() === today.toDateString(),
        isSelected:
          selectedDate && date.toDateString() === selectedDate.toDateString(),
      })
    }

    return days
  }, [
    currentYear,
    currentMonth,
    daysInMonth,
    startingDayOfWeek,
    challenges,
    selectedDate,
    today,
  ])

  // Common predicate used by all views (month / week / day)
  const challengeMatchesFilters = useCallback(
    (challenge) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.type.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filter
      const matchesType = typeFilter === 'all' || challenge.type === typeFilter

      // Status filter (using computed status)
      const actualStatus = getActualStatus(challenge.status, challenge.date)
      const matchesStatus =
        statusFilter === 'all' || actualStatus === statusFilter

      // Country filter
      const matchesCountry = (() => {
        if (countryFilter === 'all') return true
        const audience = challenge.targetAudience || {}
        const countries = Array.isArray(audience.countries)
          ? audience.countries
          : []
        // Only match if the challenge explicitly has the selected country
        return countries.length > 0 && countries.includes(countryFilter)
      })()

      // Age filter - match challenges that overlap with the selected age range
      const matchesAge = (() => {
        if (ageFilter === 'all') return true
        const audience = challenge.targetAudience || {}
        const challengeAgeRange = audience.ageRange || { min: 13, max: 100 }
        const challengeMin = challengeAgeRange.min || 13
        const challengeMax = challengeAgeRange.max || 100

        // Parse the selected age range
        if (ageFilter === '55+') {
          // For 55+, match if challenge max is >= 55 or challenge has no max (defaults to 100)
          return challengeMax >= 55 || !challengeAgeRange.max
        } else {
          const [filterMin, filterMax] = ageFilter.split('-').map(Number)
          // Check if ranges overlap: challenge range overlaps filter range if
          // challengeMin <= filterMax AND challengeMax >= filterMin
          return challengeMin <= filterMax && challengeMax >= filterMin
        }
      })()

      // Gender filter
      const matchesGender = (() => {
        if (genderFilter === 'all') return true
        const audience = challenge.targetAudience || {}
        const genders = Array.isArray(audience.gender) ? audience.gender : []
        // Only match if the challenge explicitly has the selected gender
        return genders.length > 0 && genders.includes(genderFilter)
      })()

      // Date range filter (only applied in month view; week/day views control the visible range)
      let matchesDateRange = true
      if (viewMode === 'month' && dateRangeFilter !== 'all') {
        if (!challenge.date) {
          matchesDateRange = false
        } else {
          const challengeDate = new Date(challenge.date)
          challengeDate.setHours(0, 0, 0, 0)

          const baseToday = new Date()
          baseToday.setHours(0, 0, 0, 0)

          const startOfThisWeek = new Date(baseToday)
          startOfThisWeek.setDate(baseToday.getDate() - baseToday.getDay())
          const endOfThisWeek = new Date(startOfThisWeek)
          endOfThisWeek.setDate(startOfThisWeek.getDate() + 6)

          switch (dateRangeFilter) {
            case 'today': {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const tomorrow = new Date(today)
              tomorrow.setDate(today.getDate() + 1)
              tomorrow.setHours(0, 0, 0, 0)
              matchesDateRange = challengeDate >= today && challengeDate < tomorrow
              break
            }
            case 'this-week': {
              matchesDateRange =
                challengeDate >= startOfThisWeek &&
                challengeDate <= endOfThisWeek
              break
            }
            case 'past-week': {
              const startOfPastWeek = new Date(startOfThisWeek)
              startOfPastWeek.setDate(startOfPastWeek.getDate() - 7)
              const endOfPastWeek = new Date(startOfPastWeek)
              endOfPastWeek.setDate(startOfPastWeek.getDate() + 6)
              matchesDateRange =
                challengeDate >= startOfPastWeek &&
                challengeDate <= endOfPastWeek
              break
            }
            case 'this-month': {
              matchesDateRange =
                challengeDate.getMonth() === baseToday.getMonth() &&
                challengeDate.getFullYear() === baseToday.getFullYear()
              break
            }
            case 'next-month': {
              const nextMonth = new Date(baseToday)
              nextMonth.setMonth(nextMonth.getMonth() + 1)
              matchesDateRange =
                challengeDate.getMonth() === nextMonth.getMonth() &&
                challengeDate.getFullYear() === nextMonth.getFullYear()
              break
            }
            case 'custom': {
              if (customStartDate && customEndDate) {
                const [startYear, startMonth, startDay] = customStartDate
                  .split('-')
                  .map(Number)
                const [endYear, endMonth, endDay] = customEndDate
                  .split('-')
                  .map(Number)

                const startDate = new Date(
                  startYear,
                  startMonth - 1,
                  startDay,
                  0,
                  0,
                  0,
                  0,
                )
                const endDate = new Date(
                  endYear,
                  endMonth - 1,
                  endDay,
                  23,
                  59,
                  59,
                  999,
                )

                matchesDateRange =
                  challengeDate >= startDate && challengeDate <= endDate
              } else {
                matchesDateRange = true
              }
              break
            }
            default:
              matchesDateRange = true
          }
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDateRange &&
        matchesCountry &&
        matchesAge &&
        matchesGender
      )
    },
    [
      searchTerm,
      typeFilter,
      statusFilter,
      dateRangeFilter,
      customStartDate,
      customEndDate,
      viewMode,
      countryFilter,
      ageFilter,
      genderFilter,
    ],
  )

  // Filter challenges for search / filters in MONTH view
  const filteredCalendarDays = useMemo(() => {
    if (
      !searchTerm &&
      typeFilter === 'all' &&
      statusFilter === 'all' &&
      dateRangeFilter === 'all' &&
      countryFilter === 'all' &&
      ageFilter === 'all' &&
      genderFilter === 'all'
    ) {
      return calendarDays
    }

    return calendarDays.map((day) => {
      if (!day) return day

      const filteredChallenges = day.challenges.filter(challengeMatchesFilters)

      return {
        ...day,
        challenges: filteredChallenges,
      }
    })
  }, [
    calendarDays,
    searchTerm,
    typeFilter,
    statusFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
    countryFilter,
    ageFilter,
    genderFilter,
    challengeMatchesFilters,
  ])

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    
    // Find today's challenges
    const todayDateString = today.toISOString().split('T')[0]
    const todayChallenges = challenges.filter((challenge) => {
      if (!challenge.date) return false
      const challengeDateString =
        typeof challenge.date === 'string'
          ? challenge.date.split('T')[0]
          : new Date(challenge.date).toISOString().split('T')[0]
      return challengeDateString === todayDateString
    })
    
    // Perform the same actions as clicking on a day
    onDateSelect?.(today)
    setSelectedDateChallenges(todayChallenges)
    
    // If there are no challenges for today, open add modal
    if (todayChallenges.length === 0) {
      onAddChallenge()
    }
  }

  const handleDateClick = (dayData) => {
    if (!dayData) return

    onDateSelect?.(dayData.date)
    setSelectedDateChallenges(dayData.challenges)

    // If there are no challenges for this date, open add modal
    if (dayData.challenges.length === 0) {
      onAddChallenge()
    }
  }

  const handleChallengeClick = (challenge, event) => {
    event.stopPropagation() // Prevent day click event
    onUpdateChallenge(challenge)
  }

  // Generate week view days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)

      // Create date string using local date components to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const dayStr = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${dayStr}`

      const dayChallenges = challenges
        .filter((challenge) => {
          if (!challenge.date) return false
          const challengeDateString =
            typeof challenge.date === 'string'
              ? challenge.date.split('T')[0]
              : new Date(challenge.date).toISOString().split('T')[0]
          return challengeDateString === dateString
        })
        .filter(challengeMatchesFilters)

      days.push({
        date,
        day: date.getDate(),
        challenges: dayChallenges,
        isToday: date.toDateString() === today.toDateString(),
        isSelected:
          selectedDate && date.toDateString() === selectedDate.toDateString(),
      })
    }
    return days
  }

  // Generate single day view
  const getDayView = () => {
    // Create date string using local date components to avoid timezone issues
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(currentDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${dayStr}`

    const dayChallenges = challenges
      .filter((challenge) => {
        if (!challenge.date) return false
        const challengeDateString =
          typeof challenge.date === 'string'
            ? challenge.date.split('T')[0]
            : new Date(challenge.date).toISOString().split('T')[0]
        return challengeDateString === dateString
      })
      .filter(challengeMatchesFilters)

    return {
      date: currentDate,
      day: currentDate.getDate(),
      challenges: dayChallenges,
      isToday: currentDate.toDateString() === today.toDateString(),
      isSelected:
        selectedDate &&
        currentDate.toDateString() === selectedDate.toDateString(),
    }
  }

  const getStatusColor = (status) => {
    const statusColors = {
      Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      Live: 'bg-green-100 text-green-800 border-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Expired: 'bg-gray-100 text-gray-800 border-gray-200',
      Completed: 'bg-slate-50 text-slate-700 border-slate-300',
    }

    return statusColors[status] || statusColors.Pending
  }

  // Render functions for different view modes
  const renderMonthView = () => (
    <>
      {/* Day Headers */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {dayNames.map((day) => (
          <div
            key={day}
            className='p-2 text-center text-sm font-medium text-gray-500'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className='grid grid-cols-7 gap-1'>
        {filteredCalendarDays.map((dayData, index) => (
          <div
            key={index}
            className={`min-h-[120px] border border-gray-200 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
              !dayData
                ? 'bg-gray-50 cursor-default'
                : dayData.isFilteredOut
                  ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                  : dayData.isToday
                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    : dayData.isSelected
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => {
              if (!dayData?.isFilteredOut) {
                handleDateClick(dayData)
              }
            }}
          >
            {dayData && renderDayContent(dayData)}
          </div>
        ))}
      </div>
    </>
  )

  const renderWeekView = () => {
    const weekDays = getWeekDays()

    return (
      <>
        {/* Week Headers */}
        <div className='grid grid-cols-7 gap-1 mb-2'>
          {dayNames.map((day) => (
            <div
              key={day}
              className='p-2 text-center text-sm font-medium text-gray-500'
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week Days */}
        <div className='grid grid-cols-7 gap-1'>
          {weekDays.map((dayData, index) => (
            <div
              key={index}
              className={`min-h-[200px] border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                dayData.isToday
                  ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : dayData.isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleDateClick(dayData)}
            >
              {renderDayContent(dayData)}
            </div>
          ))}
        </div>
      </>
    )
  }

  const renderDayView = () => {
    const dayData = getDayView()

    return (
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {dayData.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {dayData.isToday && (
                <span className='text-sm text-emerald-600 font-medium'>
                  Today
                </span>
              )}
            </div>
            <div className='text-sm text-gray-500'>
              {dayData.challenges.length} challenge
              {dayData.challenges.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Day Challenges */}
          <div className='space-y-3'>
            {dayData.challenges.length === 0 ? (
              <div className='text-center py-12 text-gray-500'>
                <CalendarDaysIcon className='h-12 w-12 mx-auto mb-3 text-gray-300' />
                <p>No challenges scheduled for this day</p>
                <button
                  onClick={() => onAddChallenge()}
                  className='mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium'
                >
                  Add Challenge
                </button>
              </div>
            ) : (
              dayData.challenges.map((challenge, idx) => (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all duration-200 ${getStatusColor(
                    challenge.status,
                  )}`}
                  onClick={() =>
                    handleChallengeClick(challenge, {
                      stopPropagation: () => {},
                    })
                  }
                  title={`Click to edit ${challenge.title}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900'>
                        {challenge.title}
                      </h4>
                      <p className='text-sm text-gray-600 mt-1'>
                        {challenge.type}
                      </p>
                    </div>
                    <div className='flex items-center space-x-4 text-sm'>
                      <div className='flex items-center'>
                        <span className='mr-1'>🪙</span>
                        <span>{challenge.coinReward}</span>
                      </div>
                      <div className='flex items-center'>
                        <span className='mr-1'>⭐</span>
                        <span>{challenge.xpReward}</span>
                      </div>
                      <span className='text-xs text-gray-500'>
                        {challenge.claimType}
                      </span>
                      {!challenge.visibility && (
                        <EyeSlashIcon className='h-4 w-4 text-gray-400' />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderDayContent = (dayData) => (
    <>
      {/* Day Number */}
      <div
        className={`text-sm font-medium mb-2 ${
          dayData.isToday
            ? 'text-emerald-600'
            : dayData.isSelected
              ? 'text-blue-600'
              : 'text-gray-900'
        }`}
      >
        {dayData.day}
        {dayData.isToday && (
          <span className='ml-1 text-xs text-emerald-600'>(Today)</span>
        )}
      </div>

      {/* Challenge Cards */}
      <div className='space-y-1'>
        {dayData.challenges.slice(0, 3).map((challenge, idx) => (
          <div
            key={challenge.id}
            className={`px-2 py-1 rounded text-xs border cursor-pointer hover:shadow-sm transition-all duration-200 ${getStatusColor(
              challenge.status,
            )}`}
            title={`${challenge.title} - ${challenge.type} (${challenge.claimType}) - Click to edit`}
            onClick={(e) => handleChallengeClick(challenge, e)}
          >
            <div className='flex items-center justify-between'>
              <div className='truncate flex-1'>
                <span className='font-medium'>{challenge.title}</span>
              </div>
              {challenge.segmentLabel && (
                <span className='ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-white/70 text-gray-600 border border-gray-200 max-w-[80px] truncate'>
                  {challenge.segmentLabel}
                </span>
              )}
              {!challenge.visibility && (
                <EyeSlashIcon className='h-3 w-3 text-gray-400 ml-1 flex-shrink-0' />
              )}
            </div>
            <div className='flex items-center space-x-2 mt-1'>
              <span className='text-xs text-gray-600'>{challenge.type}</span>
              <div className='flex items-center space-x-1'>
                <span>🪙{challenge.coinReward}</span>
                <span>⭐{challenge.xpReward}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Show more indicator */}
        {dayData.challenges.length > 3 && (
          <div className='px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded text-center'>
            +{dayData.challenges.length - 3} more
          </div>
        )}

        {/* Add challenge button for empty days */}
        {dayData.challenges.length === 0 && (
          <div className='flex items-center justify-center h-16 text-gray-400 hover:text-gray-600'>
            <div className='text-center'>
              <PlusIcon className='h-6 w-6 mx-auto mb-1' />
              <span className='text-xs'>Add Challenge</span>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className='space-y-6'>
      {/* Header with Navigation */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Daily Challenge Calendar (Calendar View)
              </h2>
              <p className='mt-1 text-sm text-gray-600'>
                Visual calendar view for managing daily challenges
              </p>
            </div>

            {/* Calendar Navigation */}
            <div className='flex items-center space-x-4'>
              {/* <button
                onClick={goToToday}
                className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
              >
                Today
              </button> */}

              {/* View Mode Controls */}
              <div className='flex items-center space-x-1 bg-gray-100 p-1 rounded-lg'>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'day'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'week'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'month'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Month
                </button>
              </div>

              <div className='flex items-center space-x-1'>
                <button
                  onClick={goToPreviousMonth}
                  className='p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md'
                >
                  <ChevronLeftIcon className='h-5 w-5' />
                </button>

                <h3 className='text-lg font-semibold text-gray-900 min-w-[200px] text-center'>
                  {monthNames[currentMonth]} {currentYear}
                </h3>

                <button
                  onClick={goToNextMonth}
                  className='p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md'
                >
                  <ChevronRightIcon className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
            {/* Search */}
            <div className='flex-1 max-w-lg'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search challenges...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500'
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => {
                    const value = e.target.value
                    setDateRangeFilter(value)

                    // When "Today" is selected, switch to Day view and set current date to today
                    if (value === 'today') {
                      const today = new Date()
                      setViewMode('day')
                      setCurrentDate(today)
                      
                      // Also trigger date selection to match Day button behavior
                      onDateSelect?.(today)
                      
                      // Find today's challenges and set them as selected
                      const todayDateString = today.toISOString().split('T')[0]
                      const todayChallenges = challenges.filter((challenge) => {
                        if (!challenge.date) return false
                        const challengeDateString =
                          typeof challenge.date === 'string'
                            ? challenge.date.split('T')[0]
                            : new Date(challenge.date).toISOString().split('T')[0]
                        return challengeDateString === todayDateString
                      })
                      setSelectedDateChallenges(todayChallenges)
                    }

                    // When in week view, move the visible week for quick navigation
                    if (viewMode === 'week') {
                      const todayForWeek = new Date()
                      todayForWeek.setHours(0, 0, 0, 0)
                      const startOfThisWeek = new Date(todayForWeek)
                      startOfThisWeek.setDate(
                        todayForWeek.getDate() - todayForWeek.getDay(),
                      )

                      if (value === 'this-week') {
                        setCurrentDate(todayForWeek)
                      } else if (value === 'past-week') {
                        const startOfPastWeek = new Date(startOfThisWeek)
                        startOfPastWeek.setDate(startOfPastWeek.getDate() - 7)
                        setCurrentDate(startOfPastWeek)
                      }
                    }

                    // Reset custom dates when switching away from custom
                    if (value !== 'custom') {
                      setCustomStartDate('')
                      setCustomEndDate('')
                    }
                    
                    // Reset selected date challenges when switching away from today
                    if (value !== 'today') {
                      setSelectedDateChallenges([])
                    }
                  }}
                  className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
                >
                  <option value='all'>All Dates</option>
                  <option value='today'>Today</option>
                  <option value='this-week'>This Week</option>
                  <option value='this-month'>This Month</option>
                  <option value='next-month'>Next Month</option>
                  <option value='past-week'>Past Week</option>
                  <option value='custom'>Custom Range</option>
                </select>
                {dateRangeFilter === 'custom' && (
                  <div className='flex items-center space-x-2'>
                    <div className='flex items-center space-x-1'>
                      <label className='text-sm text-gray-600'>From:</label>
                      <input
                        type='date'
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
                      />
                    </div>
                    <div className='flex items-center space-x-1'>
                      <label className='text-sm text-gray-600'>To:</label>
                      <input
                        type='date'
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={customStartDate || undefined}
                        className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
                      />
                    </div>
                  </div>
                )}
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
              >
                <option value='all'>All Types</option>
                {CHALLENGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
              >
                <option value='all'>All Status</option>
                <option value='Scheduled'>Scheduled</option>
                <option value='Live'>Live</option>
                <option value='Expired'>Expired</option>
              </select>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
              >
                <option value='all'>All Countries</option>
                {filterOptions.countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
              >
                <option value='all'>All Ages</option>
                {AGE_RANGES.map((ageRange) => (
                  <option key={ageRange} value={ageRange}>
                    {ageRange}
                  </option>
                ))}
              </select>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500'
              >
                <option value='all'>All Genders</option>
                {filterOptions.genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        <div className='p-6'>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Calendar Pagination */}
        {viewMode !== 'day' && (
          <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                {viewMode === 'month'
                  ? `${
                      monthNames[currentDate.getMonth()]
                    } ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}`}
              </div>

              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => {
                    if (viewMode === 'month') {
                      setCurrentDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth() - 1,
                          1,
                        ),
                      )
                    } else {
                      const newDate = new Date(currentDate)
                      newDate.setDate(currentDate.getDate() - 7)
                      setCurrentDate(newDate)
                    }
                    setCurrentPage(currentPage - 1)
                  }}
                  className='px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                >
                  Previous
                </button>

                <span className='px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded'>
                  Page {currentPage}
                </span>

                <button
                  onClick={() => {
                    if (viewMode === 'month') {
                      setCurrentDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth() + 1,
                          1,
                        ),
                      )
                    } else {
                      const newDate = new Date(currentDate)
                      newDate.setDate(currentDate.getDate() + 7)
                      setCurrentDate(newDate)
                    }
                    setCurrentPage(currentPage + 1)
                  }}
                  className='px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center space-x-6'>
              <span className='text-gray-600'>Status Legend:</span>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-blue-100 border border-blue-200 rounded'></div>
                  <span className='text-gray-600'>Scheduled</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-green-100 border border-green-200 rounded'></div>
                  <span className='text-gray-600'>Live</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-slate-50 border border-slate-300 rounded'></div>
                  <span className='text-slate-700'>Expired</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-gray-100 border border-gray-200 rounded'></div>
                  <span className='text-gray-600'>Completed</span>
                </div>
              </div>
            </div>

            {/* <div className='flex items-center space-x-2 text-gray-600'>
              <EyeSlashIcon className='h-4 w-4' />
              <span>Hidden from users</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* TODO: Add challenge modal for adding/editing challenges */}
    </div>
  )
}
