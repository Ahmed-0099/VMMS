const express = require("express");
const {
  getComplianceReport,
  getFuelReport,
  getVehicleReport,
  getWorkOrderReport,
} = require("../controllers/reportController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/vehicles", getVehicleReport);
router.get("/fuel", getFuelReport);
router.get("/work-orders", getWorkOrderReport);
router.get("/compliance", getComplianceReport);

module.exports = router;
