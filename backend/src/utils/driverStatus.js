const DRIVER_STATUSES = ["ACTIVE", "INACTIVE"];

function normalizeDriverStatus(status, fallback = "ACTIVE") {
  const normalizedStatus = String(status ?? fallback).trim().toUpperCase();
  return DRIVER_STATUSES.includes(normalizedStatus) ? normalizedStatus : null;
}

module.exports = {
  DRIVER_STATUSES,
  normalizeDriverStatus,
};
