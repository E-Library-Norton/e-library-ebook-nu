// ============================================
// FILE: src/controllers/thesisController.js (FIXED)
// ============================================

const { Op } = require("sequelize");
const Thesis = require("../models/Thesis");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class ThesisController {
  // Get all theses with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        year,
        search,
        sortBy = "created_at",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filters
      if (category) where.category = category;
      if (year) where.year = year;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { authorKh: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Fetch data
      const { count, rows } = await Thesis.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order.toUpperCase()]],
      });

      // Format response - FIXED: Added missing fields
      const theses = rows.map((thesis) => ({
        id: thesis.id.toString(),
        title: thesis.title,
        titleKh: thesis.titleKh,
        author: thesis.author,
        authorKh: thesis.authorKh,
        university: thesis.university,
        universityKh: thesis.universityKh, // ADDED
        year: thesis.year.toString(),
        cover: thesis.coverUrl,
        category: thesis.category,
        categoryKh: thesis.categoryKh, // ADDED (if exists in model)
        tags: thesis.tags,
        downloads: thesis.downloads,
        views: thesis.views,
        createdAt: thesis.createdAt,
        updatedAt: thesis.updatedAt,
      }));

      const pagination = ResponseFormatter.paginate(page, limit, count);

      return ResponseFormatter.success(
        res,
        theses,
        "Theses retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
      console.error('Error in getAll:', error);
      next(error);
    }
  }

  // Get single thesis by ID
  static async getById(req, res, next) {
    try {
      const thesis = await Thesis.findByPk(req.params.id);

      if (!thesis) {
        return ResponseFormatter.notFound(res, "Thesis not found");
      }

      return ResponseFormatter.success(res, {
        id: thesis.id.toString(),
        title: thesis.title,
        titleKh: thesis.titleKh,
        author: thesis.author,
        authorKh: thesis.authorKh,
        university: thesis.university,
        universityKh: thesis.universityKh,
        supervisor: thesis.supervisor, // ADDED
        supervisorKh: thesis.supervisorKh, // ADDED
        major: thesis.major, // ADDED
        majorKh: thesis.majorKh, // ADDED
        type: thesis.type, // ADDED
        year: thesis.year.toString(),
        abstract: thesis.abstract,
        abstractKh: thesis.abstractKh,
        description: thesis.description,
        descriptionKh: thesis.descriptionKh,
        cover: thesis.coverUrl,
        pdfUrl: thesis.pdfUrl,
        category: thesis.category,
        categoryKh: thesis.categoryKh, // ADDED
        tags: thesis.tags,
        language: thesis.language,
        pages: thesis.pages,
        fileSize: thesis.fileSize,
        downloads: thesis.downloads,
        views: thesis.views,
        createdAt: thesis.createdAt,
        updatedAt: thesis.updatedAt,
      });
    } catch (error) {
      console.error('Error in getById:', error);
      next(error);
    }
  }

  // Create new thesis
  static async create(req, res, next) {
    try {
      const thesisData = {
        ...req.body,
        tags: Helpers.parseTags(req.body.tags),
      };

      // Handle file uploads if present
      if (req.files) {
        if (req.files.cover) {
          thesisData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          thesisData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
          thesisData.fileSize = Helpers.formatFileSize(req.files.pdf[0].size);
        }
      }

      const thesis = await Thesis.create(thesisData);

      return ResponseFormatter.success(
        res,
        thesis,
        "Thesis created successfully",
        201
      );
    } catch (error) {
      console.error('Error in create:', error);
      next(error);
    }
  }

  // Update thesis
  static async update(req, res, next) {
    try {
      const thesis = await Thesis.findByPk(req.params.id);

      if (!thesis) {
        return ResponseFormatter.notFound(res, "Thesis not found");
      }

      const updateData = {
        ...req.body,
        tags: req.body.tags ? Helpers.parseTags(req.body.tags) : thesis.tags,
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.cover) {
          // Delete old cover if exists
          if (thesis.coverUrl) {
            await Helpers.deleteFile(`.${thesis.coverUrl}`);
          }
          updateData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          // Delete old PDF if exists
          if (thesis.pdfUrl) {
            await Helpers.deleteFile(`.${thesis.pdfUrl}`);
          }
          updateData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
          updateData.fileSize = Helpers.formatFileSize(req.files.pdf[0].size);
        }
      }

      await thesis.update(updateData);

      return ResponseFormatter.success(
        res,
        thesis,
        "Thesis updated successfully"
      );
    } catch (error) {
      console.error('Error in update:', error);
      next(error);
    }
  }

  // Delete thesis
  static async delete(req, res, next) {
    try {
      const thesis = await Thesis.findByPk(req.params.id);

      if (!thesis) {
        return ResponseFormatter.notFound(res, "Thesis not found");
      }

      // Delete associated files
      if (thesis.coverUrl) {
        await Helpers.deleteFile(`.${thesis.coverUrl}`);
      }
      if (thesis.pdfUrl) {
        await Helpers.deleteFile(`.${thesis.pdfUrl}`);
      }

      await thesis.destroy();

      return ResponseFormatter.success(
        res,
        null,
        "Thesis deleted successfully",
        204
      );
    } catch (error) {
      console.error('Error in delete:', error);
      next(error);
    }
  }

  // Download thesis (increment download count)
  static async download(req, res, next) {
    try {
      const thesis = await Thesis.findByPk(req.params.id);

      if (!thesis) {
        return ResponseFormatter.notFound(res, "Thesis not found");
      }

      if (!thesis.pdfUrl) {
        return ResponseFormatter.error(
          res,
          "PDF not available",
          404,
          "PDF_NOT_FOUND"
        );
      }

      // Increment download count
      await thesis.increment("downloads");

      return ResponseFormatter.success(res, {
        downloadUrl: thesis.pdfUrl,
        fileName: `${thesis.title}.pdf`,
        fileSize: thesis.fileSize,
      });
    } catch (error) {
      console.error('Error in download:', error);
      next(error);
    }
  }

  // Increment view count
  static async incrementView(req, res, next) {
    try {
      const thesis = await Thesis.findByPk(req.params.id);

      if (!thesis) {
        return ResponseFormatter.notFound(res, "Thesis not found");
      }

      await thesis.increment("views");

      return ResponseFormatter.success(res, null, "View count updated");
    } catch (error) {
      console.error('Error in incrementView:', error);
      next(error);
    }
  }
}

module.exports = ThesisController;