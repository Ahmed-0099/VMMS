import type { ComplianceDocumentStatus } from './complianceDocument'
import type { VehicleStatus } from './vehicle'
import type { WorkOrderStatus } from './workOrder'

export type ReportType = 'vehicles' | 'fuel' | 'work-orders' | 'compliance'

export type ReportFilters = {
  from: string
  status: string
  to: string
  vehicleId: string
}

export type StatusReportRow<TStatus extends string = string> = {
  count: number
  label: string
  status: TStatus
  totalCost?: number
}

export type VehicleReport = {
  rows: StatusReportRow<VehicleStatus>[]
  summary: {
    active: number
    inMaintenance: number
    outOfService: number
    totalVehicles: number
  }
  vehicles: Array<{
    id: string
    label: string
    registrationNumber: string
    status: VehicleStatus
  }>
}

export type FuelReportRow = {
  averageUnitCost: number
  label: string
  logCount: number
  totalCost: number
  totalQuantity: number
  vehicle: string
  vehicleId: string
}

export type FuelReportDateRow = {
  date: string
  label: string
  logCount: number
  totalCost: number
  totalQuantity: number
}

export type FuelReport = {
  dateRows: FuelReportDateRow[]
  rows: FuelReportRow[]
  summary: {
    averageUnitCost: number
    logCount: number
    totalCost: number
    totalQuantity: number
  }
}

export type WorkOrderReport = {
  rows: StatusReportRow<WorkOrderStatus>[]
  summary: {
    completedCount: number
    openCount: number
    totalCost: number
    totalWorkOrders: number
  }
  vehicleRows: Array<{
    count: number
    label: string
    totalCost: number
    vehicle: string
    vehicleId: string
  }>
}

export type ComplianceReport = {
  rows: StatusReportRow<ComplianceDocumentStatus>[]
  summary: {
    expiredCount: number
    expiringSoonCount: number
    totalDocuments: number
    validCount: number
  }
  vehicleRows: Array<{
    count: number
    expired: number
    expiringSoon: number
    label: string
    valid: number
    vehicle: string
    vehicleId: string
  }>
}

export type ReportDataMap = {
  compliance: ComplianceReport
  fuel: FuelReport
  vehicles: VehicleReport
  'work-orders': WorkOrderReport
}

export type ReportData = ReportDataMap[ReportType]

export type ReportResponse<TReport extends ReportData> = {
  report: TReport
}

export const defaultReportFilters: ReportFilters = {
  from: '',
  status: '',
  to: '',
  vehicleId: '',
}
