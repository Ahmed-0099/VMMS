# Implementation Plan: Auth

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: register, login, JWT session, bcrypt password hashing, and role-based access for `ADMIN`, `TECHNICIAN`, and `DRIVER`. Do not implement email verification, password reset, Google login, Microsoft login, or MFA in the current semester scope.

## 1. DB RELATED CHANGES

- Update `backend/prisma/schema.prisma` only if the current `Role` and `User` models are missing any required auth fields.
- Required `Role` model fields:
  - `id`
  - `name`
  - `description`
  - `createdAt`
  - `updatedAt`
- Required `User` model fields:
  - `id`
  - `name`
  - `email`
  - `passwordHash`
  - `status`
  - `roleId`
  - `createdAt`
  - `updatedAt`
- Keep role names simple:
  - `ADMIN`
  - `TECHNICIAN`
  - `DRIVER`
- Important registration note:
  - For the university/demo flow, registration may allow selecting a role so all three dashboards can be tested.
  - In a stricter real-world deployment, only an Admin should create Technician/Driver accounts or approve role changes.
- Keep `email` unique.
- Keep `roleId` as a foreign key relation to `Role`.
- Keep `.env` private and use:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT`
- If schema changes are made, run:

```powershell
cd backend
npm run prisma:migrate -- --name auth_setup
npm run prisma:generate
npm run prisma:seed
```

- Update `backend/prisma/seed.js`:
  - Ensure all three roles are created through `upsert`.
  - Do not seed real passwords unless needed for demo.
  - If adding demo users later, hash passwords with bcrypt in the seed.

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/authController.js`.
  - `register(req, res, next)`
    - Validate `name`, `email`, `password`, and `roleName`.
    - Check if email already exists.
    - Find role by `roleName`.
    - Hash password using `bcrypt.hash`.
    - Save user using Prisma.
    - Return safe user data without `passwordHash`.
  - `login(req, res, next)`
    - Validate `email` and `password`.
    - Find user by email with role included.
    - Compare password using `bcrypt.compare`.
    - Sign JWT using `jsonwebtoken`.
    - Return token and user profile.
  - `me(req, res, next)`
    - Return logged-in user data from token.
  - `logout(req, res)`
    - Return success message. JWT logout is handled on frontend by clearing token.

- Create `backend/src/routes/authRoutes.js`.
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
    - Protect with `requireAuth`.
    - Return a success message; JWT invalidation is handled on the frontend by clearing local storage.

- Create `backend/src/middleware/authMiddleware.js`.
  - Read `Authorization: Bearer <token>`.
  - Verify JWT using `JWT_SECRET`.
  - Attach decoded user data to `req.user`.
  - Return `401` when token is missing or invalid.

- Create `backend/src/middleware/roleMiddleware.js`.
  - Export `requireRole(...allowedRoles)`.
  - Return `403` if user role is not allowed.
  - Use this middleware on every module route; frontend hidden links are not enough for RBAC.

- Create `backend/src/utils/jwt.js`.
  - `signToken(user)` returns JWT with:
    - `userId`
    - `role`
    - `email`

- Create `backend/src/utils/password.js`.
  - `hashPassword(password)`
  - `comparePassword(password, hash)`

- Create `backend/src/utils/safeUser.js`.
  - Converts Prisma user object to safe response:
    - `id`
    - `name`
    - `email`
    - `status`
    - `role`

- Update `backend/src/app.js`.
  - Import `authRoutes`.
  - Add `app.use("/api/auth", authRoutes);`

- Use backend validation even though frontend also validates forms.
- Test in Postman:
  - Register admin.
  - Login admin.
  - Call `/api/auth/me` with token.
  - Try `/api/auth/me` without token and confirm `401`.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/auth.ts`.
  - `RoleName = "ADMIN" | "TECHNICIAN" | "DRIVER"`
  - `AuthUser`
  - `LoginPayload`
  - `RegisterPayload`
  - `AuthResponse`
  - `RegisterResponse`
  - `MeResponse`

- Create `frontend/src/services/authService.ts`.
  - `register(payload)`
  - `login(payload)`
  - `getMe()`
  - `logout()` if the frontend chooses to call the backend logout endpoint before clearing local storage.
  - Use `frontend/src/services/api.ts`.

- Update `frontend/src/services/api.ts`.
  - Add request interceptor to attach JWT from local storage.
  - Add response handling for `401`.

- Create `frontend/src/context/AuthContext.tsx`.
  - Store:
    - `user`
    - `token`
    - `isAuthenticated`
    - `login`
    - `register`
    - `logout`
  - Load existing token on app startup.
  - Call `/api/auth/me` if token exists.

- Create `frontend/src/components/ProtectedRoute.tsx`.
  - Redirect unauthenticated users to `/login`.

- Create `frontend/src/components/RoleGuard.tsx`.
  - Hide or block UI for roles that are not allowed.

- Create or update role-aware layout components:
  - `frontend/src/components/Sidebar.tsx`
    - Owns navigation items and `NavLink` active states.
    - Filters visible nav links by logged-in role.
  - `frontend/src/components/Topbar.tsx`
    - Shows page title, current user, role badge, and logout action.
  - `frontend/src/components/AppLayout.tsx`
    - Composes `Sidebar`, `Topbar`, and `Outlet`.

- Create pages:
  - `frontend/src/pages/Login.tsx`
  - `frontend/src/pages/Register.tsx`

- Update `frontend/src/App.tsx`.
  - Add public routes:
    - `/login`
    - `/register`
  - Wrap dashboard/module routes with `ProtectedRoute`.
  - Redirect `/` based on auth state.

- Role-based navigation:
  - `ADMIN`: dashboard, vehicles, drivers, assignments, maintenance, work orders, fault reports, fuel logs, documents, reports, settings.
  - `TECHNICIAN`: dashboard, assigned work orders, settings.
  - `DRIVER`: dashboard, fault reports, fuel logs, settings, and own assigned-vehicle flows after the driver profile link exists.

- Premium UI requirements:
  - Login/register screens should look polished, not like raw Bootstrap examples.
  - Use a centered auth panel with a restrained two-column desktop layout.
  - Use strong form spacing, clear labels, soft shadows, and high contrast buttons.
  - Use status feedback with Bootstrap alerts.
  - Avoid clutter, decorative overload, and large marketing hero sections.

- Acceptance checks:
  - User can register.
  - User can login.
  - Token is saved.
  - `/api/auth/logout` requires a valid token and returns success.
  - Protected routes cannot open without login.
  - Logout clears session.
  - Sidebar adapts to role.
  - Backend returns `403` for authenticated users who call a module endpoint outside their role.
