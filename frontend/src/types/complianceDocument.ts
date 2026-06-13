import type { VehicleStatus } from './vehicle'

export type ComplianceDocumentStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED'

export type ComplianceDocumentVehicleSummary = {
  id: string
  registrationNumber: string
  make: string
  model: string
  status: VehicleStatus
}

export type ComplianceDocument = {
  id: string
  vehicleId: string
  documentType: string
  documentNumber: string | null
  issueDate: string | null
  expiryDate: string
  filePath: string | null
  status: ComplianceDocumentStatus
  createdAt: string
  updatedAt: string
  vehicle: ComplianceDocumentVehicleSummary
}

export type ComplianceDocumentFormValues = {
  vehicleId: string
  documentType: string
  documentNumber: string
  issueDate: string
  expiryDate: string
  filePath: string
}

export type ComplianceDocumentFilters = {
  vehicleId: string
  status: '' | ComplianceDocumentStatus
  documentType: string
}

export type ComplianceDocumentSummary = {
  valid: number
  expiringSoon: number
  expired: number
  total: number
}

export type ComplianceDocumentListResponse = {
  documents: ComplianceDocument[]
}

export type ComplianceDocumentMutationResponse = {
  message: string
  document: ComplianceDocument
}

export type ComplianceDocumentDeleteResponse = {
  message: string
}

export const COMPLIANCE_DOCUMENT_STATUSES: Array<{ label: string; value: ComplianceDocumentStatus }> = [
  { label: 'Valid', value: 'VALID' },
  { label: 'Expiring Soon', value: 'EXPIRING_SOON' },
  { label: 'Expired', value: 'EXPIRED' },
]

export const DOCUMENT_TYPE_OPTIONS = [
  'Registration',
  'Insurance',
  'Fitness Certificate',
  'Route Permit',
  'Pollution Certificate',
  'Tax Token',
] as const

export const defaultComplianceDocumentFilters: ComplianceDocumentFilters = {
  documentType: '',
  status: '',
  vehicleId: '',
}

export const emptyComplianceDocumentFormValues: ComplianceDocumentFormValues = {
  documentNumber: '',
  documentType: 'Registration',
  expiryDate: '',
  filePath: '',
  issueDate: '',
  vehicleId: '',
}
