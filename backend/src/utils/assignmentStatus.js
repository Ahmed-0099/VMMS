const ASSIGNMENT_STATUSES = ["ACTIVE", "ENDED"];

function normalizeAssignmentStatus(status, fallback = "ACTIVE") {
  const normalizedStatus = String(status ?? fallback).trim().toUpperCase();
  return ASSIGNMENT_STATUSES.includes(normalizedStatus) ? normalizedStatus : null;
}

module.exports = {
  ASSIGNMENT_STATUSES,
  normalizeAssignmentStatus,
};
