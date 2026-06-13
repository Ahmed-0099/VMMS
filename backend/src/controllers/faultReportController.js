const {
  convertToWorkOrder,
  createFaultReport: createFaultReportRecord,
  findFaultReportById,
  findFaultReports,
  resolveDriverContext,
  updateFaultReportStatus: updateFaultReportStatusRecord,
} = require("../services/faultReportService");
const { normalizeFaultReportStatus, normalizeFaultUrgency } = require("../utils/faultReportStatus");
const { createHttpError } = require("../utils/httpError");
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

function getFaultReportFilters(query, user) {
  const status = query.status ? normalizeFaultReportStatus(query.status, null) : null;
  const urgency = query.urgency ? normalizeFaultUrgency(query.urgency, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Fault report status filter is invalid");
  }

  if (query.urgency && !urgency) {
    throw createHttpError(400, "Fault report urgency filter is invalid");
  }

  return {
    driverId: user.role === "DRIVER" ? null : cleanOptionalString(query.driverId),
    reporterId: user.role === "DRIVER" ? user.userId : null,
    status,
    urgency,
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

function validateCreatePayload(payload) {
  const urgency = normalizeFaultUrgency(payload.urgency);

  if (!urgency) {
    throw createHttpError(400, "Fault urgency is invalid");
  }

  return {
    description: cleanRequiredString(payload.description, "Description"),
    photoPath: cleanOptionalString(payload.photoPath),
    urgency,
    vehicleId: cleanRequiredString(payload.vehicleId, "Vehicle"),
  };
}

function validateStatusPayload(payload) {
  const status = normalizeFaultReportStatus(payload.status, null);

  if (!status) {
    throw createHttpError(400, "Fault report status is invalid");
  }

  return status;
}

function validateConvertPayload(payload, reportDescription) {
  const priority = normalizeWorkOrderPriority(payload.priority);

  if (!priority) {
    throw createHttpError(400, "Work order priority is invalid");
  }

  return {
    description: cleanOptionalString(payload.description) || reportDescription,
    dueDate: parseOptionalDate(payload.dueDate, "Due date"),
    priority,
    serviceType: cleanRequiredString(payload.serviceType, "Service type"),
    technicianId: cleanOptionalString(payload.technicianId),
  };
}

async function listFaultReports(req, res, next) {
  try {
    const faultReports = await findFaultReports(getFaultReportFilters(req.query, req.user));
    res.json({ faultReports });
  } catch (error) {
    next(error);
  }
}

async function createFaultReport(req, res, next) {
  try {
    const validatedPayload = validateCreatePayload(req.body);
    const { activeAssignment, driver } = await resolveDriverContext(req.user.userId);

    if (validatedPayload.vehicleId !== activeAssignment.vehicleId) {
      throw createHttpError(403, "Drivers can only submit fault reports for their assigned vehicle");
    }

    const faultReport = await createFaultReportRecord({
      ...validatedPayload,
      driverId: driver.id,
      reporterId: req.user.userId,
      vehicleId: activeAssignment.vehicleId,
    });

    res.status(201).json({
      faultReport,
      message: "Fault report submitted successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function updateFaultReportStatus(req, res, next) {
  try {
    const faultReport = await updateFaultReportStatusRecord(req.params.id, validateStatusPayload(req.body));

    res.json({
      faultReport,
      message: "Fault report status updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function convertFaultReportToWorkOrder(req, res, next) {
  try {
    const report = await findFaultReportById(req.params.id);

    if (!report) {
      throw createHttpError(404, "Fault report not found");
    }

    const conversion = await convertToWorkOrder(req.params.id, validateConvertPayload(req.body, report?.description ?? ""));

    res.status(201).json({
      faultReport: conversion.faultReport,
      message: "Fault report converted to work order successfully",
      workOrder: conversion.workOrder,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  convertFaultReportToWorkOrder,
  createFaultReport,
  listFaultReports,
  updateFaultReportStatus,
};
