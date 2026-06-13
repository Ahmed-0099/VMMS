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
- Keep fraud detection and fuel card integration out of the current semester scope.
- For Driver-role scoping, use the optional `Driver.userId` relation introduced in Driver CRUD.

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/fuelLogController.js`.
  - `listFuelLogs(req, res, next)`
    - Query params:
      - `vehicleId`
      - `driverId`
      - `from`
      - `to`
    - `ADMIN`: can filter all logs.
    - `DRIVER`: force filters to the logged-in user's linked driver profile.
  - `createFuelLog(req, res, next)`
    - Validate vehicle exists.
    - Validate quantity and unit cost are positive.
    - Calculate `totalAmount = quantity * unitCost` on backend.
    - `DRIVER`: resolve linked driver profile and active assignment; do not accept arbitrary `driverId`.
    - `DRIVER`: only allow vehicle equal to their active assignment unless Admin creates on their behalf.
  - `updateFuelLog(req, res, next)`
    - Recalculate total amount if quantity/unit cost changes.
    - `DRIVER`: update only own fuel logs.
  - `deleteFuelLog(req, res, next)`
    - `DRIVER`: delete only own fuel logs if delete is allowed; otherwise prefer edit-only for driver records.

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
  - `DRIVER`: create and view own fuel logs for assigned vehicle after `Driver.userId` and active assignment exist.
  - `TECHNICIAN`: no access needed.
  - Never allow Driver users to submit logs for another driver or another vehicle.

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
  - Admin view: all logs, vehicle/date filters, driver column, edit/delete controls.
  - Driver view: quick add form and own fuel history; vehicle should default to assigned vehicle and driver select should be hidden.

- Create `frontend/src/components/fuelLogs/FuelLogForm.tsx`.
  - Vehicle select.
  - Driver select optional.
  - Date.
  - Fuel type.
  - Quantity.
  - Unit cost.
  - Odometer reading.
  - Show calculated total live.
  - For Driver users, hide driver select and lock vehicle to assigned vehicle.

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
  - Driver can only create/view logs for their own assigned vehicle.
  - Technician cannot access fuel log routes.
