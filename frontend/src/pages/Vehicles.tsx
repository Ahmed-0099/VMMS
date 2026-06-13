import { useState } from 'react'
import { VehicleForm } from '../components/vehicles/VehicleForm'
import { VehicleTable } from '../components/vehicles/VehicleTable'
import { createVehicle, deleteVehicle, toVehicleFormValues, updateVehicle } from '../services/vehicleService'
import { emptyVehicleFormValues, VEHICLE_STATUSES } from '../types/vehicle'
import type { Vehicle, VehicleFormValues } from '../types/vehicle'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { useVehicles } from '../hooks/useVehicles'

export function Vehicles() {
  const { error, filters, isLoading, reload, setFilters, vehicles } = useVehicles()
  const [formValues, setFormValues] = useState<VehicleFormValues>(emptyVehicleFormValues)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openCreateForm() {
    setFormValues(emptyVehicleFormValues)
    setEditingVehicle(null)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(vehicle: Vehicle) {
    setFormValues(toVehicleFormValues(vehicle))
    setEditingVehicle(vehicle)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingVehicle(null)
    setFormValues(emptyVehicleFormValues)
    setFormError('')
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formValues)
        setSuccessMessage('Vehicle updated successfully.')
      } else {
        await createVehicle(formValues)
        setSuccessMessage('Vehicle added successfully.')
      }

      closeForm()
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to save vehicle. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    const confirmed = window.confirm(`Delete vehicle ${vehicle.registrationNumber}? This only works if it has no related records.`)

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      await deleteVehicle(vehicle.id)
      setSuccessMessage('Vehicle deleted successfully.')
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to delete vehicle. Change its status if it has related records.'))
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Vehicle registry</span>
          <h2 className="dashboard-title">Manage fleet vehicles</h2>
          <p className="dashboard-subtitle">Add vehicles, track status, and keep registration, fuel, category, and odometer details organized.</p>
        </div>
        <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
          Add Vehicle
        </button>
      </div>

      {(error || formError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || error}
        </div>
      )}

      {isFormOpen ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{editingVehicle ? 'Edit vehicle' : 'New vehicle'}</span>
              <h3>{editingVehicle ? editingVehicle.registrationNumber : 'Add vehicle to fleet'}</h3>
            </div>
          </div>
          <VehicleForm
            values={formValues}
            isSubmitting={isSubmitting}
            submitLabel={editingVehicle ? 'Update vehicle' : 'Create vehicle'}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}

      <section className="module-panel">
        <div className="vehicle-toolbar">
          <div className="vehicle-search">
            <label className="form-label" htmlFor="vehicleSearch">
              Search
            </label>
            <input
              className="form-control"
              id="vehicleSearch"
              value={filters.search}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, search: event.target.value }))}
              placeholder="Registration, make, model, VIN"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="vehicleStatusFilter">
              Status
            </label>
            <select
              className="form-select"
              id="vehicleStatusFilter"
              value={filters.status}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, status: event.target.value as typeof filters.status }))}
            >
              <option value="">All statuses</option>
              {VEHICLE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="vehicleFuelFilter">
              Fuel type
            </label>
            <input
              className="form-control"
              id="vehicleFuelFilter"
              value={filters.fuelType}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, fuelType: event.target.value }))}
              placeholder="Diesel"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="vehicleCategoryFilter">
              Category
            </label>
            <input
              className="form-control"
              id="vehicleCategoryFilter"
              value={filters.category}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, category: event.target.value }))}
              placeholder="SUV"
            />
          </div>
        </div>

        <VehicleTable vehicles={vehicles} isLoading={isLoading} onEdit={openEditForm} onDelete={handleDelete} />
      </section>
    </>
  )
}
