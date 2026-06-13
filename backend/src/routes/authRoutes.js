const express = require("express");
const { login, logout, me, register, updatePassword, updateProfile } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);
router.patch("/password", requireAuth, updatePassword);
router.post("/logout", requireAuth, logout);

module.exports = router;
