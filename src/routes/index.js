// ============================================
// FILE: src/routes/index.js
// ============================================

const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./auth");
const thesisRoutes = require("./thesis");
const journalsRoutes = require("./journals");
const categoriesRoutes = require("./categories");
const searchRoutes = require("./search");
const statsRoutes = require("./stats");

// Mount routes
router.use("/auth", authRoutes);
router.use("/thesis", thesisRoutes);
router.use("/journals", journalsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/search", searchRoutes);
router.use("/stats", statsRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    name: "E-Library API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      thesis: "/api/thesis",
      journals: "/api/journals",
      categories: "/api/categories",
      search: "/api/search",
      stats: "/api/stats",
    },
  });
});

module.exports = router;
