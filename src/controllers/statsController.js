// ============================================
// FILE: src/controllers/statsController.js
// ============================================

const {
  Thesis,
  Publication,
  Journal,
  Audio,
  Video,
  User,
} = require("../models");
const { sequelize } = require("../config/database");
const ResponseFormatter = require("../utils/responseFormatter");

class StatsController {
  static async getOverview(req, res, next) {
    try {
      const [
        totalthesis,
        totalPublications,
        totalJournals,
        totalAudios,
        totalVideos,
        totalUsers,
        downloadStats,
        viewStats,
      ] = await Promise.all([
        Thesis.count(),
        Publication.count(),
        Journal.count(),
        Audio.count(),
        Video.count(),
        User.count(),
        Thesis.sum("downloads"),
        Thesis.sum("views"),
      ]);

      return ResponseFormatter.success(res, {
        totalthesis,
        totalPublications,
        totalJournals,
        totalAudios,
        totalVideos,
        totalUsers,
        totalDownloads:
          (downloadStats || 0) +
          ((await Journal.sum("downloads")) || 0) +
          ((await Publication.sum("downloads")) || 0),
        totalViews:
          (viewStats || 0) +
          ((await Journal.sum("views")) || 0) +
          ((await Video.sum("views")) || 0),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPopular(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const [popularthesis, popularJournals] = await Promise.all([
        Thesis.findAll({
          order: [["downloads", "DESC"]],
          limit: parseInt(limit),
          attributes: [
            "id",
            "title",
            "author",
            "downloads",
            "views",
            "coverUrl",
          ],
        }),
        Journal.findAll({
          order: [["downloads", "DESC"]],
          limit: parseInt(limit),
          attributes: [
            "id",
            "title",
            "author",
            "downloads",
            "views",
            "coverUrl",
          ],
        }),
      ]);

      return ResponseFormatter.success(res, {
        popularthesis,
        popularJournals,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecent(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const [recentthesis, recentJournals] = await Promise.all([
        Thesis.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          attributes: [
            "id",
            "title",
            "author",
            "year",
            "coverUrl",
            "createdAt",
          ],
        }),
        Journal.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          attributes: [
            "id",
            "title",
            "author",
            "year",
            "coverUrl",
            "createdAt",
          ],
        }),
      ]);

      return ResponseFormatter.success(res, {
        recentthesis,
        recentJournals,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatsController;
