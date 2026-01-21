// ============================================
// FILE: src/controllers/journalController.js
// ============================================

const { Op } = require("sequelize");
const Journal = require("../models/Journal");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class JournalController {
  // Get all journals with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        year,
        issn,
        search,
        sortBy = "id",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filters
      if (category) where.category = category;
      if (year) where.year = year;
      if (issn) where.issn = { [Op.iLike]: `%${issn}%` };
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { authorKh: { [Op.iLike]: `%${search}%` } },
          { publisher: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Validate sortBy to prevent SQL injection
      const validSortColumns = ["id", "title", "author", "year", "publisher", "downloads", "views"];
      const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";

      const { count, rows } = await Journal.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[safeSortBy, order.toUpperCase()]],
        raw: true,
      });

      const journals = rows.map((journal) => ({
        id: journal.id.toString(),
        title: journal.title,
        titleKh: journal.titleKh,
        author: journal.author,
        authorKh: journal.authorKh,
        year: journal.year.toString(),
        cover: journal.coverUrl,
        category: journal.category,
        categoryKh: journal.categoryKh,
        publisher: journal.publisher,
        publisherKh: journal.publisherKh,
        issn: journal.issn,
        pages: journal.pages,
        downloads: journal.downloads || 0,
        views: journal.views || 0,
      }));

      const pagination = ResponseFormatter.paginate(page, limit, count);
      return ResponseFormatter.success(
        res,
        journals,
        "Journals retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single journal by ID
  static async getById(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);

      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      return ResponseFormatter.success(res, {
        id: journal.id.toString(),
        title: journal.title,
        titleKh: journal.titleKh,
        author: journal.author,
        authorKh: journal.authorKh,
        year: journal.year.toString(),
        date: journal.date,
        dateKh: journal.dateKh,
        cover: journal.coverUrl,
        pdfUrl: journal.pdfUrl,
        category: journal.category,
        categoryKh: journal.categoryKh,
        description: journal.description,
        descriptionKh: journal.descriptionKh,
        abstract: journal.abstract,
        abstractKh: journal.abstractKh,
        publisher: journal.publisher,
        publisherKh: journal.publisherKh,
        issn: journal.issn,
        volume: journal.volume,
        volumeKh: journal.volumeKh,
        pages: journal.pages,
        language: journal.language,
        languageKh: journal.languageKh,
        fileSize: journal.fileSize,
        downloads: journal.downloads || 0,
        views: journal.views || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new journal
  static async create(req, res, next) {
    try {
      const journalData = { ...req.body };

      // Handle file uploads if present
      if (req.files) {
        if (req.files.cover) {
          journalData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          journalData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
          journalData.fileSize = Helpers.formatFileSize(req.files.pdf[0].size);
        }
      }

      const journal = await Journal.create(journalData);

      return ResponseFormatter.success(
        res,
        journal,
        "Journal created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update journal
  static async update(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);

      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      const updateData = { ...req.body };

      // Handle file uploads
      if (req.files) {
        if (req.files.cover) {
          if (journal.coverUrl) {
            await Helpers.deleteFile(`.${journal.coverUrl}`);
          }
          updateData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          if (journal.pdfUrl) {
            await Helpers.deleteFile(`.${journal.pdfUrl}`);
          }
          updateData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
          updateData.fileSize = Helpers.formatFileSize(req.files.pdf[0].size);
        }
      }

      await journal.update(updateData);

      return ResponseFormatter.success(
        res,
        journal,
        "Journal updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete journal
  static async delete(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);

      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      // Delete associated files
      if (journal.coverUrl) {
        await Helpers.deleteFile(`.${journal.coverUrl}`);
      }
      if (journal.pdfUrl) {
        await Helpers.deleteFile(`.${journal.pdfUrl}`);
      }

      await journal.destroy();

      return ResponseFormatter.success(
        res,
        null,
        "Journal deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Download journal
  static async download(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);

      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      if (!journal.pdfUrl) {
        return ResponseFormatter.error(
          res,
          "PDF not available",
          404,
          "PDF_NOT_FOUND"
        );
      }

      // Increment download count
      await journal.increment("downloads");

      return ResponseFormatter.success(res, {
        downloadUrl: journal.pdfUrl,
        fileName: `${journal.title}.pdf`,
        fileSize: journal.fileSize,
      });
    } catch (error) {
      next(error);
    }
  }

  // Increment view count
  static async incrementView(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);

      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      await journal.increment("views");

      return ResponseFormatter.success(res, null, "View count updated");
    } catch (error) {
      next(error);
    }
  }

  // Get journals by category
  static async getByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 10 } = req.query;

      const journals = await Journal.findAll({
        where: { category },
        limit: parseInt(limit),
        order: [["id", "DESC"]],
      });

      return ResponseFormatter.success(res, journals);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JournalController;