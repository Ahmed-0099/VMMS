import { api } from './api'
import type {
  FuelLog,
  FuelLogDeleteResponse,
  FuelLogFilters,
  FuelLogFormValues,
  FuelLogListResponse,
  FuelLogMutationResponse,
} from '../types/fuelLog'

function numberOrNull(value: string) {
  return value === '' ? null : Number(value)
}

function getFuelLogPayload(values: FuelLogFormValues) {
  return {
    date: values.date,
    driverId: values.driverId || null,
    fuelType: values.fuelType.trim(),
    odometerReading: numberOrNull(values.odometerReading),
    quantity: Number(values.quantity),
    unitCost: Number(values.unitCost),
    vehicleId: values.vehicleId,
  }
}

function getFuelLogParams(filters: FuelLogFilters) {
  return {
    driverId: filters.driverId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

export async function getFuelLogs(filters: FuelLogFilters) {
  const response = await api.get<FuelLogListResponse>('/fuel-logs', {
    params: getFuelLogParams(filters),
  })

  return response.data.fuelLogs
}

export async function createFuelLog(values: FuelLogFormValues) {
  const response = await api.post<FuelLogMutationResponse>('/fuel-logs', getFuelLogPayload(values))
  return response.data.fuelLog
}

export async function updateFuelLog(id: string, values: FuelLogFormValues) {
  const response = await api.put<FuelLogMutationResponse>(`/fuel-logs/${id}`, getFuelLogPayload(values))
  return response.data.fuelLog
}

export async function deleteFuelLog(id: string) {
  const response = await api.delete<FuelLogDeleteResponse>(`/fuel-logs/${id}`)
  return response.data
}

export function toFuelLogFormValues(fuelLog: FuelLog): FuelLogFormValues {
  return {
    date: toDateInputValue(fuelLog.date),
    driverId: fuelLog.driverId ?? '',
    fuelType: fuelLog.fuelType,
    odometerReading: fuelLog.odometerReading === null ? '' : String(fuelLog.odometerReading),
    quantity: String(fuelLog.quantity),
    unitCost: String(fuelLog.unitCost),
    vehicleId: fuelLog.vehicleId,
  }
}
