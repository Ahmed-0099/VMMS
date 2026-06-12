const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "vmms-api",
  });
});

router.get("/db", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
