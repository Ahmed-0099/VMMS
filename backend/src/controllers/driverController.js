const {
  createDriver: createDriverRecord,
  deleteDriver: deleteDriverRecord,
  findDriverById,
  findDriverByUserId,
  findDriverUsers,
  findDrivers,
  updateDriver: updateDriverRecord,
} = require("../services/driverService");
const { createHttpError } = require("../utils/httpError");
const { normalizeDriverStatus } = require("../utils/driverStatus");

function cleanOptionalString(value) {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue || null;
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

function validateDriverPayload(payload) {
  const fullName = String(payload.fullName ?? "").trim();
  const licenseNumber = String(payload.licenseNumber ?? "").trim().toUpperCase();
  const licenseExpiry = parseDate(payload.licenseExpiry, "License expiry date");
  const status = normalizeDriverStatus(payload.status);

  if (!fullName) {
    throw createHttpError(400, "Full name is required");
  }

  if (!licenseNumber) {
    throw createHttpError(400, "License number is required");
  }

  if (!status) {
    throw createHttpError(400, "Driver status is invalid");
  }

  return {
    userId: cleanOptionalString(payload.userId),
    fullName,
    cnic: cleanOptionalString(payload.cnic),
    licenseNumber,
    licenseExpiry,
    phone: cleanOptionalString(payload.phone),
    address: cleanOptionalString(payload.address),
    status,
  };
}

function getDriverFilters(query) {
  const status = query.status ? normalizeDriverStatus(query.status, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Driver status filter is invalid");
  }

  return {
    search: cleanOptionalString(query.search),
    status,
  };
}

async function listDrivers(req, res, next) {
  try {
    const drivers = await findDrivers(getDriverFilters(req.query));
    res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

async function getDriverById(req, res, next) {
  try {
    const driver = await findDriverById(req.params.id);

    if (!driver) {
      throw createHttpError(404, "Driver not found");
    }

    res.json({ driver });
  } catch (error) {
    next(error);
  }
}

async function getMyDriverProfile(req, res, next) {
  try {
    const driver = await findDriverByUserId(req.user.userId);

    if (!driver) {
      throw createHttpError(404, "No driver profile is linked to this account");
    }

    res.json({ driver });
  } catch (error) {
    next(error);
  }
}

async function listDriverUsers(req, res, next) {
  try {
    const users = await findDriverUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function createDriver(req, res, next) {
  try {
    const driver = await createDriverRecord(validateDriverPayload(req.body));

    res.status(201).json({
      message: "Driver created successfully",
      driver,
    });
  } catch (error) {
    next(error);
  }
}

async function updateDriver(req, res, next) {
  try {
    const driver = await updateDriverRecord(req.params.id, validateDriverPayload(req.body));

    res.json({
      message: "Driver updated successfully",
      driver,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const result = await deleteDriverRecord(req.params.id);

    res.json({
      message: result.action === "deleted" ? "Driver deleted successfully" : "Driver has related records and was marked inactive",
      driver: result.driver,
      action: result.action,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDriver,
  deleteDriver,
  getDriverById,
  getMyDriverProfile,
  listDriverUsers,
  listDrivers,
  updateDriver,
};
