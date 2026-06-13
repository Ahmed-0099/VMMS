const express = require("express");
const {
  createDriver,
  deleteDriver,
  getDriverById,
  getMyDriverProfile,
  listDriverUsers,
  listDrivers,
  updateDriver,
} = require("../controllers/driverController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/me", requireRole("DRIVER"), getMyDriverProfile);

router.use(requireRole("ADMIN"));

router.get("/", listDrivers);
router.post("/", createDriver);
router.get("/linkable-users", listDriverUsers);
router.get("/:id", getDriverById);
router.put("/:id", updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
