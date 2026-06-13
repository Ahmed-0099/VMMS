const {
  createFuelLog: createFuelLogRecord,
  deleteFuelLog: deleteFuelLogRecord,
  findDriverFuelContext,
  findFuelLogById,
  findFuelLogs,
  updateFuelLog: updateFuelLogRecord,
} = require("../services/fuelLogService");
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

function parsePositiveNumber(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw createHttpError(400, `${fieldName} must be a positive number`);
  }

  return parsedValue;
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

function validateFuelLogPayload(payload) {
  return {
    date: parseRequiredDate(payload.date, "Fuel date"),
    driverId: cleanOptionalString(payload.driverId),
    fuelType: cleanRequiredString(payload.fuelType, "Fuel type"),
    odometerReading: parseOptionalNonNegativeInteger(payload.odometerReading, "Odometer reading"),
    quantity: parsePositiveNumber(payload.quantity, "Quantity"),
    unitCost: parsePositiveNumber(payload.unitCost, "Unit cost"),
    vehicleId: cleanRequiredString(payload.vehicleId, "Vehicle"),
  };
}

function getFuelLogFilters(query) {
  const from = parseOptionalDateFilter(query.from, "From date");
  const to = parseOptionalDateFilter(query.to, "To date", true);

  if (from && to && from.getTime() > to.getTime()) {
    throw createHttpError(400, "From date cannot be after to date");
  }

  return {
    driverId: cleanOptionalString(query.driverId),
    from,
    to,
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

async function getDriverScopedFilters(userId, query) {
  const { driver } = await findDriverFuelContext(userId);

  return {
    ...getFuelLogFilters(query),
    driverId: driver.id,
  };
}

async function getDriverCreatePayload(userId, payload) {
  const { activeAssignment, driver } = await findDriverFuelContext(userId);

  if (!activeAssignment) {
    throw createHttpError(400, "You need an active vehicle assignment before adding fuel logs");
  }

  if (payload.vehicleId && payload.vehicleId !== activeAssignment.vehicleId) {
    throw createHttpError(403, "Drivers can only add fuel logs for their assigned vehicle");
  }

  return {
    ...payload,
    driverId: driver.id,
    vehicleId: activeAssignment.vehicleId,
  };
}

async function getDriverUpdatePayload(userId, fuelLogId, payload) {
  const { driver } = await findDriverFuelContext(userId);
  const fuelLog = await findFuelLogById(fuelLogId);

  if (!fuelLog) {
    throw createHttpError(404, "Fuel log not found");
  }

  if (fuelLog.driverId !== driver.id) {
    throw createHttpError(403, "You do not have permission to update this fuel log");
  }

  return {
    ...payload,
    driverId: driver.id,
    vehicleId: fuelLog.vehicleId,
  };
}

async function listFuelLogs(req, res, next) {
  try {
    const filters =
      req.user.role === "DRIVER" ? await getDriverScopedFilters(req.user.userId, req.query) : getFuelLogFilters(req.query);
    const fuelLogs = await findFuelLogs(filters);

    res.json({ fuelLogs });
  } catch (error) {
    next(error);
  }
}

async function createFuelLog(req, res, next) {
  try {
    const validatedPayload = validateFuelLogPayload(req.body);
    const payload =
      req.user.role === "DRIVER" ? await getDriverCreatePayload(req.user.userId, validatedPayload) : validatedPayload;
    const fuelLog = await createFuelLogRecord(payload);

    res.status(201).json({
      fuelLog,
      message: "Fuel log created successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function updateFuelLog(req, res, next) {
  try {
    const validatedPayload = validateFuelLogPayload(req.body);
    const payload =
      req.user.role === "DRIVER"
        ? await getDriverUpdatePayload(req.user.userId, req.params.id, validatedPayload)
        : validatedPayload;
    const fuelLog = await updateFuelLogRecord(req.params.id, payload);

    res.json({
      fuelLog,
      message: "Fuel log updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteFuelLog(req, res, next) {
  try {
    await deleteFuelLogRecord(req.params.id);

    res.json({
      message: "Fuel log deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFuelLog,
  deleteFuelLog,
  listFuelLogs,
  updateFuelLog,
};
