// ============================================
// FILE: src/routes/stats.js
// ============================================

const express = require("express");
const router = express.Router();
const StatsController = require("../controllers/statsController");
const { authenticate, authorize } = require("../middleware/auth");

router.get(
  "/overview",
  authenticate,
  authorize("admin", "librarian"),
  StatsController.getOverview
);

router.get("/popular", StatsController.getPopular);
router.get("/recent", StatsController.getRecent);

module.exports = router;
