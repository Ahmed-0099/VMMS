import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { RoleName } from '../types/auth'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const roleOptions: Array<{ value: RoleName; label: string; helper: string }> = [
  { value: 'ADMIN', label: 'Fleet Manager', helper: 'Full access to fleet operations' },
  { value: 'TECHNICIAN', label: 'Technician', helper: 'Assigned work order workflow' },
  { value: 'DRIVER', label: 'Driver', helper: 'Fault reports and fuel logs' },
]

export function Register() {
  const { isAuthenticated, isLoading, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleName, setRoleName] = useState<RoleName>('ADMIN')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({ name, email, password, roleName })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Registration failed. Please check the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <span className="auth-kicker">Start VMMS</span>
          <h1>Create a focused fleet account</h1>
          <p>
            Set up your fleet workspace to manage vehicles, drivers, maintenance activity, fuel records, and compliance tasks.
          </p>
          <div className="auth-proof-grid">
            <div>
              <strong>Vehicles</strong>
              <span>Registry</span>
            </div>
            <div>
              <strong>Work Orders</strong>
              <span>Tracking</span>
            </div>
            <div>
              <strong>Drivers</strong>
              <span>Assignments</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="mb-4">
            <h2 className="h3 mb-2">Create account</h2>
            <p className="text-secondary mb-0">Choose the role that matches your project demo user.</p>
          </div>

          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="name">
                Full name
              </label>
              <input
                className="form-control form-control-lg"
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ahmed Khan"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                className="form-control form-control-lg"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@vmms.local"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-control form-control-lg"
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="roleName">
                Role
              </label>
              <select
                className="form-select form-select-lg"
                id="roleName"
                value={roleName}
                onChange={(event) => setRoleName(event.target.value as RoleName)}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.helper}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-success btn-lg w-100" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch text-secondary">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
