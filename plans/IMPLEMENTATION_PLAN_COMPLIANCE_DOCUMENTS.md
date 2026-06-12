# Implementation Plan: Compliance Documents

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: record vehicle compliance documents, track expiry dates, show status, and optionally upload files.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `ComplianceDocument`.
- Required fields:
  - `id`
  - `vehicleId`
  - `documentType`
  - `documentNumber`
  - `issueDate`
  - `expiryDate`
  - `filePath`
  - `status`
  - `createdAt`
  - `updatedAt`
- Required enum:
  - `ComplianceDocumentStatus`
    - `VALID`
    - `EXPIRING_SOON`
    - `EXPIRED`
- Relationships:
  - Compliance document belongs to vehicle.
- Indexes:
  - `vehicleId`
  - `expiryDate`
  - `status`
- Keep cloud storage, email reminders, SMS reminders, and approval workflow out of Phase 1.

## 2. BACKEND RELATED CHANGES

- Optional dependency if implementing file upload:

```powershell
cd backend
npm install multer
```

- Create `backend/src/utils/documentStatus.js`.
  - `getComplianceStatus(expiryDate)`
    - Expired if expiry date is before today.
    - Expiring soon if expiry date is within next 30 days.
    - Otherwise valid.

- Create `backend/src/controllers/complianceDocumentController.js`.
  - `listDocuments(req, res, next)`
    - Query params:
      - `vehicleId`
      - `status`
      - `documentType`
  - `createDocument(req, res, next)`
    - Validate vehicle exists.
    - Calculate status from expiry date.
    - Save metadata.
  - `updateDocument(req, res, next)`
    - Recalculate status if expiry date changes.
  - `deleteDocument(req, res, next)`

- Create `backend/src/services/complianceDocumentService.js`.
  - `findDocuments(filters)`
  - `createDocument(data)`
  - `updateDocument(id, data)`
  - `deleteDocument(id)`
  - `refreshDocumentStatuses()`

- Create `backend/src/routes/complianceDocumentRoutes.js`.
  - `GET /api/compliance-documents`
  - `POST /api/compliance-documents`
  - `PUT /api/compliance-documents/:id`
  - `DELETE /api/compliance-documents/:id`

- If file upload is implemented:
  - Create `backend/src/middleware/uploadMiddleware.js`.
  - Store files under `backend/uploads/documents`.
  - Add `/uploads` static route in `backend/src/app.js`.
  - Add `uploads/` to `.gitignore`.

- Update `backend/src/app.js`.
  - Add `app.use("/api/compliance-documents", complianceDocumentRoutes);`

- Role protection:
  - `ADMIN`: full access.
  - `DRIVER` and `TECHNICIAN`: no write access in Phase 1.

- Test in Postman:
  - Create valid document.
  - Create expired document.
  - Create expiring soon document.
  - Filter by status.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/complianceDocument.ts`.
  - `ComplianceDocumentStatus`
  - `ComplianceDocument`
  - `ComplianceDocumentFormValues`
  - `ComplianceDocumentFilters`

- Create `frontend/src/services/complianceDocumentService.ts`.
  - `getComplianceDocuments(filters)`
  - `createComplianceDocument(values)`
  - `updateComplianceDocument(id, values)`
  - `deleteComplianceDocument(id)`

- Create `frontend/src/hooks/useComplianceDocuments.ts`.
  - Load documents.
  - Manage filters.
  - Reload after changes.

- Create `frontend/src/pages/ComplianceDocuments.tsx`.
  - Header with Add Document.
  - Summary cards:
    - valid
    - expiring soon
    - expired
  - Filters:
    - vehicle
    - status
    - document type
  - Document table.

- Create `frontend/src/components/complianceDocuments/ComplianceDocumentForm.tsx`.
  - Vehicle select.
  - Document type.
  - Document number.
  - Issue date.
  - Expiry date.
  - Optional file input.

- Create `frontend/src/components/complianceDocuments/ComplianceDocumentTable.tsx`.
  - Columns:
    - vehicle
    - document type
    - document number
    - expiry date
    - status
    - actions

- Use status badges:
  - Valid: success.
  - Expiring Soon: warning.
  - Expired: danger.

- Premium UI requirements:
  - Compliance page should feel precise and alert-driven.
  - Expiring and expired documents should be visually obvious.
  - Use a clean table with strong date formatting.
  - Avoid making file upload mandatory unless backend upload is complete.

- Acceptance checks:
  - Add document.
  - Status calculates correctly.
  - Dashboard count reflects expiring/expired documents.
  - Filters work.
