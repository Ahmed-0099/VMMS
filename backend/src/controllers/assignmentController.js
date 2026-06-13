const {
  createAssignment: createAssignmentRecord,
  endAssignment: endAssignmentRecord,
  findAssignments,
  getActiveAssignmentForLoggedInDriver,
} = require("../services/assignmentService");
const { normalizeAssignmentStatus } = require("../utils/assignmentStatus");
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

function parseDate(value, fieldName) {
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

function parseOptionalDate(value, fallback) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, "End date must be a valid date");
  }

  return date;
}

function getAssignmentFilters(query) {
  const status = query.status ? normalizeAssignmentStatus(query.status, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Assignment status filter is invalid");
  }

  return {
    driverId: cleanOptionalString(query.driverId),
    status,
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

function validateAssignmentPayload(payload) {
  return {
    driverId: cleanRequiredString(payload.driverId, "Driver"),
    startDate: parseDate(payload.startDate, "Start date"),
    vehicleId: cleanRequiredString(payload.vehicleId, "Vehicle"),
  };
}

async function listAssignments(req, res, next) {
  try {
    const assignments = await findAssignments(getAssignmentFilters(req.query));
    res.json({ assignments });
  } catch (error) {
    next(error);
  }
}

async function createAssignment(req, res, next) {
  try {
    const assignment = await createAssignmentRecord(validateAssignmentPayload(req.body));

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
}

async function endAssignment(req, res, next) {
  try {
    const assignment = await endAssignmentRecord(req.params.id, parseOptionalDate(req.body.endDate, new Date()));

    res.json({
      message: "Assignment ended successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyActiveAssignment(req, res, next) {
  try {
    const assignment = await getActiveAssignmentForLoggedInDriver(req.user.userId);

    res.json({
      assignment,
      message: assignment ? "Active assignment found" : "No active assignment found for this driver",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAssignment,
  endAssignment,
  getMyActiveAssignment,
  listAssignments,
};
