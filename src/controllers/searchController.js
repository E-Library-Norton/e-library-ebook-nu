// ============================================
// FILE: src/controllers/searchController.js
// ============================================

const { Op } = require("sequelize");
const { Thesis, Publication, Journal, Audio, Video } = require("../models");
const ResponseFormatter = require("../utils/responseFormatter");

class SearchController {
  static async search(req, res, next) {
    try {
      const { q, type = "all", category, year, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return ResponseFormatter.validationError(res, [
          { field: "q", message: "Search query must be at least 2 characters" },
        ]);
      }

      const searchCondition = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { titleKh: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
        ],
      };

      if (category) searchCondition.category = category;
      if (year) searchCondition.year = year;

      const searchLimit = parseInt(limit);
      const results = {};

      // Search in different resources based on type
      if (type === "all" || type === "thesis") {
        results.thesis = await Thesis.findAll({
          where: searchCondition,
          limit: searchLimit,
          attributes: [
            "id",
            "title",
            "titleKh",
            "author",
            "year",
            "coverUrl",
            "category",
          ],
        });
      }

      if (type === "all" || type === "publication") {
        results.publications = await Publication.findAll({
          where: searchCondition,
          limit: searchLimit,
          attributes: [
            "id",
            "title",
            "titleKh",
            "author",
            "year",
            "coverUrl",
            "category",
          ],
        });
      }

      if (type === "all" || type === "journal") {
        results.journals = await Journal.findAll({
          where: searchCondition,
          limit: searchLimit,
          attributes: [
            "id",
            "title",
            "titleKh",
            "author",
            "year",
            "coverUrl",
            "category",
            "issn",
          ],
        });
      }

      if (type === "all" || type === "audio") {
        results.audios = await Audio.findAll({
          where: searchCondition,
          limit: searchLimit,
          attributes: [
            "id",
            "title",
            "titleKh",
            "speaker",
            "thumbnailUrl",
            "duration",
          ],
        });
      }

      if (type === "all" || type === "video") {
        results.videos = await Video.findAll({
          where: searchCondition,
          limit: searchLimit,
          attributes: [
            "id",
            "title",
            "titleKh",
            "instructor",
            "thumbnailUrl",
            "duration",
          ],
        });
      }

      // Calculate total results
      const totalResults = Object.values(results).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
      );

      return ResponseFormatter.success(res, {
        query: q,
        type,
        results,
        totalResults,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SearchController;
