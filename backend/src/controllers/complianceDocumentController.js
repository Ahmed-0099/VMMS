const {
  createDocument: createDocumentRecord,
  deleteDocument: deleteDocumentRecord,
  findDocuments,
  updateDocument: updateDocumentRecord,
} = require("../services/complianceDocumentService");
const { normalizeComplianceDocumentStatus } = require("../utils/documentStatus");
const { createHttpError } = require("../utils/httpError");

function cleanOptionalString(value) {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue || null;
}

function cleanRequiredString(value, fieldName) {
  const normalizedValue = cleanOptionalString(value);

  if (!normalizedValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return normalizedValue;
}

function parseRequiredDate(value, fieldName) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }

  return date;
}

function parseOptionalDate(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }

  return date;
}

function getDocumentFilters(query) {
  const status = query.status ? normalizeComplianceDocumentStatus(query.status, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Compliance document status filter is invalid");
  }

  return {
    documentType: cleanOptionalString(query.documentType),
    status,
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

function validateDocumentPayload(payload) {
  const issueDate = parseOptionalDate(payload.issueDate, "Issue date");
  const expiryDate = parseRequiredDate(payload.expiryDate, "Expiry date");

  if (issueDate && issueDate.getTime() > expiryDate.getTime()) {
    throw createHttpError(400, "Issue date cannot be after expiry date");
  }

  return {
    documentNumber: cleanOptionalString(payload.documentNumber),
    documentType: cleanRequiredString(payload.documentType, "Document type"),
    expiryDate,
    filePath: cleanOptionalString(payload.filePath),
    issueDate,
    vehicleId: cleanRequiredString(payload.vehicleId, "Vehicle"),
  };
}

async function listDocuments(req, res, next) {
  try {
    const documents = await findDocuments(getDocumentFilters(req.query));
    res.json({ documents });
  } catch (error) {
    next(error);
  }
}

async function createDocument(req, res, next) {
  try {
    const document = await createDocumentRecord(validateDocumentPayload(req.body));

    res.status(201).json({
      document,
      message: "Compliance document created successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function updateDocument(req, res, next) {
  try {
    const document = await updateDocumentRecord(req.params.id, validateDocumentPayload(req.body));

    res.json({
      document,
      message: "Compliance document updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(req, res, next) {
  try {
    await deleteDocumentRecord(req.params.id);

    res.json({
      message: "Compliance document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDocument,
  deleteDocument,
  listDocuments,
  updateDocument,
};
