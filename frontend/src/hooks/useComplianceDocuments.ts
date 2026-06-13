import { useCallback, useEffect, useMemo, useState } from 'react'
import { getComplianceDocuments } from '../services/complianceDocumentService'
import {
  defaultComplianceDocumentFilters,
  type ComplianceDocument,
  type ComplianceDocumentFilters,
} from '../types/complianceDocument'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function useComplianceDocuments() {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([])
  const [filters, setFilters] = useState<ComplianceDocumentFilters>(defaultComplianceDocumentFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDocuments = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')

    try {
      const documentList = await getComplianceDocuments(nextFilters)
      setDocuments(documentList)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load compliance documents. Please check the backend API.'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    async function loadFilteredDocuments() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const documentList = await getComplianceDocuments(filters)

        if (isMounted) {
          setDocuments(documentList)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load compliance documents. Please check the backend API.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFilteredDocuments()

    return () => {
      isMounted = false
    }
  }, [filters])

  const summary = useMemo(() => {
    return documents.reduce(
      (counts, document) => {
        if (document.status === 'VALID') {
          counts.valid += 1
        }

        if (document.status === 'EXPIRING_SOON') {
          counts.expiringSoon += 1
        }

        if (document.status === 'EXPIRED') {
          counts.expired += 1
        }

        counts.total += 1
        return counts
      },
      {
        expired: 0,
        expiringSoon: 0,
        total: 0,
        valid: 0,
      },
    )
  }, [documents])

  return {
    documents,
    error,
    filters,
    isLoading,
    reload: loadDocuments,
    setFilters,
    summary,
  }
}
