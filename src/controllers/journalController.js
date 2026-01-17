// ============================================
// FILE: src/controllers/journalController.js
// ============================================

const { Op } = require("sequelize");
const Journal = require("../models/Journal");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class JournalController {
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        year,
        issn,
        search,
        sortBy = "createdAt",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (category) where.category = category;
      if (year) where.year = year;
      if (issn) where.issn = issn;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Journal.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order.toUpperCase()]],
      });

      const journals = rows.map((j) => ({
        id: j.id.toString(),
        title: j.title,
        titleKh: j.titleKh,
        author: j.author,
        date: j.date,
        year: j.year.toString(),
        cover: j.coverUrl,
        category: j.category,
        pages: j.pages?.toString(),
        volume: j.volume,
        issn: j.issn,
        abstract: j.abstract,
        downloads: j.downloads,
        views: j.views,
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

  static async getById(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);
      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }
      return ResponseFormatter.success(res, journal);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const journalData = { ...req.body };

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

  static async update(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);
      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      const updateData = { ...req.body };

      if (req.files) {
        if (req.files.cover) {
          if (journal.coverUrl)
            await Helpers.deleteFile(`.${journal.coverUrl}`);
          updateData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          if (journal.pdfUrl) await Helpers.deleteFile(`.${journal.pdfUrl}`);
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

  static async delete(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);
      if (!journal) {
        return ResponseFormatter.notFound(res, "Journal not found");
      }

      if (journal.coverUrl) await Helpers.deleteFile(`.${journal.coverUrl}`);
      if (journal.pdfUrl) await Helpers.deleteFile(`.${journal.pdfUrl}`);

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

  static async download(req, res, next) {
    try {
      const journal = await Journal.findByPk(req.params.id);
      if (!journal || !journal.pdfUrl) {
        return ResponseFormatter.notFound(res, "Journal PDF not found");
      }

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
}

module.exports = JournalController;
