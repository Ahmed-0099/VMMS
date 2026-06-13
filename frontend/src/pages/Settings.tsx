import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { SummaryCard } from '../components/SummaryCard'
import type { SummaryCardTone } from '../components/SummaryCard'
import { useAuth } from '../context/AuthContext'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import type { DashboardSummary } from '../hooks/useDashboardSummary'
import type { RoleName } from '../types/auth'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import {
  defaultAdminPreferences,
  defaultUiPreferences,
  loadAdminPreferences,
  loadUiPreferences,
  saveAdminPreferences,
  saveUiPreferences,
} from '../utils/settingsPreferences'
import type { AdminPreferences, DensityPreference, ThemePreference, UiPreferences } from '../utils/settingsPreferences'

type SettingsMetric = {
  label: string
  value: number | string
  tone: SummaryCardTone
  helperText: string
}

const roleLabels: Record<RoleName, string> = {
  ADMIN: 'Fleet Manager',
  TECHNICIAN: 'Technician',
  DRIVER: 'Driver',
}

function getRoleCopy(role: RoleName) {
  if (role === 'TECHNICIAN') {
    return {
      title: 'Maintenance workspace settings',
      subtitle: 'Keep your account secure and tune the workspace used for assigned repair jobs.',
      access: ['Dashboard', 'Assigned work orders', 'Settings'],
    }
  }

  if (role === 'DRIVER') {
    return {
      title: 'Driver workspace settings',
      subtitle: 'Manage your account and keep the driver workspace comfortable for daily fleet updates.',
      access: ['Dashboard', 'My vehicle', 'Fault reports', 'Fuel logs', 'Settings'],
    }
  }

  return {
    title: 'Fleet control settings',
    subtitle: 'Manage your account, workspace preferences, and admin-level VMMS defaults.',
    access: [
      'Dashboard',
      'Vehicles',
      'Drivers',
      'Assignments',
      'Maintenance',
      'Work orders',
      'Documents',
      'Reports',
      'Settings',
    ],
  }
}

function getSummaryMetrics(summary: DashboardSummary | null, role: RoleName): SettingsMetric[] {
  if (summary?.role === 'TECHNICIAN') {
    return [
      {
        label: 'Assigned Jobs',
        value: summary.metrics.assignedWorkOrders,
        tone: 'neutral',
        helperText: 'Work orders connected to your technician account',
      },
      {
        label: 'Due Soon',
        value: summary.metrics.dueAssignedWorkOrders,
        tone: summary.metrics.dueAssignedWorkOrders > 0 ? 'danger' : 'success',
        helperText: 'Assigned jobs due in the next 14 days',
      },
      {
        label: 'Completed',
        value: summary.metrics.completedAssignedWorkOrders,
        tone: 'success',
        helperText: 'Completed or closed assigned jobs',
      },
    ]
  }

  if (summary?.role === 'DRIVER') {
    return [
      {
        label: 'Fault Reports',
        value: summary.metrics.submittedFaultReports,
        tone: 'neutral',
        helperText: 'Reports submitted from your account',
      },
      {
        label: 'Open Reports',
        value: summary.metrics.openFaultReports,
        tone: summary.metrics.openFaultReports > 0 ? 'warning' : 'success',
        helperText: 'Reports waiting for fleet manager review',
      },
      {
        label: 'Closed Reports',
        value: summary.metrics.closedFaultReports,
        tone: 'success',
        helperText: 'Resolved reports from your account',
      },
    ]
  }

  if (summary?.role === 'ADMIN') {
    return [
      {
        label: 'Fleet Records',
        value: summary.metrics.totalVehicles,
        tone: 'neutral',
        helperText: 'Vehicles managed in VMMS',
      },
      {
        label: 'Open Work',
        value: summary.metrics.openWorkOrders,
        tone: summary.metrics.openWorkOrders > 0 ? 'warning' : 'success',
        helperText: 'Work orders needing attention',
      },
      {
        label: 'Document Alerts',
        value: summary.metrics.expiringDocuments,
        tone: summary.metrics.expiringDocuments > 0 ? 'danger' : 'success',
        helperText: 'Expired or expiring compliance documents',
      },
    ]
  }

  return [
    {
      label: 'Current Role',
      value: roleLabels[role],
      tone: 'neutral',
      helperText: 'Access is controlled by your VMMS role',
    },
  ]
}

export function Settings() {
  const { changePassword, updateProfile, user } = useAuth()
  const { data: dashboardSummary, error: dashboardError, isLoading: isDashboardLoading } = useDashboardSummary()
  const role = user?.role ?? 'DRIVER'
  const roleCopy = getRoleCopy(role)
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(() => loadUiPreferences())
  const [adminPreferences, setAdminPreferences] = useState<AdminPreferences>(() => loadAdminPreferences())
  const [preferenceMessage, setPreferenceMessage] = useState('')
  const summaryMetrics = useMemo(
    () => getSummaryMetrics(dashboardSummary, role),
    [dashboardSummary, role],
  )

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileMessage('')
    setProfileError('')
    setIsProfileSaving(true)

    try {
      await updateProfile({ name: profileName })
      setProfileMessage('Profile updated successfully.')
    } catch (apiError) {
      setProfileError(getApiErrorMessage(apiError, 'Unable to update profile.'))
    } finally {
      setIsProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setIsPasswordSaving(true)

    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password updated successfully.')
    } catch (apiError) {
      setPasswordError(getApiErrorMessage(apiError, 'Unable to update password.'))
    } finally {
      setIsPasswordSaving(false)
    }
  }

  function handleUiSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveUiPreferences(uiPreferences)
    setPreferenceMessage('Workspace appearance saved.')
  }

  function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveAdminPreferences(adminPreferences)
    setPreferenceMessage('Admin VMMS preferences saved.')
  }

  function updateAdminPreference<TKey extends keyof AdminPreferences>(key: TKey, value: AdminPreferences[TKey]) {
    setAdminPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value,
    }))
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Settings</span>
          <h2 className="dashboard-title">{roleCopy.title}</h2>
          <p className="dashboard-subtitle">{roleCopy.subtitle}</p>
        </div>
      </div>

      {dashboardError ? (
        <div className="alert alert-warning module-alert" role="alert">
          {dashboardError}
        </div>
      ) : null}

      <section className="settings-hero module-panel">
        <div className="settings-identity">
          <div className="settings-avatar" aria-hidden="true">
            {user?.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('') || 'U'}
          </div>
          <div>
            <span className="section-kicker">Signed in as</span>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="settings-access-list">
          {roleCopy.access.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <div className="dashboard-grid settings-summary-grid">
        {summaryMetrics.map((metric) => (
          <SummaryCard key={metric.label} {...metric} isLoading={isDashboardLoading} />
        ))}
      </div>

      <section className="settings-grid">
        <form className="module-panel settings-panel settings-form" onSubmit={handleProfileSubmit}>
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Account</span>
              <h3>Profile details</h3>
            </div>
          </div>

          {profileMessage ? (
            <div className="alert alert-success module-alert" role="alert">
              {profileMessage}
            </div>
          ) : null}

          {profileError ? (
            <div className="alert alert-danger module-alert" role="alert">
              {profileError}
            </div>
          ) : null}

          <div className="settings-form-grid">
            <div>
              <label className="form-label" htmlFor="settingsName">
                Name
              </label>
              <input
                className="form-control"
                id="settingsName"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="settingsEmail">
                Email
              </label>
              <input className="form-control" id="settingsEmail" value={user?.email ?? ''} readOnly />
            </div>
            <div>
              <label className="form-label" htmlFor="settingsRole">
                Role
              </label>
              <input className="form-control" id="settingsRole" value={roleLabels[role]} readOnly />
            </div>
          </div>

          <div className="vehicle-form-actions">
            <button className="btn btn-success" type="submit" disabled={isProfileSaving}>
              {isProfileSaving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        <form className="module-panel settings-panel settings-form" onSubmit={handlePasswordSubmit}>
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Security</span>
              <h3>Change password</h3>
            </div>
          </div>

          {passwordMessage ? (
            <div className="alert alert-success module-alert" role="alert">
              {passwordMessage}
            </div>
          ) : null}

          {passwordError ? (
            <div className="alert alert-danger module-alert" role="alert">
              {passwordError}
            </div>
          ) : null}

          <div className="settings-form-grid settings-form-grid-single">
            <div>
              <label className="form-label" htmlFor="currentPassword">
                Current password
              </label>
              <input
                className="form-control"
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="newPassword">
                New password
              </label>
              <input
                className="form-control"
                id="newPassword"
                minLength={6}
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                className="form-control"
                id="confirmPassword"
                minLength={6}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="vehicle-form-actions">
            <button className="btn btn-success" type="submit" disabled={isPasswordSaving}>
              {isPasswordSaving ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </section>

      <section className="module-panel settings-panel settings-form">
        <form onSubmit={handleUiSubmit}>
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Workspace</span>
              <h3>Appearance preferences</h3>
            </div>
          </div>

          {preferenceMessage ? (
            <div className="alert alert-success module-alert" role="alert">
              {preferenceMessage}
            </div>
          ) : null}

          <div className="settings-form-grid">
            <div>
              <label className="form-label" htmlFor="themePreference">
                Theme
              </label>
              <select
                className="form-select"
                id="themePreference"
                value={uiPreferences.theme}
                onChange={(event) =>
                  setUiPreferences((currentPreferences) => ({
                    ...currentPreferences,
                    theme: event.target.value as ThemePreference,
                  }))
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="densityPreference">
                Table density
              </label>
              <select
                className="form-select"
                id="densityPreference"
                value={uiPreferences.density}
                onChange={(event) =>
                  setUiPreferences((currentPreferences) => ({
                    ...currentPreferences,
                    density: event.target.value as DensityPreference,
                  }))
                }
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>

          <div className="vehicle-form-actions">
            <button className="btn btn-success" type="submit">
              Save appearance
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setUiPreferences(defaultUiPreferences)
                saveUiPreferences(defaultUiPreferences)
                setPreferenceMessage('Workspace appearance reset.')
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {role === 'ADMIN' ? (
        <form className="module-panel settings-panel settings-form" onSubmit={handleAdminSubmit}>
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Admin defaults</span>
              <h3>Organization and system preferences</h3>
            </div>
          </div>

          <div className="settings-form-grid">
            <div>
              <label className="form-label" htmlFor="organizationName">
                Organization name
              </label>
              <input
                className="form-control"
                id="organizationName"
                value={adminPreferences.organizationName}
                onChange={(event) => updateAdminPreference('organizationName', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="contactEmail">
                Contact email
              </label>
              <input
                className="form-control"
                id="contactEmail"
                type="email"
                value={adminPreferences.contactEmail}
                onChange={(event) => updateAdminPreference('contactEmail', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="contactPhone">
                Contact phone
              </label>
              <input
                className="form-control"
                id="contactPhone"
                value={adminPreferences.contactPhone}
                onChange={(event) => updateAdminPreference('contactPhone', event.target.value)}
              />
            </div>
            <div className="settings-form-wide">
              <label className="form-label" htmlFor="organizationAddress">
                Address
              </label>
              <textarea
                className="form-control"
                id="organizationAddress"
                value={adminPreferences.address}
                onChange={(event) => updateAdminPreference('address', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="expiryWarningDays">
                Document warning days
              </label>
              <input
                className="form-control"
                id="expiryWarningDays"
                min={1}
                type="number"
                value={adminPreferences.expiryWarningDays}
                onChange={(event) => updateAdminPreference('expiryWarningDays', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="maintenanceWarningDays">
                Maintenance warning days
              </label>
              <input
                className="form-control"
                id="maintenanceWarningDays"
                min={1}
                type="number"
                value={adminPreferences.maintenanceWarningDays}
                onChange={(event) => updateAdminPreference('maintenanceWarningDays', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="currencyPreference">
                Currency
              </label>
              <select
                className="form-select"
                id="currencyPreference"
                value={adminPreferences.currency}
                onChange={(event) => updateAdminPreference('currency', event.target.value)}
              >
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="distanceUnit">
                Distance unit
              </label>
              <select
                className="form-select"
                id="distanceUnit"
                value={adminPreferences.distanceUnit}
                onChange={(event) => updateAdminPreference('distanceUnit', event.target.value)}
              >
                <option value="KM">KM</option>
                <option value="MI">MI</option>
              </select>
            </div>
            <div className="settings-form-wide">
              <label className="form-label" htmlFor="reportFooter">
                Report footer
              </label>
              <input
                className="form-control"
                id="reportFooter"
                value={adminPreferences.reportFooter}
                onChange={(event) => updateAdminPreference('reportFooter', event.target.value)}
              />
            </div>
          </div>

          <div className="vehicle-form-actions">
            <button className="btn btn-success" type="submit">
              Save admin preferences
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setAdminPreferences(defaultAdminPreferences)
                saveAdminPreferences(defaultAdminPreferences)
                setPreferenceMessage('Admin VMMS preferences reset.')
              }}
            >
              Reset
            </button>
          </div>
        </form>
      ) : null}
    </>
  )
}
