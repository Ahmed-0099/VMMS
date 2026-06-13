import { useCallback, useEffect, useMemo, useState } from 'react'
import { getFaultReports } from '../services/faultReportService'
import { defaultFaultReportFilters, type FaultReport, type FaultReportFilters } from '../types/faultReport'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function useFaultReports() {
  const [faultReports, setFaultReports] = useState<FaultReport[]>([])
  const [filters, setFilters] = useState<FaultReportFilters>(defaultFaultReportFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFaultReports = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const reportList = await getFaultReports(nextFilters)
      setFaultReports(reportList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load fault reports. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredFaultReports() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const reportList = await getFaultReports(filters)

        if (isMounted) {
          setFaultReports(reportList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load fault reports. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredFaultReports()

    return () => {
      isMounted = false
    }
  }, [filters])

  const summary = useMemo(() => {
    return faultReports.reduce(
      (counts, report) => {
        if (report.status === 'NEW') {
          counts.newReports += 1
        }

        if (report.status === 'REVIEWED') {
          counts.reviewed += 1
        }

        if (report.status === 'CONVERTED_TO_WORK_ORDER') {
          counts.converted += 1
        }

        if (report.status === 'CLOSED') {
          counts.closed += 1
        }

        if (report.urgency === 'HIGH' && report.status !== 'CLOSED') {
          counts.highUrgency += 1
        }

        counts.total += 1
        return counts
      },
      {
        closed: 0,
        converted: 0,
        highUrgency: 0,
        newReports: 0,
        reviewed: 0,
        total: 0,
      },
    )
  }, [faultReports])

  return {
    error,
    faultReports,
    filters,
    isLoading,
    reload: loadFaultReports,
    setFilters,
    summary,
  }
}
