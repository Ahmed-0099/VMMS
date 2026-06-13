import { useEffect, useState } from 'react'
import { StatusBadge } from '../components/common/StatusBadge'
import { getMyActiveAssignment } from '../services/assignmentService'
import type { VehicleAssignment } from '../types/assignment'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatOdometer(value: number | null) {
  return value === null ? 'Not set' : `${value.toLocaleString()} km`
}

export function MyVehicle() {
  const [assignment, setAssignment] = useState<VehicleAssignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadMyVehicle() {
      await Promise.resolve()

      if (isMounted) {
        setIsLoading(true)
        setError('')
      }

      try {
        const response = await getMyActiveAssignment()

        if (isMounted) {
          setAssignment(response.assignment)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load your assigned vehicle.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMyVehicle()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">My vehicle</span>
          <h2 className="dashboard-title">Assigned vehicle</h2>
          <p className="dashboard-subtitle">View the vehicle currently assigned to you for daily fuel logs and fault reporting.</p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger module-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="module-panel my-vehicle-panel">
        {isLoading ? (
          <div className="vehicle-table-state" role="status">
            Loading your assigned vehicle...
          </div>
        ) : assignment ? (
          <>
            <div className="my-vehicle-hero">
              <div>
                <span className="section-kicker">Current assignment</span>
                <h3>{assignment.vehicle.registrationNumber}</h3>
                <p>
                  {assignment.vehicle.make} {assignment.vehicle.model}
                </p>
              </div>
              <StatusBadge label="Active" tone="success" />
            </div>

            <div className="my-vehicle-grid">
              <div>
                <span>Assigned since</span>
                <strong>{formatDate(assignment.startDate)}</strong>
              </div>
              <div>
                <span>Vehicle status</span>
                <strong>{assignment.vehicle.status.replaceAll('_', ' ')}</strong>
              </div>
              <div>
                <span>Current odometer</span>
                <strong>{formatOdometer(assignment.vehicle.currentOdometer)}</strong>
              </div>
              <div>
                <span>Driver profile</span>
                <strong>{assignment.driver.fullName}</strong>
              </div>
              <div>
                <span>License number</span>
                <strong>{assignment.driver.licenseNumber}</strong>
              </div>
              <div>
                <span>Contact</span>
                <strong>{assignment.driver.phone ?? 'Not set'}</strong>
              </div>
            </div>
          </>
        ) : (
          <div className="vehicle-table-state">
            <h3>No active vehicle assigned</h3>
            <p>Your fleet manager has not assigned an active vehicle to your driver profile yet.</p>
          </div>
        )}
      </section>
    </>
  )
}
