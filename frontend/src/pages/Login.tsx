import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

type LocationState = {
  from?: {
    pathname?: string
  }
  registered?: boolean
}

export function Login() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const destination = state?.from?.pathname ?? '/dashboard'

  useEffect(() => {
    if (state?.registered) {
      setEmail('')
      setPassword('')
    }
  }, [state?.registered])

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(destination, { replace: true })
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Login failed. Please check your email and password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <span className="auth-kicker">VMMS Workspace</span>
          <h1>Sign in to your fleet workspace</h1>
          <p>
            Manage vehicles, drivers, work orders, fuel logs, and compliance records from one focused dashboard.
          </p>
          <div className="auth-proof-grid">
            <div>
              <strong>Fleet</strong>
              <span>Overview</span>
            </div>
            <div>
              <strong>Maintenance</strong>
              <span>Control</span>
            </div>
            <div>
              <strong>Compliance</strong>
              <span>Tracking</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="mb-4">
            <h2 className="h3 mb-2">Welcome back</h2>
            <p className="text-secondary mb-0">Use your email and password to continue.</p>
          </div>

          {state?.registered ? (
            <div className="alert alert-success" role="alert">
              Account created successfully. Please sign in.
            </div>
          ) : null}

          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
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

            <div className="mb-4">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-control form-control-lg"
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button className="btn btn-success btn-lg w-100" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch text-secondary">
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
