# Implementation Plan: Settings

## 1. DB RELATED CHANGES

- Reuse the existing `User` model for account settings.
- Do not add a new Prisma settings table for the current semester scope.
- Store browser-level UI preferences in `localStorage`:
  - Theme preference: light, dark, or system.
  - Table density preference: comfortable or compact.
- Store admin VMMS defaults in `localStorage` for this scope:
  - Organization name.
  - Contact email and phone.
  - Address.
  - Report footer label.
  - Compliance document warning days.
  - Maintenance warning days.
  - Currency.
  - Distance unit.

## 2. BACKEND RELATED CHANGES

- Update `backend/src/controllers/authController.js`.
  - Add validation for profile updates.
  - Add validation for password changes.
  - Add `updateProfile` controller to update the authenticated user's name.
  - Add `updatePassword` controller to verify current password and save the hashed new password.
- Update `backend/src/routes/authRoutes.js`.
  - Add `PATCH /api/auth/profile`.
  - Add `PATCH /api/auth/password`.
- Keep RBAC simple:
  - Admin, Technician, and Driver can update their own account name.
  - Admin, Technician, and Driver can change their own password.
  - Admin-only organization/system preferences remain frontend-local for this scope.

## 3. FRONTEND RELATED CHANGES

- Replace the placeholder `/settings` route with a real `Settings` page.
- Create `frontend/src/pages/Settings.tsx`.
  - Show signed-in user name, email, and role.
  - Show role-based module access summary.
  - Show role-based dashboard summary cards.
  - Add profile update form.
  - Add change password form.
  - Add appearance preferences form.
  - Add admin-only organization and system preferences form.
- Update `frontend/src/context/AuthContext.tsx`.
  - Expose `updateProfile`.
  - Expose `changePassword`.
  - Update authenticated user state after profile save.
- Update `frontend/src/services/authService.ts`.
  - Add profile update API call.
  - Add password update API call.
- Update `frontend/src/types/auth.ts`.
  - Add profile and password payload/response types.
- Add `frontend/src/utils/settingsPreferences.ts`.
  - Load, save, and apply UI preferences.
  - Load and save admin VMMS preferences.
- Update `frontend/src/main.tsx`.
  - Apply saved UI preferences before rendering the app.
- Update `frontend/src/App.css`.
  - Add Settings page layout.
  - Add responsive Settings behavior.
  - Add dark theme styling.
  - Add compact density styling.
