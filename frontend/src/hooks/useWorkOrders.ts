import { useCallback, useEffect, useState } from 'react'
import { getWorkOrders } from '../services/workOrderService'
import type { WorkOrder, WorkOrderFilters } from '../types/workOrder'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const defaultWorkOrderFilters: WorkOrderFilters = {
  priority: '',
  status: '',
  technicianId: '',
  vehicleId: '',
}

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [filters, setFilters] = useState<WorkOrderFilters>(defaultWorkOrderFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadWorkOrders = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const workOrderList = await getWorkOrders(nextFilters)
      setWorkOrders(workOrderList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load work orders. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredWorkOrders() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const workOrderList = await getWorkOrders(filters)

        if (isMounted) {
          setWorkOrders(workOrderList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load work orders. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredWorkOrders()

    return () => {
      isMounted = false
    }
  }, [filters])

  return {
    error,
    filters,
    isLoading,
    reload: loadWorkOrders,
    setFilters,
    workOrders,
  }
}
