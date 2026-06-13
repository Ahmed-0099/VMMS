const {
  getComplianceSummary,
  getFuelSummary,
  getVehicleSummary,
  getWorkOrderSummary,
} = require("../services/reportService");
const { normalizeComplianceDocumentStatus } = require("../utils/documentStatus");
const { createHttpError } = require("../utils/httpError");
const { normalizeVehicleStatus } = require("../utils/vehicleStatus");
const { normalizeWorkOrderStatus } = require("../utils/workOrderStatus");

function cleanOptionalString(value) {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue || null;
}

function parseOptionalDateFilter(value, fieldName, endOfDay = false) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

function validateDateRange(from, to) {
  if (from && to && from.getTime() > to.getTime()) {
    throw createHttpError(400, "From date cannot be after to date");
  }
}

function getBaseFilters(query) {
  const from = parseOptionalDateFilter(query.from, "From date");
  const to = parseOptionalDateFilter(query.to, "To date", true);

  validateDateRange(from, to);

  return {
    from,
    to,
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

function getVehicleStatusFilter(query, fieldName) {
  if (!query.status) {
    return null;
  }

  const status = normalizeVehicleStatus(query.status, null);

  if (!status) {
    throw createHttpError(400, `${fieldName} status filter is invalid`);
  }

  return status;
}

function getWorkOrderStatusFilter(query) {
  if (!query.status) {
    return null;
  }

  const status = normalizeWorkOrderStatus(query.status, null);

  if (!status) {
    throw createHttpError(400, "Work order status filter is invalid");
  }

  return status;
}

function getComplianceStatusFilter(query) {
  if (!query.status) {
    return null;
  }

  const status = normalizeComplianceDocumentStatus(query.status, null);

  if (!status) {
    throw createHttpError(400, "Compliance status filter is invalid");
  }

  return status;
}

async function getVehicleReport(req, res, next) {
  try {
    const report = await getVehicleSummary({
      ...getBaseFilters(req.query),
      status: getVehicleStatusFilter(req.query, "Vehicle"),
    });

    res.json({ report });
  } catch (error) {
    next(error);
  }
}

async function getFuelReport(req, res, next) {
  try {
    const report = await getFuelSummary({
      ...getBaseFilters(req.query),
      status: getVehicleStatusFilter(req.query, "Vehicle"),
    });

    res.json({ report });
  } catch (error) {
    next(error);
  }
}

async function getWorkOrderReport(req, res, next) {
  try {
    const report = await getWorkOrderSummary({
      ...getBaseFilters(req.query),
      status: getWorkOrderStatusFilter(req.query),
    });

    res.json({ report });
  } catch (error) {
    next(error);
  }
}

async function getComplianceReport(req, res, next) {
  try {
    const report = await getComplianceSummary({
      ...getBaseFilters(req.query),
      status: getComplianceStatusFilter(req.query),
    });

    res.json({ report });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getComplianceReport,
  getFuelReport,
  getVehicleReport,
  getWorkOrderReport,
};
