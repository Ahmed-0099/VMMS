const {
  createVehicle: createVehicleRecord,
  deleteVehicle: deleteVehicleRecord,
  findVehicleById,
  findVehicles,
  updateVehicle: updateVehicleRecord,
} = require("../services/vehicleService");
const { createHttpError } = require("../utils/httpError");
const { normalizeVehicleStatus } = require("../utils/vehicleStatus");

function cleanOptionalString(value) {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue || null;
}

function parseOptionalInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw createHttpError(400, `${fieldName} must be a non-negative whole number`);
  }

  return parsedValue;
}

function validateVehiclePayload(payload) {
  const registrationNumber = String(payload.registrationNumber ?? "").trim().toUpperCase();
  const make = String(payload.make ?? "").trim();
  const model = String(payload.model ?? "").trim();
  const fuelType = String(payload.fuelType ?? "").trim();
  const status = normalizeVehicleStatus(payload.status);

  if (!registrationNumber) {
    throw createHttpError(400, "Registration number is required");
  }

  if (!make) {
    throw createHttpError(400, "Vehicle make is required");
  }

  if (!model) {
    throw createHttpError(400, "Vehicle model is required");
  }

  if (!fuelType) {
    throw createHttpError(400, "Fuel type is required");
  }

  if (!status) {
    throw createHttpError(400, "Vehicle status is invalid");
  }

  const year = parseOptionalInteger(payload.year, "Year");
  const currentOdometer = parseOptionalInteger(payload.currentOdometer, "Current odometer");
  const nextYear = new Date().getFullYear() + 1;

  if (year !== null && (year < 1900 || year > nextYear)) {
    throw createHttpError(400, `Year must be between 1900 and ${nextYear}`);
  }

  return {
    registrationNumber,
    make,
    model,
    year,
    vin: cleanOptionalString(payload.vin),
    fuelType,
    category: cleanOptionalString(payload.category),
    currentOdometer,
    status,
  };
}

function getVehicleFilters(query) {
  const status = query.status ? normalizeVehicleStatus(query.status, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Vehicle status filter is invalid");
  }

  return {
    search: cleanOptionalString(query.search),
    status,
    fuelType: cleanOptionalString(query.fuelType),
    category: cleanOptionalString(query.category),
  };
}

async function listVehicles(req, res, next) {
  try {
    const vehicles = await findVehicles(getVehicleFilters(req.query));
    res.json({ vehicles });
  } catch (error) {
    next(error);
  }
}

async function getVehicleById(req, res, next) {
  try {
    const vehicle = await findVehicleById(req.params.id);

    if (!vehicle) {
      throw createHttpError(404, "Vehicle not found");
    }

    res.json({ vehicle });
  } catch (error) {
    next(error);
  }
}

async function createVehicle(req, res, next) {
  try {
    const vehicle = await createVehicleRecord(validateVehiclePayload(req.body));

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const vehicle = await updateVehicleRecord(req.params.id, validateVehiclePayload(req.body));

    res.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteVehicle(req, res, next) {
  try {
    await deleteVehicleRecord(req.params.id);

    res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  listVehicles,
  updateVehicle,
};
