import { api } from './api'
import type {
  Driver,
  DriverDeleteResponse,
  DriverFilters,
  DriverFormValues,
  DriverListResponse,
  DriverMutationResponse,
  DriverResponse,
  DriverUserListResponse,
} from '../types/driver'

function getDriverPayload(values: DriverFormValues) {
  return {
    address: values.address.trim() || null,
    cnic: values.cnic.trim() || null,
    fullName: values.fullName.trim(),
    licenseExpiry: values.licenseExpiry,
    licenseNumber: values.licenseNumber.trim(),
    phone: values.phone.trim() || null,
    status: values.status,
    userId: values.userId.trim() || null,
  }
}

function getDriverParams(filters: DriverFilters) {
  return {
    search: filters.search || undefined,
    status: filters.status || undefined,
  }
}

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

export async function getDrivers(filters: DriverFilters) {
  const response = await api.get<DriverListResponse>('/drivers', {
    params: getDriverParams(filters),
  })

  return response.data.drivers
}

export async function getDriver(id: string) {
  const response = await api.get<DriverResponse>(`/drivers/${id}`)
  return response.data.driver
}

export async function getMyDriverProfile() {
  const response = await api.get<DriverResponse>('/drivers/me')
  return response.data.driver
}

export async function getDriverUsers() {
  const response = await api.get<DriverUserListResponse>('/drivers/linkable-users')
  return response.data.users
}

export async function createDriver(values: DriverFormValues) {
  const response = await api.post<DriverMutationResponse>('/drivers', getDriverPayload(values))
  return response.data.driver
}

export async function updateDriver(id: string, values: DriverFormValues) {
  const response = await api.put<DriverMutationResponse>(`/drivers/${id}`, getDriverPayload(values))
  return response.data.driver
}

export async function deleteDriver(id: string) {
  const response = await api.delete<DriverDeleteResponse>(`/drivers/${id}`)
  return response.data
}

export function toDriverFormValues(driver: Driver): DriverFormValues {
  return {
    address: driver.address ?? '',
    cnic: driver.cnic ?? '',
    fullName: driver.fullName,
    licenseExpiry: toDateInputValue(driver.licenseExpiry),
    licenseNumber: driver.licenseNumber,
    phone: driver.phone ?? '',
    status: driver.status,
    userId: driver.userId ?? '',
  }
}
