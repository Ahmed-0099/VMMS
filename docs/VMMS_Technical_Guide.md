# VMMS Technical Guide

This document explains the technical structure of the Vehicle Maintenance Management System. It is written for a technical evaluator, teammate, or student preparing for demo questions.

The guide covers:

- Frontend architecture.
- Backend architecture.
- Database design.
- Authentication and role-based access.
- Module logic.
- API flow.
- Important technical decisions.
- Common technical questions and answers.

## 1. System Overview

VMMS is a full-stack web application.

The system has three main parts:

```text
React Frontend  ->  Express REST API  ->  PostgreSQL Database
```

The frontend is responsible for:

- Showing pages and forms.
- Handling user interaction.
- Calling backend APIs.
- Showing role-based navigation.
- Rendering charts, tables, cards, badges, and PDF reports.

The backend is responsible for:

- Authentication.
- Authorization.
- Validating requests.
- Applying business logic.
- Reading and writing database records.
- Returning JSON responses.

The database is responsible for:

- Persisting users, vehicles, drivers, assignments, work orders, fuel logs, documents, fault reports, and schedules.
- Enforcing relational links through Prisma relationships.
- Supporting report queries and counts.

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Build component-based UI |
| Frontend language | TypeScript | Add type safety to UI code |
| Styling | Bootstrap 5 + custom CSS | Responsive premium interface |
| Routing | React Router DOM | Single-page application routes |
| HTTP client | Axios | API requests to backend |
| Charts | Chart.js + react-chartjs-2 | Dashboard and report charts |
| Backend | Node.js + Express | REST API server |
| Database | PostgreSQL | Relational data storage |
| ORM | Prisma | Database schema, models, and queries |
| Auth | JWT + bcrypt | Login sessions and password hashing |
| Version control | Git + GitHub | Source control and collaboration |

## 3. Folder Structure

### Root Structure

```text
VMMS/
  backend/
  frontend/
  docs/
  plans/
  README.md
```

### Backend Structure

```text
backend/
  prisma/
    schema.prisma
    seed.js
  src/
    config/
      prisma.js
    controllers/
    middleware/
    routes/
    services/
    utils/
    app.js
    server.js
```

Backend folder responsibilities:

- `prisma/schema.prisma`: database models, enums, relationships, and table mappings.
- `prisma/seed.js`: repeatable demo data seed.
- `src/config/prisma.js`: Prisma Client setup using PostgreSQL adapter.
- `src/routes`: API endpoint definitions and route-level middleware.
- `src/controllers`: request/response handling and payload normalization.
- `src/services`: main business logic and Prisma queries.
- `src/middleware`: authentication and role checks.
- `src/utils`: reusable helpers such as password hashing, JWT, status calculations, and error helpers.
- `src/app.js`: Express app configuration, route mounting, and error handler.
- `src/server.js`: starts the HTTP server.

### Frontend Structure

```text
frontend/
  src/
    components/
    context/
    hooks/
    pages/
    services/
    types/
    utils/
    App.tsx
    App.css
    main.tsx
    index.css
```

Frontend folder responsibilities:

- `components`: reusable UI pieces such as sidebar, topbar, tables, forms, badges, and cards.
- `context`: shared application state, currently authentication context.
- `hooks`: reusable data-loading logic for each module.
- `pages`: route-level screens such as Dashboard, Vehicles, Work Orders, Reports, and Settings.
- `services`: API client functions for backend endpoints.
- `types`: TypeScript types for API data and frontend models.
- `utils`: helper functions such as API error parsing, PDF export, CSV export, and settings preferences.
- `App.tsx`: route definitions and route protection.
- `App.css`: application styling.
- `main.tsx`: React app entry point.

## 4. Backend Architecture Pattern

The backend follows this pattern:

```text
Route -> Middleware -> Controller -> Service -> Prisma -> PostgreSQL
```

Example for vehicles:

```text
vehicleRoutes.js
  -> requireAuth
  -> requireRole("ADMIN")
  -> vehicleController.js
  -> vehicleService.js
  -> prisma.vehicle
  -> vehicles table
```

This separates responsibilities:

- Routes decide endpoint paths and allowed roles.
- Middleware checks token and permissions.
- Controllers validate and normalize incoming request data.
- Services apply business rules and query the database.
- Prisma translates JavaScript calls into database operations.

## 5. Express App Setup

The main backend app is configured in `backend/src/app.js`.

It uses:

- `express.json()` to read JSON request bodies.
- `cors()` to allow frontend requests.
- Route mounting under `/api/...`.
- A fallback 404 handler.
- A centralized error handler.

Main mounted routes:

```text
/api/auth
/api/health
/api/dashboard
/api/vehicles
/api/drivers
/api/assignments
/api/work-orders
/api/fuel-logs
/api/compliance-documents
/api/fault-reports
/api/maintenance-schedules
/api/reports
```

## 6. Authentication Flow

Authentication is handled by:

- `authController.js`
- `authRoutes.js`
- `authMiddleware.js`
- `jwt.js`
- `password.js`
- `safeUser.js`

### Register Flow

1. User submits name, email, password, and role.
2. Backend validates the payload.
3. Backend checks if the email already exists.
4. Backend checks if the selected role exists.
5. Password is hashed using bcrypt.
6. User is saved in PostgreSQL.
7. Backend returns a safe user object without password hash.

Endpoint:

```text
POST /api/auth/register
```

### Login Flow

1. User submits email and password.
2. Backend finds user by email.
3. Backend checks user status.
4. Backend compares password using bcrypt.
5. Backend signs a JWT.
6. Frontend stores JWT in `localStorage`.
7. Axios sends JWT on future requests.

Endpoint:

```text
POST /api/auth/login
```

### Current User Flow

1. Frontend reloads the app.
2. AuthContext checks for saved token.
3. Frontend calls `/api/auth/me`.
4. Backend verifies token.
5. Backend returns the current user.

Endpoint:

```text
GET /api/auth/me
```

### Profile and Password Settings

Settings uses:

```text
PATCH /api/auth/profile
PATCH /api/auth/password
```

Profile update changes the authenticated user's name.

Password update:

1. Checks current password.
2. Validates new password length.
3. Hashes new password.
4. Saves new hash.

## 7. JWT and Password Security

Passwords are never stored as plain text.

The backend uses bcrypt:

```text
password -> bcrypt hash -> stored passwordHash
```

JWT stores identity information for API access. The backend verifies JWT on protected routes.

The frontend stores the token in:

```text
localStorage key: vmms_auth_token
```

Axios automatically attaches it:

```text
Authorization: Bearer <token>
```

## 8. Role-Based Access Control

RBAC exists on both frontend and backend.

### Frontend RBAC

Frontend uses:

- `ProtectedRoute`
- `RoleGuard`
- `Sidebar`
- `AuthContext`

Frontend hides pages and menu links based on role. This improves user experience.

### Backend RBAC

Backend uses:

- `requireAuth`
- `requireRole`

Backend RBAC is the real security layer. Even if a user manually enters a URL or sends a request from Postman, the backend checks the token and role.

Example:

```js
router.use(requireAuth);
router.use(requireRole("ADMIN"));
```

This means the route requires a valid logged-in user and the Admin role.

## 9. Frontend Architecture

The frontend follows this pattern:

```text
Page -> Hook -> Service -> Axios API -> Backend
```

Example for vehicles:

```text
Vehicles.tsx
  -> useVehicles.ts
  -> vehicleService.ts
  -> api.ts
  -> /api/vehicles
```

### Pages

Pages are route-level components.

Important pages:

- `Login.tsx`
- `Register.tsx`
- `Dashboard.tsx`
- `Vehicles.tsx`
- `VehicleDetail.tsx`
- `Drivers.tsx`
- `DriverDetail.tsx`
- `Assignments.tsx`
- `MyVehicle.tsx`
- `MaintenanceSchedules.tsx`
- `WorkOrders.tsx`
- `WorkOrderDetail.tsx`
- `FuelLogs.tsx`
- `ComplianceDocuments.tsx`
- `FaultReports.tsx`
- `Reports.tsx`
- `Settings.tsx`

### Hooks

Hooks handle repeated data loading patterns:

- loading state.
- error state.
- API calls.
- reload functions.
- local filter state in pages.

Examples:

- `useVehicles`
- `useDrivers`
- `useAssignments`
- `useWorkOrders`
- `useFuelLogs`
- `useComplianceDocuments`
- `useFaultReports`
- `useMaintenanceSchedules`
- `useReports`
- `useDashboardSummary`

### Services

Services contain API calls and keep Axios logic away from UI components.

Examples:

- `authService.ts`
- `vehicleService.ts`
- `driverService.ts`
- `assignmentService.ts`
- `workOrderService.ts`
- `fuelLogService.ts`
- `complianceDocumentService.ts`
- `faultReportService.ts`
- `maintenanceScheduleService.ts`
- `reportService.ts`

### Types

TypeScript types define the expected shape of API data.

Examples:

- `auth.ts`
- `vehicle.ts`
- `driver.ts`
- `assignment.ts`
- `workOrder.ts`
- `fuelLog.ts`
- `complianceDocument.ts`
- `faultReport.ts`
- `maintenanceSchedule.ts`
- `report.ts`

This reduces mistakes when passing data between components.

## 10. Frontend Routing

Routes are defined in `frontend/src/App.tsx`.

Public routes:

```text
/login
/register
```

Protected routes:

```text
/dashboard
/vehicles
/vehicles/:id
/drivers
/drivers/:id
/assignments
/my-vehicle
/maintenance-schedules
/work-orders
/work-orders/:id
/fault-reports
/fuel-logs
/compliance-documents
/reports
/settings
```

All main routes are inside:

```text
ProtectedRoute -> AppLayout -> RoleGuard -> Page
```

## 11. AuthContext

`AuthContext` stores:

- current user.
- token.
- loading state.
- login function.
- register function.
- logout function.
- updateProfile function.
- changePassword function.

It allows any component to call:

```ts
const { user, login, logout } = useAuth()
```

This avoids passing user data manually through many components.

## 12. Axios API Client

`frontend/src/services/api.ts` creates a central Axios instance.

It sets:

```text
baseURL = VITE_API_URL or http://localhost:5000/api
```

It adds request interceptor:

- Reads JWT from localStorage.
- Adds `Authorization` header.

It adds response interceptor:

- If backend returns 401, token is removed.
- A browser event logs the user out from AuthContext.

## 13. Database Design

The database is designed in `backend/prisma/schema.prisma`.

Core models:

- `Role`
- `User`
- `Vehicle`
- `Driver`
- `VehicleAssignment`
- `MaintenanceSchedule`
- `WorkOrder`
- `FaultReport`
- `FuelLog`
- `ComplianceDocument`

### Main Relationships

```text
Role 1 -> many Users
User 1 -> optional Driver profile
Vehicle 1 -> many Assignments
Driver 1 -> many Assignments
Vehicle 1 -> many WorkOrders
User 1 -> many WorkOrders as Technician
Vehicle 1 -> many FuelLogs
Driver 1 -> many FuelLogs
Vehicle 1 -> many ComplianceDocuments
Vehicle 1 -> many FaultReports
Driver 1 -> many FaultReports
FaultReport 1 -> optional WorkOrder
MaintenanceSchedule 1 -> many WorkOrders
```

### Why PostgreSQL Fits VMMS

VMMS data is relational. For example:

- A work order belongs to a vehicle.
- A work order may be assigned to a technician.
- A driver can be assigned to a vehicle.
- A fuel log belongs to a vehicle and optionally a driver.
- A fault report can become a work order.

PostgreSQL and Prisma make these relationships easier to model and query.

## 14. Prisma Details

Prisma provides:

- schema models.
- migrations.
- generated Prisma Client.
- relation queries.
- filtering.
- sorting.
- aggregation.

Example query pattern:

```js
prisma.vehicle.findMany({
  where: { status: "ACTIVE" },
  orderBy: { createdAt: "desc" },
});
```

Example aggregate pattern:

```js
prisma.fuelLog.aggregate({
  _sum: { totalAmount: true },
});
```

## 15. Status Enums

The database uses enums for controlled statuses.

Important enums:

- `UserStatus`: ACTIVE, INACTIVE
- `VehicleStatus`: ACTIVE, IN_MAINTENANCE, OUT_OF_SERVICE
- `DriverStatus`: ACTIVE, INACTIVE
- `AssignmentStatus`: ACTIVE, ENDED
- `MaintenanceScheduleStatus`: ACTIVE, DUE, COMPLETED, CANCELLED
- `WorkOrderPriority`: LOW, MEDIUM, HIGH, URGENT
- `WorkOrderStatus`: OPEN, IN_PROGRESS, PENDING_PARTS, COMPLETED, CLOSED
- `FaultUrgency`: LOW, MEDIUM, HIGH
- `FaultReportStatus`: NEW, REVIEWED, CONVERTED_TO_WORK_ORDER, CLOSED
- `ComplianceDocumentStatus`: VALID, EXPIRING_SOON, EXPIRED

Enums reduce invalid data and make status-based logic easier.

## 16. Module Technical Logic

### 16.1 Dashboard

Files:

- `Dashboard.tsx`
- `useDashboardSummary.ts`
- `dashboardRoutes.js`
- `dashboardController.js`
- `dashboardService.js`

Backend dashboard logic changes by role:

- Admin receives fleet-wide metrics.
- Technician receives assigned work order metrics.
- Driver receives fault report metrics.

This is one endpoint with role-aware logic:

```text
GET /api/dashboard/summary
```

Why this is good:

- One dashboard route.
- Backend decides what data the user is allowed to see.
- Frontend renders cards based on returned role.

### 16.2 Vehicles

Files:

- `Vehicles.tsx`
- `VehicleDetail.tsx`
- `useVehicles.ts`
- `vehicleService.ts`
- `vehicleRoutes.js`
- `vehicleController.js`
- `vehicleService.js`

Role:

- Admin only.

Logic:

- Admin can create, list, filter, view, update, and delete vehicles.
- Vehicle delete is protected by service logic so related important records are not accidentally broken.
- Vehicle status is used by assignments and work orders.

### 16.3 Drivers

Files:

- `Drivers.tsx`
- `DriverDetail.tsx`
- `useDrivers.ts`
- `driverService.ts`
- `driverRoutes.js`
- `driverController.js`
- `driverService.js`

Role:

- Admin manages drivers.
- Driver can access own driver profile through `/api/drivers/me`.

Logic:

- Driver profile can be linked to a Driver-role user.
- UI shows linkable driver users by name and email.
- Backend stores the actual `userId`.
- This allows Driver login to connect to driver profile and vehicle assignment.

### 16.4 Assignments

Files:

- `Assignments.tsx`
- `MyVehicle.tsx`
- `useAssignments.ts`
- `assignmentService.ts`
- `assignmentRoutes.js`
- `assignmentController.js`
- `assignmentService.js`

Role:

- Admin creates and ends assignments.
- Driver sees their active assignment.

Logic:

- A vehicle can have only one active assignment.
- A driver can have only one active assignment.
- Only active vehicles and active drivers can be assigned.
- Driver page uses linked user -> driver profile -> active assignment.

Driver endpoint:

```text
GET /api/assignments/my-active
```

### 16.5 Work Orders

Files:

- `WorkOrders.tsx`
- `WorkOrderDetail.tsx`
- `useWorkOrders.ts`
- `workOrderService.ts`
- `workOrderRoutes.js`
- `workOrderController.js`
- `workOrderService.js`
- `workOrderStatus.js`

Roles:

- Admin can manage all work orders.
- Technician can view/update assigned work orders.

Logic:

- Admin creates work order and assigns technician.
- Technician updates status and progress.
- Technician cannot close a work order.
- Admin closes completed work orders.
- Service validates technician access before allowing technician changes.
- Work order status transitions are controlled by `workOrderStatus.js`.

Vehicle maintenance sync:

- If vehicle has in-progress maintenance work, vehicle can become `IN_MAINTENANCE`.
- When maintenance work is no longer active, vehicle can return to `ACTIVE`.

### 16.6 Fuel Logs

Files:

- `FuelLogs.tsx`
- `useFuelLogs.ts`
- `fuelLogService.ts`
- `fuelLogRoutes.js`
- `fuelLogController.js`
- `fuelLogService.js`

Roles:

- Admin can view all logs and delete.
- Driver can create/update own fuel logs for assigned vehicle.

Logic:

- Quantity and unit cost calculate total amount.
- Driver activity is restricted to the assigned vehicle.
- Fuel reports aggregate cost and quantity.

### 16.7 Compliance Documents

Files:

- `ComplianceDocuments.tsx`
- `useComplianceDocuments.ts`
- `complianceDocumentService.ts`
- `complianceDocumentRoutes.js`
- `complianceDocumentController.js`
- `complianceDocumentService.js`
- `documentStatus.js`

Role:

- Admin only.

Logic:

- Admin adds document records for vehicles.
- Backend calculates status from expiry date.
- If expiry date is before today, status is `EXPIRED`.
- If expiry date is within 30 days, status is `EXPIRING_SOON`.
- Otherwise status is `VALID`.

Documents affect:

- Dashboard document alerts.
- Compliance reports.
- Admin decision-making.

### 16.8 Fault Reports

Files:

- `FaultReports.tsx`
- `useFaultReports.ts`
- `faultReportService.ts`
- `faultReportRoutes.js`
- `faultReportController.js`
- `faultReportService.js`
- `faultReportStatus.js`

Roles:

- Driver submits reports.
- Admin reviews and converts reports.

Logic:

- Driver can submit a fault report only for assigned vehicle.
- Admin can mark report as reviewed or closed.
- Admin can convert report into work order.
- Converted report stores `workOrderId`.
- Converted reports cannot be converted again.

This connects Driver concerns to Technician repair flow.

### 16.9 Maintenance Schedules

Files:

- `MaintenanceSchedules.tsx`
- `useMaintenanceSchedules.ts`
- `maintenanceScheduleService.ts`
- `maintenanceScheduleRoutes.js`
- `maintenanceScheduleController.js`
- `maintenanceScheduleService.js`
- `maintenanceStatus.js`

Role:

- Admin only.

Logic:

- Admin creates schedule for a vehicle.
- Schedule tracks next due date and next due odometer.
- Backend calculates if schedule is active or due.
- Admin can create a work order from schedule.
- When converted, the schedule can be marked completed.

### 16.10 Reports

Files:

- `Reports.tsx`
- `ReportChart.tsx`
- `ReportFilters.tsx`
- `ReportSummaryCards.tsx`
- `ReportTable.tsx`
- `useReports.ts`
- `reportService.ts`
- `reportRoutes.js`
- `reportController.js`
- `reportService.js`
- `exportReport.ts`

Role:

- Admin only.

Report types:

- Vehicle summary.
- Fuel summary.
- Work order summary.
- Compliance summary.

Backend returns:

- summary data.
- rows for charts and tables.
- date/vehicle/status filtered results where applicable.

Frontend renders:

- report tabs.
- filters.
- summary cards.
- Chart.js chart.
- table rows.
- formatted PDF export.

PDF export:

- Captures chart canvas.
- Builds a downloadable PDF Blob.
- Includes filters, metrics, chart, and detailed table sections.

### 16.11 Settings

Files:

- `Settings.tsx`
- `settingsPreferences.ts`
- `authService.ts`
- `authController.js`
- `authRoutes.js`

Roles:

- Admin, Technician, and Driver.

Logic:

- All users can update name and password.
- All users can set theme and table density.
- Admin sees organization/system preferences.
- UI preferences are stored in localStorage.
- Name/password updates are persisted in database.

## 17. Report Logic

Reports are built in the backend service layer.

Why backend reports:

- Data should be calculated from real database records.
- Admin should not depend on frontend-only calculations for important summaries.
- Backend can filter and aggregate consistently.

Report examples:

- Vehicle report counts vehicles by status.
- Fuel report groups fuel totals by vehicle and date.
- Work order report groups work orders by status and vehicle.
- Compliance report groups documents by status and vehicle.

## 18. Demo Seed Data

Seed file:

```text
backend/prisma/seed.js
```

The seed creates:

- roles.
- demo users.
- linked driver profiles.
- 10 demo vehicles.
- assignments.
- maintenance schedules.
- work orders.
- fuel logs.
- compliance documents.
- fault reports.

The seed uses upserts with stable demo IDs. This makes it repeatable.

Command:

```powershell
cd backend
npm run prisma:seed
```

## 19. API Endpoint Summary

### Auth

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/profile
PATCH  /api/auth/password
POST   /api/auth/logout
```

### Dashboard

```text
GET /api/dashboard/summary
```

### Vehicles

```text
GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
```

### Drivers

```text
GET    /api/drivers/me
GET    /api/drivers
POST   /api/drivers
GET    /api/drivers/linkable-users
GET    /api/drivers/:id
PUT    /api/drivers/:id
DELETE /api/drivers/:id
```

### Assignments

```text
GET   /api/assignments/my-active
GET   /api/assignments
POST  /api/assignments
PATCH /api/assignments/:id/end
```

### Work Orders

```text
GET    /api/work-orders/technicians
GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/:id
PUT    /api/work-orders/:id
PATCH  /api/work-orders/:id/status
DELETE /api/work-orders/:id
```

### Fuel Logs

```text
GET    /api/fuel-logs
POST   /api/fuel-logs
PUT    /api/fuel-logs/:id
DELETE /api/fuel-logs/:id
```

### Compliance Documents

```text
GET    /api/compliance-documents
POST   /api/compliance-documents
PUT    /api/compliance-documents/:id
DELETE /api/compliance-documents/:id
```

### Fault Reports

```text
GET   /api/fault-reports
POST  /api/fault-reports
PATCH /api/fault-reports/:id/status
POST  /api/fault-reports/:id/convert-to-work-order
```

### Maintenance Schedules

```text
GET    /api/maintenance-schedules
POST   /api/maintenance-schedules
PUT    /api/maintenance-schedules/:id
DELETE /api/maintenance-schedules/:id
POST   /api/maintenance-schedules/:id/create-work-order
```

### Reports

```text
GET /api/reports/vehicles
GET /api/reports/fuel
GET /api/reports/work-orders
GET /api/reports/compliance
```

## 20. Error Handling

Backend uses:

```text
createHttpError(statusCode, message)
```

Errors are passed to Express `next(error)`.

The central error handler sends:

```json
{
  "message": "Error message"
}
```

Frontend uses:

```text
getApiErrorMessage
```

This extracts readable backend messages and shows them in alerts.

## 21. Validation Strategy

Validation exists in two places:

### Frontend Validation

Frontend forms use:

- required fields.
- input types like date, number, email, password.
- controlled React state.
- user-friendly alerts.

### Backend Validation

Backend validates:

- required fields.
- valid status values.
- valid roles.
- valid relationships.
- ownership/role permission.
- password length.
- current password match.

Backend validation is more important because users can bypass frontend validation through Postman or browser tools.

## 22. Important Business Rules

### Assignment Rules

- Only active vehicles can be assigned.
- Only active drivers can be assigned.
- A vehicle can have one active assignment.
- A driver can have one active assignment.

### Work Order Rules

- Admin creates and closes work orders.
- Technician updates assigned work only.
- Technician cannot close completed work orders.
- Status transitions are controlled.
- Vehicle maintenance status can sync with active work.

### Driver Rules

- Driver portal depends on linked Driver profile.
- Driver can submit fuel logs and fault reports for assigned vehicle.

### Fault Report Rules

- Driver submits.
- Admin reviews.
- Admin can convert to work order.
- A converted report cannot be converted again.

### Compliance Rules

- Status is calculated from expiry date.
- Expiring soon means within 30 days.
- Expired means date has already passed.

## 23. Frontend UI Design

The UI uses:

- Bootstrap grid and utilities.
- Custom CSS in `App.css`.
- Card-based dashboard summaries.
- Tables with modern scrollbars.
- Status badges.
- Role-based sidebar.
- Premium colors based around navy, green, white, and subtle panels.
- Dark mode and compact mode through Settings.

The UI avoids showing unavailable modules to users by role.

## 24. PDF Report Export

PDF export is handled in:

```text
frontend/src/utils/exportReport.ts
```

The export:

- Reads current report data.
- Captures the visible chart canvas.
- Builds a PDF Blob.
- Adds report header.
- Adds filters.
- Adds summary metrics.
- Adds chart image.
- Adds detailed tables.
- Downloads the PDF file.

This avoids requiring a backend PDF generation service for the semester scope.

## 25. Settings Preferences

Settings uses two storage types:

### Database Stored

- User name.
- User password hash.

### Browser Stored

- Theme.
- Table density.
- Admin organization preferences.

Why localStorage for preferences:

- Keeps final project scope practical.
- Avoids adding a settings table late in the project.
- Still demonstrates useful React state and browser storage.

## 26. Common Demo Technical Questions

### Why did you use PostgreSQL instead of MongoDB?

VMMS has relational data. Vehicles, drivers, assignments, work orders, fuel logs, and documents are connected. PostgreSQL handles relationships strongly, and Prisma makes those relationships easy to query.

### Why did you use Prisma?

Prisma gives a typed and structured way to work with PostgreSQL. It defines models, relationships, migrations, and generates a Prisma Client for database queries.

### How is authentication handled?

Users log in with email and password. Passwords are checked with bcrypt. After successful login, backend returns a JWT. Frontend stores the token and sends it with future API requests.

### How is authorization handled?

Backend uses `requireAuth` to check the JWT and `requireRole` to check allowed roles. Frontend also hides menu items and routes based on role, but backend is the real security layer.

### How do you prevent drivers from seeing other drivers' data?

Backend uses the logged-in user's ID from the token. For driver flows, it finds the linked driver profile and only returns records related to that driver or assigned vehicle.

### Why use controllers and services separately?

Controllers handle request and response work. Services handle business logic and database queries. This separation makes the code cleaner and easier to test or modify.

### How does a driver know their assigned vehicle?

The Admin links a Driver-role user to a driver profile, then creates an active assignment between that driver and a vehicle. When the Driver opens My Vehicle, backend finds the active assignment for that logged-in user.

### How does a fault report become a work order?

Driver submits a fault report. Admin reviews it. If repair is needed, Admin converts the fault report into a work order and assigns a technician. The fault report stores the linked `workOrderId`.

### Why can only Admin close work orders?

Technician completes repair work, but Admin represents the fleet manager who verifies and closes the job. This matches a real approval flow.

### How are document statuses calculated?

Backend checks expiry date. If the expiry date has passed, status is Expired. If expiry date is within 30 days, status is Expiring Soon. Otherwise it is Valid.

### How are reports generated?

Backend report endpoints calculate report data from database records. Frontend displays the data as cards, charts, and tables. PDF export is generated from the current report data on the frontend.

### What happens if a user manually calls an API they should not access?

The backend checks the token and role before running controller logic. Unauthorized users receive 401 or 403 responses.

### Why is there a seed file?

The seed file creates demo records for presentation and testing. It makes sure the evaluator can see meaningful data immediately after setup.

### What is the difference between User and Driver?

`User` is a login account. `Driver` is a driver profile with license, phone, CNIC, and assignment details. A Driver profile can optionally be linked to a Driver-role User.

### Why are there status enums?

Enums prevent random invalid status text. They make filtering, validation, badges, and reports more reliable.

### How does the frontend handle API errors?

API services throw Axios errors. Pages/hooks catch them and use `getApiErrorMessage` to show a readable alert to the user.

### How is the project scoped for a semester project?

It includes full-stack CRUD, authentication, roles, reporting, and relational data, but avoids enterprise features like billing, GPS, IoT, SMS, multi-tenant SaaS, and advanced inventory.

## 27. Best Technical Demo Flow

Use this sequence for a technical explanation:

1. Explain the stack: React, Express, PostgreSQL, Prisma.
2. Show folder structure.
3. Show `schema.prisma` and relationships.
4. Show auth flow: login, JWT, `requireAuth`.
5. Show role flow: `requireRole`, `RoleGuard`, sidebar.
6. Show one CRUD module end to end, such as Vehicles.
7. Show Driver link and Assignment relation.
8. Show Fault Report to Work Order conversion.
9. Show Reports and PDF export.
10. Show seed data and demo accounts.

## 28. What To Mention If Asked About Limitations

This project is intentionally scoped for a university semester project.

Current limitations:

- No cloud file storage for uploaded documents.
- No email password reset.
- No SMS/email notifications.
- No real-time GPS tracking.
- No parts inventory.
- No production deployment configuration.
- Admin organization preferences are browser-local.

These are acceptable because the project focuses on core web engineering concepts:

- React UI.
- REST APIs.
- PostgreSQL relations.
- Prisma CRUD.
- JWT auth.
- Role-based access.
- Reports and dashboard logic.
- Git/GitHub workflow.
