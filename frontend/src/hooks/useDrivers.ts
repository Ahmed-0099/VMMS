import { useCallback, useEffect, useState } from 'react'
import { getDrivers } from '../services/driverService'
import type { Driver, DriverFilters } from '../types/driver'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const defaultDriverFilters: DriverFilters = {
  search: '',
  status: '',
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filters, setFilters] = useState<DriverFilters>(defaultDriverFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDrivers = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const driverList = await getDrivers(nextFilters)
      setDrivers(driverList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load drivers. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredDrivers() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const driverList = await getDrivers(filters)

        if (isMounted) {
          setDrivers(driverList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load drivers. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredDrivers()

    return () => {
      isMounted = false
    }
  }, [filters])

  return {
    drivers,
    error,
    filters,
    isLoading,
    reload: loadDrivers,
    setFilters,
  }
}
