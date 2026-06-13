import { SummaryCard } from '../components/SummaryCard'
import type { SummaryCardTone } from '../components/SummaryCard'
import { useAuth } from '../context/AuthContext'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import type { DashboardSummary } from '../hooks/useDashboardSummary'
import type { RoleName } from '../types/auth'

type DashboardCardConfig = {
  label: string
  value: string | number
  tone: SummaryCardTone
  helperText: string
}

type AttentionItemConfig = {
  label: string
  value: number
  tone: 'warning' | 'danger'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    currency: 'PKR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function getEmptySummary(role: RoleName): DashboardSummary {
  if (role === 'TECHNICIAN') {
    return {
      role,
      metrics: {
        assignedWorkOrders: 0,
        completedAssignedWorkOrders: 0,
        dueAssignedWorkOrders: 0,
        inProgressWorkOrders: 0,
        openAssignedWorkOrders: 0,
        urgentAssignedWorkOrders: 0,
      },
    }
  }

  if (role === 'DRIVER') {
    return {
      role,
      metrics: {
        closedFaultReports: 0,
        convertedFaultReports: 0,
        openFaultReports: 0,
        reviewedFaultReports: 0,
        submittedFaultReports: 0,
      },
    }
  }

  return {
    role: 'ADMIN',
    metrics: {
      activeVehicles: 0,
      completedWorkOrders: 0,
      dueMaintenanceSchedules: 0,
      expiringDocuments: 0,
      fuelCostThisMonth: 0,
      newFaultReports: 0,
      openWorkOrders: 0,
      totalDrivers: 0,
      totalVehicles: 0,
      vehiclesInMaintenance: 0,
    },
  }
}

function getDashboardCopy(role: RoleName) {
  if (role === 'TECHNICIAN') {
    return {
      kicker: 'Technician workspace',
      title: 'Your maintenance queue',
      subtitle: 'Focus on assigned work orders, urgent jobs, due dates, and repair progress.',
      panelTitle: 'Work needing attention',
    }
  }

  if (role === 'DRIVER') {
    return {
      kicker: 'Driver workspace',
      title: 'Your vehicle activity',
      subtitle: 'Track your submitted fault reports and the status of issues raised from your account.',
      panelTitle: 'Driver follow-up',
    }
  }

  return {
    kicker: 'Operations overview',
    title: 'Fleet health at a glance',
    subtitle: 'Track vehicles, drivers, maintenance work, fuel spend, and compliance alerts from one place.',
    panelTitle: 'Priority queue',
  }
}

function getDashboardCards(summary: DashboardSummary): DashboardCardConfig[] {
  if (summary.role === 'TECHNICIAN') {
    const metrics = summary.metrics

    return [
      { label: 'Assigned Work Orders', value: metrics.assignedWorkOrders, tone: 'neutral', helperText: 'Jobs assigned to you' },
      { label: 'Open Jobs', value: metrics.openAssignedWorkOrders, tone: 'warning', helperText: 'Open, active, or pending parts' },
      { label: 'In Progress', value: metrics.inProgressWorkOrders, tone: 'warning', helperText: 'Currently being worked on' },
      { label: 'Completed Jobs', value: metrics.completedAssignedWorkOrders, tone: 'success', helperText: 'Work orders completed by you' },
      { label: 'Urgent Jobs', value: metrics.urgentAssignedWorkOrders, tone: metrics.urgentAssignedWorkOrders > 0 ? 'danger' : 'success', helperText: 'Urgent assigned work orders' },
      { label: 'Due Soon', value: metrics.dueAssignedWorkOrders, tone: metrics.dueAssignedWorkOrders > 0 ? 'danger' : 'success', helperText: 'Due within the next 14 days' },
    ]
  }

  if (summary.role === 'DRIVER') {
    const metrics = summary.metrics

    return [
      { label: 'Submitted Fault Reports', value: metrics.submittedFaultReports, tone: 'neutral', helperText: 'Reports submitted from your account' },
      { label: 'Open Reports', value: metrics.openFaultReports, tone: metrics.openFaultReports > 0 ? 'warning' : 'success', helperText: 'New reports waiting for review' },
      { label: 'Reviewed Reports', value: metrics.reviewedFaultReports, tone: 'neutral', helperText: 'Reports checked by fleet manager' },
      { label: 'Converted Reports', value: metrics.convertedFaultReports, tone: 'success', helperText: 'Issues converted into work orders' },
      { label: 'Closed Reports', value: metrics.closedFaultReports, tone: 'success', helperText: 'Resolved driver reports' },
    ]
  }

  const metrics = summary.metrics

  return [
    { label: 'Total Vehicles', value: metrics.totalVehicles, tone: 'neutral', helperText: 'Fleet records in the system' },
    { label: 'Active Vehicles', value: metrics.activeVehicles, tone: 'success', helperText: 'Ready for assignments' },
    { label: 'In Maintenance', value: metrics.vehiclesInMaintenance, tone: 'warning', helperText: 'Currently under service' },
    { label: 'Total Drivers', value: metrics.totalDrivers, tone: 'neutral', helperText: 'Driver profiles available' },
    { label: 'Open Work Orders', value: metrics.openWorkOrders, tone: 'warning', helperText: 'Jobs needing attention' },
    { label: 'Completed Orders', value: metrics.completedWorkOrders, tone: 'success', helperText: 'Finished maintenance jobs' },
    { label: 'Fuel Cost This Month', value: formatCurrency(metrics.fuelCostThisMonth), tone: 'neutral', helperText: 'Fuel spend from saved logs' },
    { label: 'Expiring Documents', value: metrics.expiringDocuments, tone: metrics.expiringDocuments > 0 ? 'danger' : 'success', helperText: 'Expired or due within 30 days' },
  ]
}

function getAttentionItems(summary: DashboardSummary): AttentionItemConfig[] {
  if (summary.role === 'TECHNICIAN') {
    return [
      { label: 'Urgent assigned jobs', value: summary.metrics.urgentAssignedWorkOrders, tone: 'danger' },
      { label: 'Due assigned jobs', value: summary.metrics.dueAssignedWorkOrders, tone: 'warning' },
      { label: 'Open assigned jobs', value: summary.metrics.openAssignedWorkOrders, tone: 'warning' },
    ]
  }

  if (summary.role === 'DRIVER') {
    return [
      { label: 'Open fault reports', value: summary.metrics.openFaultReports, tone: 'warning' },
      { label: 'Reviewed reports', value: summary.metrics.reviewedFaultReports, tone: 'warning' },
      { label: 'Converted reports', value: summary.metrics.convertedFaultReports, tone: 'danger' },
    ]
  }

  return [
    { label: 'Expiring documents', value: summary.metrics.expiringDocuments, tone: 'danger' },
    { label: 'Due maintenance', value: summary.metrics.dueMaintenanceSchedules, tone: 'warning' },
    { label: 'New fault reports', value: summary.metrics.newFaultReports, tone: 'danger' },
    { label: 'Open work orders', value: summary.metrics.openWorkOrders, tone: 'warning' },
  ]
}

export function Dashboard() {
  const { user } = useAuth()
  const { data, error, isLoading, reload } = useDashboardSummary()
  const role = user?.role ?? 'ADMIN'
  const summary = data ?? getEmptySummary(role)
  const dashboardCopy = getDashboardCopy(summary.role)
  const summaryCards = getDashboardCards(summary)
  const attentionItems = getAttentionItems(summary)

  const hasAttentionItems = attentionItems.some((item) => item.value > 0)

  return (
    <>
      <div className="dashboard-header">
        <div>
          <span className="section-kicker">{dashboardCopy.kicker}</span>
          <h2 className="dashboard-title">{dashboardCopy.title}</h2>
          <p className="dashboard-subtitle">{dashboardCopy.subtitle}</p>
        </div>
        <button type="button" className="btn btn-success dashboard-refresh" onClick={reload} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="alert alert-danger dashboard-alert" role="alert">
          {error}
        </div>
      ) : null}

      <div className="dashboard-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </div>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="section-kicker">Attention needed</span>
            <h3>{dashboardCopy.panelTitle}</h3>
          </div>
          <span className={`attention-status ${hasAttentionItems ? 'attention-status-active' : 'attention-status-clear'}`}>
            {hasAttentionItems ? 'Review required' : 'All clear'}
          </span>
        </div>

        <div className="attention-list">
          {attentionItems.map((item) => (
            <div className="attention-item" key={item.label}>
              <div>
                <div className="attention-label">{item.label}</div>
                <div className="attention-helper">{item.value > 0 ? 'Needs follow-up in VMMS' : 'No pending items'}</div>
              </div>
              <span className={`attention-count attention-${item.tone}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
