# Implementation Plan: Driver CRUD

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: add, list, view, edit, and delete/mark inactive drivers.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `Driver`.
- Required fields:
  - `id`
  - `fullName`
  - `cnic`
  - `licenseNumber`
  - `licenseExpiry`
  - `phone`
  - `address`
  - `status`
  - `createdAt`
  - `updatedAt`
- Required enum:
  - `DriverStatus`
    - `ACTIVE`
    - `INACTIVE`
- Relationships:
  - `Driver` has many `VehicleAssignment`
  - `Driver` has many `FuelLog`
  - `Driver` has many `FaultReport`
- Constraints/indexes:
  - `licenseNumber` unique.
  - `cnic` unique if provided.
  - index on `status`.
- If changes are needed:

```powershell
cd backend
npm run prisma:migrate -- --name driver_crud
npm run prisma:generate
```

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/driverController.js`.
  - `listDrivers(req, res, next)`
    - Query params:
      - `search`
      - `status`
  - `getDriverById(req, res, next)`
    - Include current assignment if useful.
  - `createDriver(req, res, next)`
    - Validate required fields.
    - Check duplicate license number.
  - `updateDriver(req, res, next)`
  - `deleteDriver(req, res, next)`
    - Prefer marking inactive if active assignments exist.

- Create `backend/src/services/driverService.js`.
  - `findDrivers(filters)`
  - `findDriverById(id)`
  - `createDriver(data)`
  - `updateDriver(id, data)`
  - `deleteDriver(id)`

- Create `backend/src/routes/driverRoutes.js`.
  - `GET /api/drivers`
  - `POST /api/drivers`
  - `GET /api/drivers/:id`
  - `PUT /api/drivers/:id`
  - `DELETE /api/drivers/:id`

- Update `backend/src/app.js`.
  - Add `app.use("/api/drivers", driverRoutes);`

- Role protection:
  - `ADMIN`: full access.
  - `DRIVER`: no list access unless future profile support is added.
  - `TECHNICIAN`: no access needed in Phase 1.

- Test in Postman:
  - Create driver.
  - Duplicate license number returns error.
  - List/search drivers.
  - Edit driver.
  - Mark inactive or delete.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/driver.ts`.
  - `DriverStatus`
  - `Driver`
  - `DriverFormValues`
  - `DriverFilters`

- Create `frontend/src/services/driverService.ts`.
  - `getDrivers(filters)`
  - `getDriver(id)`
  - `createDriver(values)`
  - `updateDriver(id, values)`
  - `deleteDriver(id)`

- Create `frontend/src/hooks/useDrivers.ts`.
  - Manage list loading, search, filters, error, and reload.

- Create `frontend/src/pages/Drivers.tsx`.
  - Header with Add Driver action.
  - Search by name, CNIC, phone, or license number.
  - Filter by status.
  - Driver table.

- Create `frontend/src/pages/DriverDetail.tsx`.
  - Driver profile.
  - License expiry information.
  - Current/previous assignments later.

- Create `frontend/src/components/drivers/DriverForm.tsx`.
  - Fields:
    - full name
    - CNIC
    - license number
    - license expiry date
    - phone
    - address
    - status

- Create `frontend/src/components/drivers/DriverTable.tsx`.
  - Columns:
    - name
    - license number
    - license expiry
    - phone
    - status
    - actions

- Add expiry visual rules:
  - Expired license: danger badge.
  - Expiring within 30 days: warning badge.
  - Valid: success or neutral.

- Update `frontend/src/App.tsx`.
  - Route `/drivers`.
  - Route `/drivers/:id`.

- Premium UI requirements:
  - Driver profile should look like a clean operations record.
  - Use concise badges and well-spaced form fields.
  - Use clear empty states for no drivers.
  - Do not show too many decorative cards; keep it practical and polished.

- Acceptance checks:
  - Create driver from UI.
  - Driver appears in list.
  - Search/filter works.
  - Edit updates backend and UI.
  - License expiry status is visible.
