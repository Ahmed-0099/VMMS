const express = require("express");
const {
  createSchedule,
  createWorkOrderFromSchedule,
  deleteSchedule,
  listSchedules,
  updateSchedule,
} = require("../controllers/maintenanceScheduleController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/", listSchedules);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);
router.post("/:id/create-work-order", createWorkOrderFromSchedule);

module.exports = router;
