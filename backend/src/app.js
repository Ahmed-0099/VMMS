const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "VMMS API",
    status: "running",
    version: "1.0.0",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal server error",
  });
});

module.exports = app;
