import { api } from './api'
import type {
  ComplianceDocument,
  ComplianceDocumentDeleteResponse,
  ComplianceDocumentFilters,
  ComplianceDocumentFormValues,
  ComplianceDocumentListResponse,
  ComplianceDocumentMutationResponse,
} from '../types/complianceDocument'

function getComplianceDocumentPayload(values: ComplianceDocumentFormValues) {
  return {
    documentNumber: values.documentNumber.trim() || null,
    documentType: values.documentType.trim(),
    expiryDate: values.expiryDate,
    filePath: values.filePath.trim() || null,
    issueDate: values.issueDate || null,
    vehicleId: values.vehicleId,
  }
}

function getComplianceDocumentParams(filters: ComplianceDocumentFilters) {
  return {
    documentType: filters.documentType || undefined,
    status: filters.status || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : ''
}

export async function getComplianceDocuments(filters: ComplianceDocumentFilters) {
  const response = await api.get<ComplianceDocumentListResponse>('/compliance-documents', {
    params: getComplianceDocumentParams(filters),
  })

  return response.data.documents
}

export async function createComplianceDocument(values: ComplianceDocumentFormValues) {
  const response = await api.post<ComplianceDocumentMutationResponse>('/compliance-documents', getComplianceDocumentPayload(values))
  return response.data.document
}

export async function updateComplianceDocument(id: string, values: ComplianceDocumentFormValues) {
  const response = await api.put<ComplianceDocumentMutationResponse>(`/compliance-documents/${id}`, getComplianceDocumentPayload(values))
  return response.data.document
}

export async function deleteComplianceDocument(id: string) {
  const response = await api.delete<ComplianceDocumentDeleteResponse>(`/compliance-documents/${id}`)
  return response.data
}

export function toComplianceDocumentFormValues(document: ComplianceDocument): ComplianceDocumentFormValues {
  return {
    documentNumber: document.documentNumber ?? '',
    documentType: document.documentType,
    expiryDate: toDateInputValue(document.expiryDate),
    filePath: document.filePath ?? '',
    issueDate: toDateInputValue(document.issueDate),
    vehicleId: document.vehicleId,
  }
}
