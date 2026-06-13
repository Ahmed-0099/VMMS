import { api } from './api'
import type {
  FaultReportConversionResponse,
  FaultReportConvertValues,
  FaultReportFilters,
  FaultReportFormValues,
  FaultReportListResponse,
  FaultReportMutationResponse,
  FaultReportStatus,
} from '../types/faultReport'

function getFaultReportParams(filters: FaultReportFilters) {
  return {
    driverId: filters.driverId || undefined,
    status: filters.status || undefined,
    urgency: filters.urgency || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

function getFaultReportPayload(values: FaultReportFormValues) {
  return {
    description: values.description.trim(),
    photoPath: values.photoPath.trim() || null,
    urgency: values.urgency,
    vehicleId: values.vehicleId,
  }
}

function getConvertPayload(values: FaultReportConvertValues) {
  return {
    description: values.description.trim() || null,
    dueDate: values.dueDate || null,
    priority: values.priority,
    serviceType: values.serviceType.trim(),
    technicianId: values.technicianId || null,
  }
}

export async function getFaultReports(filters: FaultReportFilters) {
  const response = await api.get<FaultReportListResponse>('/fault-reports', {
    params: getFaultReportParams(filters),
  })

  return response.data.faultReports
}

export async function createFaultReport(values: FaultReportFormValues) {
  const response = await api.post<FaultReportMutationResponse>('/fault-reports', getFaultReportPayload(values))
  return response.data.faultReport
}

export async function updateFaultReportStatus(id: string, status: FaultReportStatus) {
  const response = await api.patch<FaultReportMutationResponse>(`/fault-reports/${id}/status`, { status })
  return response.data.faultReport
}

export async function convertFaultReportToWorkOrder(id: string, values: FaultReportConvertValues) {
  const response = await api.post<FaultReportConversionResponse>(
    `/fault-reports/${id}/convert-to-work-order`,
    getConvertPayload(values),
  )

  return response.data
}
