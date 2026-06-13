import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMaintenanceSchedules } from '../services/maintenanceScheduleService'
import {
  defaultMaintenanceScheduleFilters,
  type MaintenanceSchedule,
  type MaintenanceScheduleFilters,
} from '../types/maintenanceSchedule'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function useMaintenanceSchedules() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [filters, setFilters] = useState<MaintenanceScheduleFilters>(defaultMaintenanceScheduleFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSchedules = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const scheduleList = await getMaintenanceSchedules(nextFilters)
      setSchedules(scheduleList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load maintenance schedules. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredSchedules() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const scheduleList = await getMaintenanceSchedules(filters)

        if (isMounted) {
          setSchedules(scheduleList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load maintenance schedules. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredSchedules()

    return () => {
      isMounted = false
    }
  }, [filters])

  const summary = useMemo(() => {
    return schedules.reduce(
      (counts, schedule) => {
        if (schedule.status === 'ACTIVE') {
          counts.active += 1
        }

        if (schedule.status === 'DUE') {
          counts.due += 1
        }

        if (schedule.status === 'COMPLETED') {
          counts.completed += 1
        }

        if (schedule.status === 'CANCELLED') {
          counts.cancelled += 1
        }

        counts.total += 1
        return counts
      },
      {
        active: 0,
        cancelled: 0,
        completed: 0,
        due: 0,
        total: 0,
      },
    )
  }, [schedules])

  return {
    error,
    filters,
    isLoading,
    reload: loadSchedules,
    schedules,
    setFilters,
    summary,
  }
}
