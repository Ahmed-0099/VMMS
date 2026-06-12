# Implementation Plan: Dashboard Layout

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: premium dashboard shell, sidebar/topbar layout, summary cards, basic alerts, and starter API-driven dashboard counts.

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
- Do not add real-time notifications or background jobs in Phase 1.
- Dashboard alerts should be calculated from existing records.

## 2. BACKEND RELATED CHANGES

- Update `backend/src/routes/dashboardRoutes.js`.
  - Keep `GET /api/dashboard/summary`.
  - Add clean query logic for:
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
  - `getDashboardSummary()`.
  - Use Prisma `count`, `aggregate`, and date filtering.
  - Calculate current month using JavaScript Date.

- Update `backend/src/routes/dashboardRoutes.js`.
  - Import controller.
  - Use `router.get("/summary", getSummary);`

- Apply auth protection:
  - Add `authMiddleware` after Auth implementation exists.
  - `GET /api/dashboard/summary` should be available to authenticated roles.

- Response shape:

```js
{
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
```

- Test in Postman:
  - Empty database should return zeros.
  - Seeded records should update counts.

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
  - Show skeleton/loading states.
  - Show error alert if backend is unavailable.
  - Add a compact "Attention Needed" section:
    - expiring documents
    - due maintenance
    - new fault reports
    - open work orders

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

- Optional chart:
  - Create `frontend/src/components/charts/WorkOrderStatusChart.tsx`.
  - Use Chart.js or Recharts after reports data exists.

- Acceptance checks:
  - Dashboard looks polished on desktop and mobile.
  - Summary cards load from backend.
  - Empty database still displays professionally.
  - Sidebar active states work.
  - No text overflow in cards or navigation.
