const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const workOrderRoutes = require("./routes/workOrderRoutes");
const fuelLogRoutes = require("./routes/fuelLogRoutes");
const complianceDocumentRoutes = require("./routes/complianceDocumentRoutes");
const faultReportRoutes = require("./routes/faultReportRoutes");

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

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/fuel-logs", fuelLogRoutes);
app.use("/api/compliance-documents", complianceDocumentRoutes);
app.use("/api/fault-reports", faultReportRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
});

module.exports = app;
