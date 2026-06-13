import { api } from './api'
import type {
  Vehicle,
  VehicleDeleteResponse,
  VehicleFilters,
  VehicleFormValues,
  VehicleListResponse,
  VehicleMutationResponse,
  VehicleResponse,
} from '../types/vehicle'

function getVehiclePayload(values: VehicleFormValues) {
  return {
    category: values.category.trim() || null,
    currentOdometer: values.currentOdometer ? Number(values.currentOdometer) : null,
    fuelType: values.fuelType.trim(),
    make: values.make.trim(),
    model: values.model.trim(),
    registrationNumber: values.registrationNumber.trim(),
    status: values.status,
    vin: values.vin.trim() || null,
    year: values.year ? Number(values.year) : null,
  }
}

function getVehicleParams(filters: VehicleFilters) {
  return {
    category: filters.category || undefined,
    fuelType: filters.fuelType || undefined,
    search: filters.search || undefined,
    status: filters.status || undefined,
  }
}

export async function getVehicles(filters: VehicleFilters) {
  const response = await api.get<VehicleListResponse>('/vehicles', {
    params: getVehicleParams(filters),
  })

  return response.data.vehicles
}

export async function getVehicle(id: string) {
  const response = await api.get<VehicleResponse>(`/vehicles/${id}`)
  return response.data.vehicle
}

export async function createVehicle(values: VehicleFormValues) {
  const response = await api.post<VehicleMutationResponse>('/vehicles', getVehiclePayload(values))
  return response.data.vehicle
}

export async function updateVehicle(id: string, values: VehicleFormValues) {
  const response = await api.put<VehicleMutationResponse>(`/vehicles/${id}`, getVehiclePayload(values))
  return response.data.vehicle
}

export async function deleteVehicle(id: string) {
  const response = await api.delete<VehicleDeleteResponse>(`/vehicles/${id}`)
  return response.data
}

export function toVehicleFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    category: vehicle.category ?? '',
    currentOdometer: vehicle.currentOdometer === null ? '' : String(vehicle.currentOdometer),
    fuelType: vehicle.fuelType,
    make: vehicle.make,
    model: vehicle.model,
    registrationNumber: vehicle.registrationNumber,
    status: vehicle.status,
    vin: vehicle.vin ?? '',
    year: vehicle.year === null ? '' : String(vehicle.year),
  }
}
