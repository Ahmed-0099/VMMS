# VMMS - Vehicle Maintenance Management System

VMMS is a full-stack Vehicle Maintenance Management System. It helps a fleet manager manage vehicles, drivers, vehicle assignments, maintenance schedules, work orders, fuel logs, compliance documents, fault reports, reports, and user settings in one role-based dashboard.

## Project Highlights

- Role-based access for Admin, Technician, and Driver.
- Modern React dashboard with premium UI styling.
- PostgreSQL relational database with Prisma ORM.
- Express REST API with JSON responses.
- JWT authentication and bcrypt password hashing.
- CRUD modules for the practical semester scope.
- Charts and professional PDF report export.
- Repeatable demo seed data for presentations.
- Git/GitHub-ready structure and documentation.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Bootstrap 5 |
| Build Tool | Vite |
| Routing | React Router DOM |
| State | React hooks and context |
| API Client | Axios |
| Charts | Chart.js and react-chartjs-2 |
| Backend | Node.js and Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT and bcrypt |
| Version Control | Git and GitHub |

## Project Structure

```text
VMMS/
  backend/
    prisma/
      schema.prisma
      seed.js
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      utils/
  docs/
    VMMS_Lab_Concepts_Tech_Stack_Guide.md
    VMMS_User_Features_and_Flows.md
    VMMS_Workflow_Guide.md
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
      services/
      types/
      utils/
  plans/
  README.md
```

## Core Modules

### Authentication

- Register new users with a role.
- Login with email and password.
- Store a JWT for protected API requests.
- Load current user session with `/api/auth/me`.
- Logout and clear the session.
- Update profile name and password from Settings.

### Dashboard

The dashboard changes by role.

- Admin sees fleet totals, maintenance attention, fuel cost, document alerts, and work order counts.
- Technician sees assigned jobs, urgent jobs, due jobs, in-progress jobs, and completed jobs.
- Driver sees submitted fault reports, reviewed reports, converted reports, and closed reports.

### Vehicle CRUD

Admin can:

- Create vehicles.
- Search and filter vehicles.
- View vehicle details.
- Edit vehicle details.
- Delete vehicles when allowed by related records.

### Driver CRUD

Admin can:

- Create driver profiles.
- Link a driver profile to a Driver-role user.
- Select linked driver users by name/email in the UI.
- Edit driver information.
- View driver details and related activity.

### Vehicle Assignment

Admin can:

- Assign one active driver to one active vehicle.
- View active and ended assignments.
- End an assignment.

Driver can:

- Open `My Vehicle` to see the vehicle assigned to their linked driver profile.

### Work Orders

Admin can:

- Create work orders for vehicles.
- Assign work orders to technicians.
- Review work order progress.
- Close completed work orders.

Technician can:

- View only assigned work orders.
- Update status and progress.
- Add labor hours, cost, and completion notes.
- Mark jobs as completed.

### Fuel Logs

Admin can:

- View all fuel logs.
- Filter fuel activity.
- Review fuel cost totals.

Driver can:

- Add fuel logs for their assigned vehicle.
- View their own fuel entries.

### Compliance Documents

Admin can:

- Add vehicle document records.
- Track document type, number, issue date, expiry date, and file reference.
- See Valid, Expiring Soon, and Expired statuses.

### Fault Reports

Driver can:

- Submit a fault report for their assigned vehicle.
- View their own reports.

Admin can:

- Review all fault reports.
- Mark reports as reviewed or closed.
- Convert a report into a work order.

### Maintenance Schedules

Admin can:

- Create maintenance schedules for vehicles.
- Track due date and due odometer.
- See due schedules.
- Create a work order from a maintenance schedule.

### Reports

Admin can:

- View vehicle, fuel, work order, and compliance reports.
- Apply date, vehicle, and status filters.
- View charts and tables.
- Download a formatted PDF report with charts and details.

### Settings

All users can:

- View account and role details.
- Update profile name.
- Change password.
- Set appearance preferences such as theme and table density.

Admin can also set local VMMS preferences:

- Organization name.
- Contact details.
- Report footer text.
- Warning days for documents and maintenance.
- Currency and distance unit.

## Role-Based Access Control

| Module | Admin | Technician | Driver |
|---|---:|---:|---:|
| Dashboard | Yes | Yes | Yes |
| Vehicles | Yes | No | No |
| Drivers | Yes | No | No |
| Assignments | Yes | No | No |
| My Vehicle | No | No | Yes |
| Maintenance Schedules | Yes | No | No |
| Work Orders | Yes | Assigned only | No |
| Fault Reports | Yes | No | Own reports |
| Fuel Logs | Yes | No | Own/assigned vehicle |
| Compliance Documents | Yes | No | No |
| Reports | Yes | No | No |
| Settings | Yes | Yes | Yes |

## Prerequisites

Install the following:

- Node.js 20 or newer
- npm
- PostgreSQL
- Git
- Postman or Thunder Client for API testing

## Database Setup

Open PostgreSQL SQL Shell or pgAdmin and create the project database and user.

```sql
CREATE DATABASE vmms_db;
CREATE USER vmms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vmms_db TO vmms_user;
```

For PostgreSQL versions that require schema-level permission, connect to `vmms_db` and run:

```sql
GRANT ALL ON SCHEMA public TO vmms_user;
ALTER SCHEMA public OWNER TO vmms_user;
```

## Backend Setup

Go to the backend folder:

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://vmms_user:your_password@localhost:5432/vmms_db?schema=public"
JWT_SECRET="replace_with_a_long_random_secret"
PORT=5000
```

Generate Prisma Client:

```powershell
npm run prisma:generate
```

Run migrations:

```powershell
npm run prisma:migrate
```

Seed roles and demo data:

```powershell
npm run prisma:seed
```

Start the backend server:

```powershell
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

## Frontend Setup

Open a new terminal and go to the frontend folder:

```powershell
cd frontend
npm install
```

Optional: create `frontend/.env` if your backend URL is different:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```powershell
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Demo Accounts

These accounts are for local demonstration only.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vmms.local` | `Ahmed@123` |
| Technician | `ahmedtechnician@vmms.local` | `Shikari@123` |
| Technician | `sara.technician@vmms.local` | `Tech@12345` |
| Driver | `ahmeddriver@vmms.local` | `Driver@123` |
| Driver | `bilal.driver@vmms.local` | `Driver@12345` |

## Demo Data

The seed script creates or refreshes demonstration records for:

- Roles
- Users
- Driver profiles
- 10 demo vehicles
- Vehicle assignments
- Maintenance schedules
- Work orders
- Fuel logs
- Compliance documents
- Fault reports

The seed is repeatable. It uses stable demo IDs and unique values so running it again updates the same demo records instead of creating unlimited duplicates.

## Useful Commands

### Backend

```powershell
cd backend
npm run dev
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

### Frontend

```powershell
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## API Overview

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/profile
PATCH  /api/auth/password

GET    /api/dashboard/summary

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/drivers
POST   /api/drivers
GET    /api/drivers/:id
PUT    /api/drivers/:id
DELETE /api/drivers/:id

GET    /api/assignments
POST   /api/assignments
PATCH  /api/assignments/:id/end

GET    /api/maintenance-schedules
POST   /api/maintenance-schedules
PUT    /api/maintenance-schedules/:id
DELETE /api/maintenance-schedules/:id
POST   /api/maintenance-schedules/:id/work-order

GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/:id
PUT    /api/work-orders/:id
PATCH  /api/work-orders/:id/status
PATCH  /api/work-orders/:id/progress
DELETE /api/work-orders/:id

GET    /api/fuel-logs
POST   /api/fuel-logs
PUT    /api/fuel-logs/:id
DELETE /api/fuel-logs/:id

GET    /api/compliance-documents
POST   /api/compliance-documents
PUT    /api/compliance-documents/:id
DELETE /api/compliance-documents/:id

GET    /api/fault-reports
POST   /api/fault-reports
PATCH  /api/fault-reports/:id/status
POST   /api/fault-reports/:id/convert-to-work-order

GET    /api/reports/vehicles
GET    /api/reports/fuel
GET    /api/reports/work-orders
GET    /api/reports/compliance
```

## Git Workflow

Initialize and commit:

```powershell
git init
git add .
git commit -m "Initial VMMS project"
```

Connect remote repository:

```powershell
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

Recommended feature branch pattern:

```powershell
git checkout -b feature/module-name
git add .
git commit -m "Implement module name"
git push -u origin feature/module-name
```

## Environment and Security Notes

- Do not commit real `.env` files.
- Keep `JWT_SECRET` private.
- Demo credentials are only for local project demonstration.
- Use strong passwords for any real deployment.
- The current project is scoped for a semester project, not production SaaS hosting.

## Future Enhancements

- Email password reset.
- Audit log UI.
- File upload storage for compliance documents.
- Excel export.
- Multi-organization tenant support.
- Email or SMS alerts.
- GPS/telematics integration.
- Inventory and parts management.
- Deployment to a cloud platform.
