const {
  createSchedule: createScheduleRecord,
  createWorkOrderFromSchedule: createWorkOrderFromScheduleRecord,
  deleteSchedule: deleteScheduleRecord,
  findSchedules,
  updateSchedule: updateScheduleRecord,
} = require("../services/maintenanceScheduleService");
const { createHttpError } = require("../utils/httpError");
const { normalizeMaintenanceScheduleStatus } = require("../utils/maintenanceStatus");
const { normalizeWorkOrderPriority } = require("../utils/workOrderStatus");

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

function parseOptionalNonNegativeInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw createHttpError(400, `${fieldName} must be a non-negative whole number`);
  }

  return parsedValue;
}

function parseBoolean(value) {
  return ["1", "true", "yes"].includes(String(value ?? "").trim().toLowerCase());
}

function getScheduleFilters(query) {
  const status = query.status ? normalizeMaintenanceScheduleStatus(query.status, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Maintenance schedule status filter is invalid");
  }

  return {
    dueOnly: parseBoolean(query.dueOnly),
    status,
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

function validateSchedulePayload(payload) {
  const nextDueDate = parseOptionalDate(payload.nextDueDate, "Next due date");
  const nextDueOdometer = parseOptionalNonNegativeInteger(payload.nextDueOdometer, "Next due odometer");
  const status = normalizeMaintenanceScheduleStatus(payload.status);

  if (!status) {
    throw createHttpError(400, "Maintenance schedule status is invalid");
  }

  if (!nextDueDate && nextDueOdometer === null) {
    throw createHttpError(400, "Next due date or next due odometer is required");
  }

  return {
    nextDueDate,
    nextDueOdometer,
    notes: cleanOptionalString(payload.notes),
    serviceType: cleanRequiredString(payload.serviceType, "Service type"),
    status,
    vehicleId: cleanRequiredString(payload.vehicleId, "Vehicle"),
  };
}

function validateWorkOrderPayload(payload) {
  const priority = normalizeWorkOrderPriority(payload.priority);

  if (!priority) {
    throw createHttpError(400, "Work order priority is invalid");
  }

  return {
    description: cleanRequiredString(payload.description, "Description"),
    dueDate: parseOptionalDate(payload.dueDate, "Due date"),
    priority,
    technicianId: cleanOptionalString(payload.technicianId),
  };
}

async function listSchedules(req, res, next) {
  try {
    const schedules = await findSchedules(getScheduleFilters(req.query));
    res.json({ schedules });
  } catch (error) {
    next(error);
  }
}

async function createSchedule(req, res, next) {
  try {
    const schedule = await createScheduleRecord(validateSchedulePayload(req.body));

    res.status(201).json({
      message: "Maintenance schedule created successfully",
      schedule,
    });
  } catch (error) {
    next(error);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const schedule = await updateScheduleRecord(req.params.id, validateSchedulePayload(req.body));

    res.json({
      message: "Maintenance schedule updated successfully",
      schedule,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteSchedule(req, res, next) {
  try {
    const result = await deleteScheduleRecord(req.params.id);

    res.json({
      action: result.action,
      message: result.action === "deleted" ? "Maintenance schedule deleted successfully" : "Schedule has work orders and was cancelled",
      schedule: result.schedule,
    });
  } catch (error) {
    next(error);
  }
}

async function createWorkOrderFromSchedule(req, res, next) {
  try {
    const result = await createWorkOrderFromScheduleRecord(req.params.id, validateWorkOrderPayload(req.body));

    res.status(201).json({
      message: "Work order created from maintenance schedule successfully",
      schedule: result.schedule,
      workOrder: result.workOrder,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSchedule,
  createWorkOrderFromSchedule,
  deleteSchedule,
  listSchedules,
  updateSchedule,
};
