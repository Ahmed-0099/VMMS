import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import type { RoleName } from '../types/auth'

export type AdminDashboardMetrics = {
  totalVehicles: number
  activeVehicles: number
  vehiclesInMaintenance: number
  totalDrivers: number
  openWorkOrders: number
  completedWorkOrders: number
  fuelCostThisMonth: number
  expiringDocuments: number
  newFaultReports: number
  dueMaintenanceSchedules: number
}

export type TechnicianDashboardMetrics = {
  assignedWorkOrders: number
  openAssignedWorkOrders: number
  inProgressWorkOrders: number
  completedAssignedWorkOrders: number
  urgentAssignedWorkOrders: number
  dueAssignedWorkOrders: number
}

export type DriverDashboardMetrics = {
  submittedFaultReports: number
  openFaultReports: number
  reviewedFaultReports: number
  convertedFaultReports: number
  closedFaultReports: number
}

export type DashboardSummary =
  | {
      role: Extract<RoleName, 'ADMIN'>
      metrics: AdminDashboardMetrics
    }
  | {
      role: Extract<RoleName, 'TECHNICIAN'>
      metrics: TechnicianDashboardMetrics
    }
  | {
      role: Extract<RoleName, 'DRIVER'>
      metrics: DriverDashboardMetrics
    }

async function requestDashboardSummary() {
  const response = await api.get<DashboardSummary>('/dashboard/summary')
  return response.data
}

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const summary = await requestDashboardSummary()
      setData(summary)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load dashboard summary. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialSummary() {
      try {
        const summary = await requestDashboardSummary()

        if (isMounted) {
          setData(summary)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load dashboard summary. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialSummary()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    reload: loadSummary,
  }
}
