// ============================================
// FILE: src/controllers/thesisController.js
// ============================================

const { Op } = require("sequelize");
const Thesis = require("../models/Thesis");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class ThesisController {
  // Get all thesis with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        year,
        university,
        search,
        sortBy = "id",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filters
      if (category) where.category = category;
      if (year) where.year = year;
      if (university) where.university = { [Op.iLike]: `%${university}%` };
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { authorKh: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Validate sortBy to prevent SQL injection
      const validSortColumns = ["id", "title", "author", "year", "university", "downloads", "views"];
      const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";

      const { count, rows } = await Thesis.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[safeSortBy, order.toUpperCase()]],
        raw: true,
      });

      const thesis = rows.map((thesis) => ({
        id: thesis.id.toString(),
        title: thesis.title,
        titleKh: thesis.titleKh,
        author: thesis.author,
        authorKh: thesis.authorKh,
        year: thesis.year.toString(),
        cover: thesis.coverUrl,
        category: thesis.category,
        categoryKh: thesis.categoryKh,
        university: thesis.university,
        universityKh: thesis.universityKh,
        pages: thesis.pages,
        downloads: thesis.downloads || 0,
        views: thesis.views || 0,
      }));

      const pagination = ResponseFormatter.paginate(page, limit, count);
      return ResponseFormatter.success(
        res,
        thesis,
        "thesis retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
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
        year: thesis.year.toString(),
        cover: thesis.coverUrl,
        pdfUrl: thesis.pdfUrl,
        category: thesis.category,
        categoryKh: thesis.categoryKh,
        description: thesis.description,
        descriptionKh: thesis.descriptionKh,
        supervisor: thesis.supervisor,
        supervisorKh: thesis.supervisorKh,
        major: thesis.major,
        majorKh: thesis.majorKh,
        university: thesis.university,
        universityKh: thesis.universityKh,
        pages: thesis.pages,
        language: thesis.language,
        fileSize: thesis.fileSize,
        downloads: thesis.downloads || 0,
        views: thesis.views || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new thesis
  static async create(req, res, next) {
    try {
      const thesisData = { ...req.body };

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

      const updateData = { ...req.body };

      // Handle file uploads
      if (req.files) {
        if (req.files.cover) {
          if (thesis.coverUrl) {
            await Helpers.deleteFile(`.${thesis.coverUrl}`);
          }
          updateData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
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
        "Thesis deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Download thesis
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
      next(error);
    }
  }

  // Get thesis by category
  static async getByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 10 } = req.query;

      const thesis = await Thesis.findAll({
        where: { category },
        limit: parseInt(limit),
        order: [["id", "DESC"]],
      });

      return ResponseFormatter.success(res, thesis);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ThesisController;