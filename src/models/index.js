// ============================================
// FILE: src/models/index.js
// ============================================

const User = require("./User");
const Thesis = require("./Thesis");
const Publication = require("./Publication");
const Journal = require("./Journal");
const Audio = require("./Audio");
const Video = require("./Video");
const Category = require("./Category");

// Export all models
module.exports = {
  User,
  Thesis,
  Publication,
  Journal,
  Audio,
  Video,
  Category,
};
