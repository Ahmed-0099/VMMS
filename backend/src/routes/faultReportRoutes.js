const express = require("express");
const {
  convertFaultReportToWorkOrder,
  createFaultReport,
  listFaultReports,
  updateFaultReportStatus,
} = require("../controllers/faultReportController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "DRIVER"), listFaultReports);
router.post("/", requireRole("DRIVER"), createFaultReport);
router.patch("/:id/status", requireRole("ADMIN"), updateFaultReportStatus);
router.post("/:id/convert-to-work-order", requireRole("ADMIN"), convertFaultReportToWorkOrder);

module.exports = router;
