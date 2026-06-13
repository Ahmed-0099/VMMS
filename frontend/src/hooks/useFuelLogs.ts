import { useCallback, useEffect, useMemo, useState } from 'react'
import { getFuelLogs } from '../services/fuelLogService'
import { defaultFuelLogFilters, type FuelLog, type FuelLogFilters } from '../types/fuelLog'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function useFuelLogs() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [filters, setFilters] = useState<FuelLogFilters>(defaultFuelLogFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFuelLogs = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const fuelLogList = await getFuelLogs(nextFilters)
      setFuelLogs(fuelLogList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load fuel logs. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredFuelLogs() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const fuelLogList = await getFuelLogs(filters)

        if (isMounted) {
          setFuelLogs(fuelLogList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load fuel logs. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredFuelLogs()

    return () => {
      isMounted = false
    }
  }, [filters])

  const summary = useMemo(() => {
    const totalQuantity = fuelLogs.reduce((total, fuelLog) => total + fuelLog.quantity, 0)
    const totalCost = fuelLogs.reduce((total, fuelLog) => total + fuelLog.totalAmount, 0)

    return {
      averageUnitCost: totalQuantity > 0 ? totalCost / totalQuantity : 0,
      totalCost,
      totalQuantity,
    }
  }, [fuelLogs])

  return {
    error,
    filters,
    fuelLogs,
    isLoading,
    reload: loadFuelLogs,
    setFilters,
    summary,
  }
}
