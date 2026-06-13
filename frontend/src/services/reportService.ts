import { api } from './api'
import type {
  ComplianceReport,
  FuelReport,
  ReportDataMap,
  ReportFilters,
  ReportResponse,
  ReportType,
  VehicleReport,
  WorkOrderReport,
} from '../types/report'

const reportEndpoints: Record<ReportType, string> = {
  compliance: '/reports/compliance',
  fuel: '/reports/fuel',
  vehicles: '/reports/vehicles',
  'work-orders': '/reports/work-orders',
}

function getReportParams(filters: ReportFilters) {
  return {
    from: filters.from || undefined,
    status: filters.status || undefined,
    to: filters.to || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

async function getReport<TType extends ReportType>(type: TType, filters: ReportFilters) {
  const response = await api.get<ReportResponse<ReportDataMap[TType]>>(reportEndpoints[type], {
    params: getReportParams(filters),
  })

  return response.data.report
}

export function getVehicleReport(filters: ReportFilters): Promise<VehicleReport> {
  return getReport('vehicles', filters)
}

export function getFuelReport(filters: ReportFilters): Promise<FuelReport> {
  return getReport('fuel', filters)
}

export function getWorkOrderReport(filters: ReportFilters): Promise<WorkOrderReport> {
  return getReport('work-orders', filters)
}

export function getComplianceReport(filters: ReportFilters): Promise<ComplianceReport> {
  return getReport('compliance', filters)
}

export function getReportByType<TType extends ReportType>(type: TType, filters: ReportFilters) {
  return getReport(type, filters)
}
