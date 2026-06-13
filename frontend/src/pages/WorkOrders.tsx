import { useCallback, useEffect, useState } from 'react'
import { WorkOrderForm } from '../components/workOrders/WorkOrderForm'
import { WorkOrderTable } from '../components/workOrders/WorkOrderTable'
import { useAuth } from '../context/AuthContext'
import { useWorkOrders } from '../hooks/useWorkOrders'
import { getVehicles } from '../services/vehicleService'
import {
  createWorkOrder,
  deleteWorkOrder,
  getWorkOrderTechnicians,
  toWorkOrderFormValues,
  updateWorkOrder,
  updateWorkOrderStatus,
} from '../services/workOrderService'
import type { Vehicle } from '../types/vehicle'
import {
  emptyWorkOrderFormValues,
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
  type WorkOrder,
  type WorkOrderFormValues,
  type WorkOrderStatus,
  type WorkOrderTechnician,
} from '../types/workOrder'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function WorkOrders() {
  const { user } = useAuth()
  const { error, filters, isLoading, reload, setFilters, workOrders } = useWorkOrders()
  const [formValues, setFormValues] = useState<WorkOrderFormValues>(emptyWorkOrderFormValues)
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [technicians, setTechnicians] = useState<WorkOrderTechnician[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isOptionsLoading, setIsOptionsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [formError, setFormError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  const loadFormOptions = useCallback(async () => {
    if (!isAdmin) {
      return
    }

    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      const [vehicleList, technicianList] = await Promise.all([
        getVehicles({ category: '', fuelType: '', search: '', status: '' }),
        getWorkOrderTechnicians(),
      ])

      setVehicles(vehicleList)
      setTechnicians(technicianList)
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load work order form options.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    let isMounted = true

    async function loadInitialOptions() {
      if (!isAdmin) {
        return
      }

      await Promise.resolve()

      if (isMounted) {
        setIsOptionsLoading(true)
        setOptionsError('')
      }

      try {
        const [vehicleList, technicianList] = await Promise.all([
          getVehicles({ category: '', fuelType: '', search: '', status: '' }),
          getWorkOrderTechnicians(),
        ])

        if (isMounted) {
          setVehicles(vehicleList)
          setTechnicians(technicianList)
        }
      } catch (apiError) {
        if (isMounted) {
          setOptionsError(getApiErrorMessage(apiError, 'Unable to load work order form options.'))
        }
      } finally {
        if (isMounted) {
          setIsOptionsLoading(false)
        }
      }
    }

    loadInitialOptions()

    return () => {
      isMounted = false
    }
  }, [isAdmin])

  function openCreateForm() {
    setFormValues(emptyWorkOrderFormValues)
    setEditingWorkOrder(null)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(workOrder: WorkOrder) {
    setFormValues(toWorkOrderFormValues(workOrder))
    setEditingWorkOrder(workOrder)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingWorkOrder(null)
    setFormValues(emptyWorkOrderFormValues)
    setFormError('')
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      if (editingWorkOrder) {
        await updateWorkOrder(editingWorkOrder.id, formValues)
        setSuccessMessage('Work order updated successfully.')
      } else {
        await createWorkOrder(formValues)
        setSuccessMessage('Work order created successfully.')
      }

      closeForm()
      await Promise.all([reload(), loadFormOptions()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to save work order. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(workOrder: WorkOrder, status: WorkOrderStatus) {
    setIsUpdatingStatus(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await updateWorkOrderStatus(workOrder.id, status)
      setSuccessMessage('Work order status updated successfully.')
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to update work order status.'))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleDelete(workOrder: WorkOrder) {
    const confirmed = window.confirm(`Delete work order for ${workOrder.vehicle.registrationNumber}?`)

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      await deleteWorkOrder(workOrder.id)
      setSuccessMessage('Work order deleted successfully.')
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to delete work order.'))
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Work orders</span>
          <h2 className="dashboard-title">{isAdmin ? 'Maintenance command center' : 'My assigned work orders'}</h2>
          <p className="dashboard-subtitle">
            {isAdmin
              ? 'Create, assign, prioritize, and close maintenance jobs across the fleet.'
              : 'Track assigned maintenance jobs, update progress, and record repair effort.'}
          </p>
        </div>
        {isAdmin ? (
          <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
            Create Work Order
          </button>
        ) : null}
      </div>

      {(error || formError || optionsError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || optionsError || error}
        </div>
      )}

      {isFormOpen && isAdmin ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{editingWorkOrder ? 'Edit work order' : 'New work order'}</span>
              <h3>{editingWorkOrder ? editingWorkOrder.serviceType : 'Create maintenance job'}</h3>
            </div>
          </div>
          <WorkOrderForm
            isLoadingOptions={isOptionsLoading}
            isSubmitting={isSubmitting}
            submitLabel={editingWorkOrder ? 'Update work order' : 'Create work order'}
            technicians={technicians}
            values={formValues}
            vehicles={vehicles}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}

      <section className="module-panel">
        <div className="work-order-status-tabs" aria-label="Work order status filters">
          <button
            className={`btn btn-sm ${filters.status === '' ? 'btn-success' : 'btn-outline-secondary'}`}
            type="button"
            onClick={() => setFilters((currentFilters) => ({ ...currentFilters, status: '' }))}
          >
            All
          </button>
          {WORK_ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              className={`btn btn-sm ${filters.status === status.value ? 'btn-success' : 'btn-outline-secondary'}`}
              type="button"
              onClick={() => setFilters((currentFilters) => ({ ...currentFilters, status: status.value }))}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="work-order-toolbar">
          <div>
            <label className="form-label" htmlFor="workOrderPriorityFilter">
              Priority
            </label>
            <select
              className="form-select"
              id="workOrderPriorityFilter"
              value={filters.priority}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, priority: event.target.value as typeof filters.priority }))}
            >
              <option value="">All priorities</option>
              {WORK_ORDER_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <WorkOrderTable
          currentRole={user?.role ?? 'DRIVER'}
          isLoading={isLoading}
          isUpdatingStatus={isUpdatingStatus}
          workOrders={workOrders}
          onDelete={handleDelete}
          onEdit={openEditForm}
          onStatusChange={handleStatusChange}
        />
      </section>
    </>
  )
}
