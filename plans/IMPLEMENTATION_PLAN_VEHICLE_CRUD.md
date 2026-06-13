# Implementation Plan: Vehicle CRUD

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: Admin-managed vehicle registry with add, view, search/filter, detail, edit, and delete/soft-delete vehicles. Technician and Driver vehicle visibility should stay scoped through assigned work orders or assigned vehicle flows, not the full vehicle registry.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `Vehicle`.
- Required fields:
  - `id`
  - `registrationNumber`
  - `make`
  - `model`
  - `year`
  - `vin`
  - `fuelType`
  - `category`
  - `currentOdometer`
  - `status`
  - `createdAt`
  - `updatedAt`
- Required enum:
  - `VehicleStatus`
    - `ACTIVE`
    - `IN_MAINTENANCE`
    - `OUT_OF_SERVICE`
- Relationships:
  - `Vehicle` has many `VehicleAssignment`
  - `Vehicle` has many `MaintenanceSchedule`
  - `Vehicle` has many `WorkOrder`
  - `Vehicle` has many `FaultReport`
  - `Vehicle` has many `FuelLog`
  - `Vehicle` has many `ComplianceDocument`
- Constraints/indexes:
  - `registrationNumber` unique.
  - `vin` unique if provided.
  - index on `status`.
- If changes are needed:

```powershell
cd backend
npm run prisma:migrate -- --name vehicle_crud
npm run prisma:generate
```

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/vehicleController.js`.
  - `listVehicles(req, res, next)`
    - Support query params:
      - `search`
      - `status`
      - `fuelType`
      - `category`
    - Return sorted list, newest first or registration ascending.
  - `getVehicleById(req, res, next)`
    - Include related latest assignment count or basic relationships if needed.
  - `createVehicle(req, res, next)`
    - Validate required fields.
    - Check duplicate registration number.
  - `updateVehicle(req, res, next)`
    - Validate and update allowed fields.
  - `deleteVehicle(req, res, next)`
    - For the current semester scope, prefer delete only if no related records.
    - If related records exist, return clear error asking to change status instead.

- Create `backend/src/services/vehicleService.js`.
  - Keep Prisma queries here.
  - Functions:
    - `findVehicles(filters)`
    - `findVehicleById(id)`
    - `createVehicle(data)`
    - `updateVehicle(id, data)`
    - `deleteVehicle(id)`

- Create `backend/src/routes/vehicleRoutes.js`.
  - `GET /api/vehicles`
  - `POST /api/vehicles`
  - `GET /api/vehicles/:id`
  - `PUT /api/vehicles/:id`
  - `DELETE /api/vehicles/:id`

- Create `backend/src/utils/vehicleStatus.js`.
  - Convert UI labels to enum values if needed.

- Update `backend/src/app.js`.
  - Add `app.use("/api/vehicles", vehicleRoutes);`

- Add auth/role protection:
  - `ADMIN`: full access to list, detail, create, update, and delete/soft-delete.
  - `TECHNICIAN`: no full vehicle registry access; vehicle context should come through assigned work order detail if needed.
  - `DRIVER`: no full vehicle registry access; assigned vehicle view should come through `VehicleAssignment` after the driver profile link exists.
  - Never allow `TECHNICIAN` or `DRIVER` to create, edit, or delete vehicles.

- Test in Postman:
  - Create vehicle.
  - List vehicles.
  - Search by registration number.
  - Filter by status.
  - Edit vehicle.
  - Delete vehicle with no relations.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/vehicle.ts`.
  - `VehicleStatus`
  - `Vehicle`
  - `VehicleFormValues`
  - `VehicleFilters`

- Create `frontend/src/services/vehicleService.ts`.
  - `getVehicles(filters)`
  - `getVehicle(id)`
  - `createVehicle(values)`
  - `updateVehicle(id, values)`
  - `deleteVehicle(id)`

- Create `frontend/src/hooks/useVehicles.ts`.
  - Manage list loading, filters, error, and reload.

- Create `frontend/src/pages/Vehicles.tsx`.
  - Premium list screen:
    - page header
    - Add Vehicle button
    - search input
    - status filter
    - responsive table
    - empty state
    - loading state

- Create `frontend/src/pages/VehicleDetail.tsx`.
  - Show vehicle overview.
  - Show status badge.
  - Show key fields in compact detail cards.
  - Later show related work orders/fuel/documents.

- Create `frontend/src/components/vehicles/VehicleForm.tsx`.
  - Fields:
    - registration number
    - make
    - model
    - year
    - VIN/chassis number
    - fuel type
    - category
    - current odometer
    - status
  - Use labels and required validation.
  - Use Bootstrap form controls with polished spacing.

- Create `frontend/src/components/vehicles/VehicleTable.tsx`.
  - Columns:
    - registration
    - make/model
    - category
    - fuel type
    - odometer
    - status
    - actions
  - Use status badges:
    - Active: success
    - In Maintenance: warning
    - Out of Service: danger

- Create `frontend/src/components/common/StatusBadge.tsx`.
  - Reusable across modules.

- Update `frontend/src/App.tsx`.
  - Route `/vehicles`.
  - Route `/vehicles/:id`.
  - Wrap both routes with `RoleGuard` for `ADMIN` only.
  - Do not show Add/Edit/Delete actions for non-admin users.

- Premium UI requirements:
  - Vehicle list should feel like a modern admin dashboard, not a plain HTML table.
  - Use a clear toolbar, compact filters, polished table rows, and action buttons.
  - On mobile, table should scroll horizontally or transform into stacked cards.
  - Avoid oversized cards for every vehicle on desktop unless intentionally responsive.

- Acceptance checks:
  - Create vehicle from UI.
  - Vehicle appears in list.
  - Search/filter works.
  - Edit updates backend and UI.
  - Status badge colors are correct.
  - Non-admin users cannot open vehicle registry routes or call vehicle write APIs.
