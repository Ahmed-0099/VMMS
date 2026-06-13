import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/common/StatusBadge'
import { WorkOrderForm } from '../components/workOrders/WorkOrderForm'
import { WorkOrderStatusActions } from '../components/workOrders/WorkOrderStatusActions'
import { useAuth } from '../context/AuthContext'
import { getVehicles } from '../services/vehicleService'
import {
  deleteWorkOrder,
  getWorkOrder,
  getWorkOrderTechnicians,
  toWorkOrderFormValues,
  toWorkOrderProgressValues,
  updateWorkOrder,
  updateWorkOrderProgress,
  updateWorkOrderStatus,
} from '../services/workOrderService'
import type { Vehicle } from '../types/vehicle'
import {
  emptyWorkOrderFormValues,
  emptyWorkOrderProgressValues,
  type WorkOrder,
  type WorkOrderFormValues,
  type WorkOrderPriority,
  type WorkOrderProgressValues,
  type WorkOrderStatus,
  type WorkOrderTechnician,
} from '../types/workOrder'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const statusDisplay: Record<WorkOrderStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  CLOSED: { label: 'Closed', tone: 'neutral' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  IN_PROGRESS: { label: 'In Progress', tone: 'warning' },
  OPEN: { label: 'Open', tone: 'neutral' },
  PENDING_PARTS: { label: 'Pending Parts', tone: 'danger' },
}

const priorityDisplay: Record<WorkOrderPriority, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  HIGH: { label: 'High', tone: 'warning' },
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'success' },
  URGENT: { label: 'Urgent', tone: 'danger' },
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatMoney(value: number | null) {
  if (value === null) {
    return 'Not set'
  }

  return new Intl.NumberFormat('en-PK', {
    currency: 'PKR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

export function WorkOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [formValues, setFormValues] = useState<WorkOrderFormValues>(emptyWorkOrderFormValues)
  const [progressValues, setProgressValues] = useState<WorkOrderProgressValues>(emptyWorkOrderProgressValues)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [technicians, setTechnicians] = useState<WorkOrderTechnician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOptionsLoading, setIsOptionsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    let isMounted = true

    async function loadWorkOrder() {
      if (!id) {
        return
      }

      try {
        const nextWorkOrder = await getWorkOrder(id)

        if (isMounted) {
          setWorkOrder(nextWorkOrder)
          setFormValues(toWorkOrderFormValues(nextWorkOrder))
          setProgressValues(toWorkOrderProgressValues(nextWorkOrder))
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load work order details.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadWorkOrder()

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    let isMounted = true

    async function loadInitialOptions() {
      if (!isAdmin) {
        return
      }

      await Promise.resolve()

      if (isMounted) {
        setIsOptionsLoading(true)
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
          setError(getApiErrorMessage(apiError, 'Unable to load work order form options.'))
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

  if (!id) {
    return <Navigate to="/work-orders" replace />
  }

  function updateProgressField(field: keyof WorkOrderProgressValues, value: string) {
    setProgressValues((currentValues) => ({ ...currentValues, [field]: value }))
  }

  async function handleAdminUpdate() {
    if (!id) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedWorkOrder = await updateWorkOrder(id, formValues)
      setWorkOrder(updatedWorkOrder)
      setFormValues(toWorkOrderFormValues(updatedWorkOrder))
      setProgressValues(toWorkOrderProgressValues(updatedWorkOrder))
      setIsEditing(false)
      setSuccessMessage('Work order updated successfully.')
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to update work order. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleProgressUpdate() {
    if (!id) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedWorkOrder = await updateWorkOrderProgress(id, progressValues)
      setWorkOrder(updatedWorkOrder)
      setProgressValues(toWorkOrderProgressValues(updatedWorkOrder))
      setFormValues(toWorkOrderFormValues(updatedWorkOrder))
      setSuccessMessage('Work order progress updated successfully.')
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to update work order progress.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(status: WorkOrderStatus) {
    if (!id) {
      return
    }

    setIsUpdatingStatus(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedWorkOrder = await updateWorkOrderStatus(id, status)
      setWorkOrder(updatedWorkOrder)
      setFormValues(toWorkOrderFormValues(updatedWorkOrder))
      setProgressValues(toWorkOrderProgressValues(updatedWorkOrder))
      setSuccessMessage('Work order status updated successfully.')
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to update work order status.'))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleDelete() {
    if (!workOrder) {
      return
    }

    const confirmed = window.confirm(`Delete work order for ${workOrder.vehicle.registrationNumber}?`)

    if (!confirmed) {
      return
    }

    try {
      await deleteWorkOrder(workOrder.id)
      navigate('/work-orders', { replace: true })
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to delete work order.'))
    }
  }

  if (isLoading) {
    return (
      <section className="module-panel">
        <div className="vehicle-table-state" role="status">
          Loading work order details...
        </div>
      </section>
    )
  }

  if (!workOrder) {
    return (
      <section className="module-panel">
        <div className="vehicle-table-state">
          <h3>Work order not found</h3>
          <p>The selected work order could not be loaded.</p>
          <Link className="btn btn-outline-secondary" to="/work-orders">
            Back to Work Orders
          </Link>
        </div>
      </section>
    )
  }

  const status = statusDisplay[workOrder.status]
  const priority = priorityDisplay[workOrder.priority]

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Work order detail</span>
          <h2 className="dashboard-title">{workOrder.serviceType}</h2>
          <p className="dashboard-subtitle">
            {workOrder.vehicle.registrationNumber} - {workOrder.vehicle.make} {workOrder.vehicle.model}
          </p>
        </div>
        <div className="module-actions">
          <Link className="btn btn-outline-secondary" to="/work-orders">
            Back
          </Link>
          {isAdmin ? (
            <>
              <button className="btn btn-outline-success" type="button" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? 'Close Edit' : 'Edit'}
              </button>
              <button className="btn btn-outline-danger" type="button" onClick={handleDelete}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>

      {(error || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || error}
        </div>
      )}

      <section className="module-panel">
        <div className="work-order-detail-top">
          <div>
            <span className="section-kicker">Job status</span>
            <h3>{workOrder.vehicle.registrationNumber}</h3>
          </div>
          <div className="work-order-badge-stack">
            <StatusBadge label={status.label} tone={status.tone} />
            <StatusBadge label={priority.label} tone={priority.tone} />
          </div>
        </div>

        <div className="vehicle-detail-grid">
          <div>
            <span>Vehicle</span>
            <strong>{workOrder.vehicle.registrationNumber}</strong>
          </div>
          <div>
            <span>Technician</span>
            <strong>{workOrder.technician ? workOrder.technician.name : 'Unassigned'}</strong>
          </div>
          <div>
            <span>Due date</span>
            <strong>{formatDate(workOrder.dueDate)}</strong>
          </div>
          <div>
            <span>Created</span>
            <strong>{formatDate(workOrder.createdAt)}</strong>
          </div>
          <div className="work-order-detail-wide">
            <span>Description</span>
            <strong>{workOrder.description}</strong>
          </div>
        </div>
      </section>

      <section className="module-panel">
        <div className="module-panel-header">
          <div>
            <span className="section-kicker">Progress controls</span>
            <h3>Update status and completion details</h3>
          </div>
          <WorkOrderStatusActions
            currentRole={user?.role ?? 'DRIVER'}
            status={workOrder.status}
            isUpdating={isUpdatingStatus}
            onChangeStatus={handleStatusChange}
          />
        </div>

        <div className="work-order-progress-grid">
          <div>
            <label className="form-label" htmlFor="progressLaborHours">
              Labor hours
            </label>
            <input
              className="form-control"
              id="progressLaborHours"
              type="number"
              min="0"
              step="0.25"
              value={progressValues.laborHours}
              onChange={(event) => updateProgressField('laborHours', event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="progressCost">
              Cost
            </label>
            <input
              className="form-control"
              id="progressCost"
              type="number"
              min="0"
              step="0.01"
              value={progressValues.cost}
              onChange={(event) => updateProgressField('cost', event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="work-order-form-wide">
            <label className="form-label" htmlFor="progressCompletionNotes">
              Completion notes
            </label>
            <textarea
              className="form-control"
              id="progressCompletionNotes"
              rows={3}
              value={progressValues.completionNotes}
              onChange={(event) => updateProgressField('completionNotes', event.target.value)}
              disabled={isSubmitting}
              placeholder="Repair notes, replaced parts, or follow-up work"
            />
          </div>
        </div>

        <div className="vehicle-form-actions">
          <button className="btn btn-success" type="button" onClick={handleProgressUpdate} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save progress'}
          </button>
        </div>
      </section>

      <section className="module-panel">
        <div className="module-panel-header">
          <div>
            <span className="section-kicker">Completion summary</span>
            <h3>Recorded work effort</h3>
          </div>
        </div>
        <div className="vehicle-count-grid">
          <div>
            <span>Labor hours</span>
            <strong>{workOrder.laborHours === null ? 'Not set' : workOrder.laborHours}</strong>
          </div>
          <div>
            <span>Cost</span>
            <strong>{formatMoney(workOrder.cost)}</strong>
          </div>
          <div>
            <span>Notes</span>
            <strong>{workOrder.completionNotes ?? 'Not set'}</strong>
          </div>
        </div>
      </section>

      {isEditing && isAdmin ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Admin edit</span>
              <h3>Update job setup</h3>
            </div>
          </div>
          <WorkOrderForm
            isLoadingOptions={isOptionsLoading}
            isSubmitting={isSubmitting}
            submitLabel="Update work order"
            technicians={technicians}
            values={formValues}
            vehicles={vehicles}
            onCancel={() => {
              setIsEditing(false)
              setFormValues(toWorkOrderFormValues(workOrder))
            }}
            onChange={setFormValues}
            onSubmit={handleAdminUpdate}
          />
        </section>
      ) : null}
    </>
  )
}
