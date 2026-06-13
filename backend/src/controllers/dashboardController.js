const { getDashboardSummary } = require("../services/dashboardService");

async function getSummary(req, res, next) {
  try {
    const summary = await getDashboardSummary(req.user);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary,
};
