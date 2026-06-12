# Implementation Plan: Fuel Logs

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: add fuel logs, list/filter fuel logs, calculate total amount, and support simple fuel reporting.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `FuelLog`.
- Required fields:
  - `id`
  - `vehicleId`
  - `driverId`
  - `date`
  - `fuelType`
  - `quantity`
  - `unitCost`
  - `totalAmount`
  - `odometerReading`
  - `createdAt`
  - `updatedAt`
- Relationships:
  - Fuel log belongs to vehicle.
  - Fuel log optionally belongs to driver.
- Indexes:
  - `vehicleId`
  - `date`
- Keep fraud detection and fuel card integration out of Phase 1.

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/fuelLogController.js`.
  - `listFuelLogs(req, res, next)`
    - Query params:
      - `vehicleId`
      - `driverId`
      - `from`
      - `to`
  - `createFuelLog(req, res, next)`
    - Validate vehicle exists.
    - Validate quantity and unit cost are positive.
    - Calculate `totalAmount = quantity * unitCost` on backend.
  - `updateFuelLog(req, res, next)`
    - Recalculate total amount if quantity/unit cost changes.
  - `deleteFuelLog(req, res, next)`

- Create `backend/src/services/fuelLogService.js`.
  - `findFuelLogs(filters)`
  - `createFuelLog(data)`
  - `updateFuelLog(id, data)`
  - `deleteFuelLog(id)`
  - `getFuelSummary(filters)`

- Create `backend/src/routes/fuelLogRoutes.js`.
  - `GET /api/fuel-logs`
  - `POST /api/fuel-logs`
  - `PUT /api/fuel-logs/:id`
  - `DELETE /api/fuel-logs/:id`

- Update `backend/src/app.js`.
  - Add `app.use("/api/fuel-logs", fuelLogRoutes);`

- Role protection:
  - `ADMIN`: full access.
  - `DRIVER`: create fuel logs, view own/assigned vehicle logs if implemented.
  - `TECHNICIAN`: no access needed.

- Test in Postman:
  - Create fuel log.
  - Confirm backend calculates total amount.
  - Filter by vehicle and date range.
  - Update quantity/unit cost and confirm recalculation.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/fuelLog.ts`.
  - `FuelLog`
  - `FuelLogFormValues`
  - `FuelLogFilters`

- Create `frontend/src/services/fuelLogService.ts`.
  - `getFuelLogs(filters)`
  - `createFuelLog(values)`
  - `updateFuelLog(id, values)`
  - `deleteFuelLog(id)`

- Create `frontend/src/hooks/useFuelLogs.ts`.
  - Load fuel logs.
  - Manage date/vehicle filters.
  - Calculate frontend summary using `reduce` for display.

- Create `frontend/src/pages/FuelLogs.tsx`.
  - Header with Add Fuel Log button.
  - Summary cards:
    - total fuel quantity
    - total fuel cost
    - average unit cost
  - Filters:
    - vehicle
    - date range
  - Fuel log table.

- Create `frontend/src/components/fuelLogs/FuelLogForm.tsx`.
  - Vehicle select.
  - Driver select optional.
  - Date.
  - Fuel type.
  - Quantity.
  - Unit cost.
  - Odometer reading.
  - Show calculated total live.

- Create `frontend/src/components/fuelLogs/FuelLogTable.tsx`.
  - Columns:
    - date
    - vehicle
    - driver
    - quantity
    - unit cost
    - total
    - odometer
    - actions

- Premium UI requirements:
  - Use financial formatting for PKR values.
  - Use compact summary cards above the table.
  - Fuel form should feel like a quick-entry operations form.
  - Date and number fields must align cleanly on desktop and stack on mobile.

- Acceptance checks:
  - Add fuel log from UI.
  - Total amount calculates live and backend confirms it.
  - Filters work.
  - Summary cards update after create/edit/delete.
