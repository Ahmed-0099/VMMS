# Implementation Plan: Dashboard Layout

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: premium dashboard shell, sidebar/topbar layout, role-based summary cards, basic alerts, and API-driven dashboard counts.

## 1. DB RELATED CHANGES

- No new tables are required if these models already exist:
  - `Vehicle`
  - `Driver`
  - `WorkOrder`
  - `FuelLog`
  - `ComplianceDocument`
  - `FaultReport`
  - `MaintenanceSchedule`
- Confirm `backend/prisma/schema.prisma` has indexes for common dashboard queries:
  - `Vehicle.status`
  - `Driver.status`
  - `WorkOrder.status`
  - `FuelLog.date`
  - `ComplianceDocument.status`
  - `ComplianceDocument.expiryDate`
  - `FaultReport.status`
  - `MaintenanceSchedule.status`
- Do not add real-time notifications or background jobs in the current semester scope.
- Dashboard alerts should be calculated from existing records.
- No new user-driver linking table is required in this step.
  - Technician metrics can safely use `WorkOrder.technicianId`.
  - Driver metrics can safely use `FaultReport.reporterId` until Driver CRUD/assignment adds deeper profile links.

## 2. BACKEND RELATED CHANGES

- Update `backend/src/routes/dashboardRoutes.js`.
  - Keep `GET /api/dashboard/summary`.
  - Keep the route thin and delegate summary calculation to the controller/service.

- Dashboard summary should calculate:
    - total vehicles
    - active vehicles
    - vehicles in maintenance
    - total drivers
    - open work orders
    - completed work orders
    - fuel cost this month
    - expiring/expired documents
    - new fault reports
    - due maintenance schedules

- Create `backend/src/controllers/dashboardController.js`.
  - Move dashboard logic out of route file.
  - Export `getSummary(req, res, next)`.

- Create `backend/src/services/dashboardService.js`.
  - `getDashboardSummary(user)`.
  - Use Prisma `count`, `aggregate`, and date filtering.
  - Calculate current month using JavaScript Date.
  - Return different metrics according to authenticated role:
    - Admin/Fleet Manager:
      - total vehicles
      - active vehicles
      - vehicles in maintenance
      - total drivers
      - open work orders
      - completed work orders
      - fuel cost this month
      - expiring/expired documents
      - new fault reports
      - due maintenance schedules
    - Technician:
      - assigned work orders
      - open assigned work orders
      - in-progress work orders
      - completed assigned work orders
      - urgent assigned work orders
      - due assigned work orders
    - Driver:
      - submitted fault reports
      - open fault reports
      - reviewed fault reports
      - converted fault reports
      - closed fault reports

- Update `backend/src/routes/dashboardRoutes.js`.
  - Import controller.
  - Use `router.get("/summary", getSummary);`

- Apply auth protection:
  - Add `authMiddleware` after Auth implementation exists.
  - `GET /api/dashboard/summary` should be available to authenticated roles.

- Response shape:

```js
{
  role,
  metrics
}
```

Admin example:

```js
{
  role: "ADMIN",
  metrics: {
    totalVehicles,
    activeVehicles,
    vehiclesInMaintenance,
    totalDrivers,
    openWorkOrders,
    completedWorkOrders,
    fuelCostThisMonth,
    expiringDocuments,
    newFaultReports,
    dueMaintenanceSchedules
  }
}
```

Technician example:

```js
{
  role: "TECHNICIAN",
  metrics: {
    assignedWorkOrders,
    openAssignedWorkOrders,
    inProgressWorkOrders,
    completedAssignedWorkOrders,
    urgentAssignedWorkOrders,
    dueAssignedWorkOrders
  }
}
```

Driver example:

```js
{
  role: "DRIVER",
  metrics: {
    submittedFaultReports,
    openFaultReports,
    reviewedFaultReports,
    convertedFaultReports,
    closedFaultReports
  }
}
```

- Test in Postman:
  - Empty database should return role-specific zero metrics.
  - Seeded records should update counts.
  - Admin, Technician, and Driver tokens should receive different dashboard payloads.

## 3. FRONTEND RELATED CHANGES

- Update `frontend/src/components/AppLayout.tsx`.
  - Keep sidebar navigation.
  - Add a premium topbar in the main content area:
    - page title
    - current user
    - role badge
    - logout action
  - Sidebar should collapse or stack cleanly on tablet/mobile.

- Create `frontend/src/components/Sidebar.tsx`.
  - Move nav logic out of `AppLayout`.
  - Use `NavLink` active states.
  - Use consistent labels:
    - Dashboard
    - Vehicles
    - Drivers
    - Assignments
    - Maintenance
    - Work Orders
    - Fault Reports
    - Fuel Logs
    - Documents
    - Reports
    - Settings

- Create `frontend/src/components/Topbar.tsx`.
  - Display page context and user role.

- Create `frontend/src/components/SummaryCard.tsx`.
  - Props:
    - `label`
    - `value`
    - `tone`
    - `helperText`
  - Tones:
    - neutral
    - success
    - warning
    - danger

- Create `frontend/src/hooks/useDashboardSummary.ts`.
  - Fetch `/api/dashboard/summary`.
  - Return:
    - `data`
    - `isLoading`
    - `error`
    - `reload`

- Update `frontend/src/pages/Dashboard.tsx`.
  - Replace static cards with API-driven cards.
  - Render different dashboard cards and page copy by role:
    - Admin: full fleet health overview.
    - Technician: assigned maintenance queue.
    - Driver: own fault report activity.
  - Show skeleton/loading states.
  - Show error alert if backend is unavailable.
  - Add a compact "Attention Needed" section with role-specific alerts:
    - Admin: expiring documents, due maintenance, new fault reports, open work orders.
    - Technician: urgent assigned jobs, due assigned jobs, open assigned jobs.
    - Driver: open fault reports, reviewed reports, converted reports.

- Create/update `frontend/src/App.css`.
  - Premium visual direction:
    - clean white surfaces
    - subtle borders
    - soft shadows
    - deep navy/green accent
    - clear spacing
    - responsive grid
  - Avoid loud gradients and oversized hero sections.
  - Keep admin dashboard dense but readable.
  - Ensure the sidebar white panel covers the complete navigation list, including Reports and Settings.
  - Sidebar should use full-height styling on desktop and horizontal scrolling navigation on tablet/mobile.

- Optional chart:
  - Create `frontend/src/components/charts/WorkOrderStatusChart.tsx`.
  - Use Chart.js or Recharts after reports data exists.

- Acceptance checks:
  - Dashboard looks polished on desktop and mobile.
  - Summary cards load from backend.
  - Dashboard content is role-based:
    - Admin does not share the exact same dashboard cards with Technician and Driver.
    - Technician sees maintenance-focused metrics.
    - Driver sees driver/fault-report-focused metrics.
  - Empty database still displays professionally.
  - Sidebar active states work.
  - No text overflow in cards or navigation.
  - Sidebar background includes the full menu down to Settings.
