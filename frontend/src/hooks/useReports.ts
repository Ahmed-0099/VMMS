import { useCallback, useEffect, useState } from 'react'
import { getReportByType } from '../services/reportService'
import type { ReportData, ReportFilters, ReportType } from '../types/report'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function useReports(reportType: ReportType, filters: ReportFilters) {
  const [reportState, setReportState] = useState<{ data: ReportData; type: ReportType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const data = reportState?.type === reportType ? reportState.data : null

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const report = await getReportByType(reportType, filters)
      setReportState({ data: report, type: reportType })
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load report data. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters, reportType])

  useEffect(() => {
    let isMounted = true

    async function loadCurrentReport() {
      setIsLoading(true)
      setError('')

      try {
        const report = await getReportByType(reportType, filters)

        if (isMounted) {
          setReportState({ data: report, type: reportType })
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load report data. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCurrentReport()

    return () => {
      isMounted = false
    }
  }, [filters, reportType])

  return {
    data,
    error,
    isLoading: isLoading || Boolean(reportState && reportState.type !== reportType),
    reload: loadReport,
  }
}
