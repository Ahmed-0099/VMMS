import type { RoleName } from './auth'
import type { WorkOrderPriority, WorkOrderStatus, WorkOrderTechnician } from './workOrder'
import type { VehicleStatus } from './vehicle'

export type FaultUrgency = 'LOW' | 'MEDIUM' | 'HIGH'
export type FaultReportStatus = 'NEW' | 'REVIEWED' | 'CONVERTED_TO_WORK_ORDER' | 'CLOSED'

export type FaultReportVehicleSummary = {
  id: string
  registrationNumber: string
  make: string
  model: string
  status: VehicleStatus
  currentOdometer: number | null
}

export type FaultReportDriverSummary = {
  id: string
  fullName: string
  licenseNumber: string
  phone: string | null
  userId: string | null
  user: {
    id: string
    name: string
    email: string
  } | null
}

export type FaultReportReporterSummary = {
  id: string
  name: string
  email: string
}

export type FaultReportWorkOrderSummary = {
  id: string
  priority: WorkOrderPriority
  serviceType: string
  status: WorkOrderStatus
  technician: WorkOrderTechnician | null
}

export type FaultReport = {
  id: string
  vehicleId: string
  driverId: string | null
  reporterId: string | null
  workOrderId: string | null
  urgency: FaultUrgency
  description: string
  status: FaultReportStatus
  photoPath: string | null
  createdAt: string
  updatedAt: string
  vehicle: FaultReportVehicleSummary
  driver: FaultReportDriverSummary | null
  reporter: FaultReportReporterSummary | null
  workOrder: FaultReportWorkOrderSummary | null
}

export type FaultReportFormValues = {
  vehicleId: string
  urgency: FaultUrgency
  description: string
  photoPath: string
}

export type FaultReportConvertValues = {
  technicianId: string
  priority: WorkOrderPriority
  dueDate: string
  serviceType: string
  description: string
}

export type FaultReportFilters = {
  status: '' | FaultReportStatus
  urgency: '' | FaultUrgency
  vehicleId: string
  driverId: string
}

export type FaultReportSummary = {
  closed: number
  converted: number
  highUrgency: number
  newReports: number
  reviewed: number
  total: number
}

export type FaultReportListResponse = {
  faultReports: FaultReport[]
}

export type FaultReportMutationResponse = {
  message: string
  faultReport: FaultReport
}

export type FaultReportConversionResponse = {
  message: string
  faultReport: FaultReport
  workOrder: FaultReportWorkOrderSummary
}

export const FAULT_URGENCIES: Array<{ label: string; value: FaultUrgency }> = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
]

export const FAULT_REPORT_STATUSES: Array<{ label: string; value: FaultReportStatus }> = [
  { label: 'New', value: 'NEW' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Converted', value: 'CONVERTED_TO_WORK_ORDER' },
  { label: 'Closed', value: 'CLOSED' },
]

export const defaultFaultReportFilters: FaultReportFilters = {
  driverId: '',
  status: '',
  urgency: '',
  vehicleId: '',
}

export const emptyFaultReportFormValues: FaultReportFormValues = {
  description: '',
  photoPath: '',
  urgency: 'MEDIUM',
  vehicleId: '',
}

export const emptyFaultReportConvertValues: FaultReportConvertValues = {
  description: '',
  dueDate: '',
  priority: 'MEDIUM',
  serviceType: '',
  technicianId: '',
}

export type FaultReportActionRole = Extract<RoleName, 'ADMIN' | 'DRIVER'>
