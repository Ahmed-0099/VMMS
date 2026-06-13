import { useCallback, useEffect, useState } from 'react'
import { getVehicles } from '../services/vehicleService'
import type { Vehicle, VehicleFilters } from '../types/vehicle'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const defaultVehicleFilters: VehicleFilters = {
  category: '',
  fuelType: '',
  search: '',
  status: '',
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filters, setFilters] = useState<VehicleFilters>(defaultVehicleFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadVehicles = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const vehicleList = await getVehicles(nextFilters)
      setVehicles(vehicleList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load vehicles. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredVehicles() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const vehicleList = await getVehicles(filters)

        if (isMounted) {
          setVehicles(vehicleList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load vehicles. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredVehicles()

    return () => {
      isMounted = false
    }
  }, [filters])

  return {
    error,
    filters,
    isLoading,
    reload: loadVehicles,
    setFilters,
    vehicles,
  }
}
