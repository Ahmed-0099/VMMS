const express = require("express");
const {
  createFuelLog,
  deleteFuelLog,
  listFuelLogs,
  updateFuelLog,
} = require("../controllers/fuelLogController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "DRIVER"), listFuelLogs);
router.post("/", requireRole("ADMIN", "DRIVER"), createFuelLog);
router.put("/:id", requireRole("ADMIN", "DRIVER"), updateFuelLog);
router.delete("/:id", requireRole("ADMIN"), deleteFuelLog);

module.exports = router;
