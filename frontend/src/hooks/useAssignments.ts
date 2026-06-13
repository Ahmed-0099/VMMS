import { useCallback, useEffect, useState } from 'react'
import { getAssignments } from '../services/assignmentService'
import type { AssignmentFilters, VehicleAssignment } from '../types/assignment'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const defaultAssignmentFilters: AssignmentFilters = {
  driverId: '',
  status: '',
  vehicleId: '',
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([])
  const [filters, setFilters] = useState<AssignmentFilters>(defaultAssignmentFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAssignments = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const assignmentList = await getAssignments(nextFilters)
      setAssignments(assignmentList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load assignments. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredAssignments() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const assignmentList = await getAssignments(filters)

        if (isMounted) {
          setAssignments(assignmentList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load assignments. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredAssignments()

    return () => {
      isMounted = false
    }
  }, [filters])

  return {
    assignments,
    error,
    filters,
    isLoading,
    reload: loadAssignments,
    setFilters,
  }
}
