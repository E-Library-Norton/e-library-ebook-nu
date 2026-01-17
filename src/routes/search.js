// ============================================
// FILE: src/routes/search.js
// ============================================

const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/searchController");
const { queryValidation } = require("../middleware/validation");

router.get("/", queryValidation.search, SearchController.search);

module.exports = router;
