const VEHICLE_STATUSES = ["ACTIVE", "IN_MAINTENANCE", "OUT_OF_SERVICE"];

function normalizeVehicleStatus(status, fallback = "ACTIVE") {
  const normalizedStatus = String(status ?? fallback)
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  return VEHICLE_STATUSES.includes(normalizedStatus) ? normalizedStatus : null;
}

module.exports = {
  VEHICLE_STATUSES,
  normalizeVehicleStatus,
};
