// ============================================
// FILE: src/controllers/publicationController.js
// ============================================

const { Op } = require("sequelize");
const Publication = require("../models/Publication");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class PublicationController {
  // Get all publications with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        year,
        publisher,
        search,
        sortBy = "id",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {}; 

      // Filters
      if (category) where.category = category;
      if (year) where.year = year;
      if (publisher) where.publisher = { [Op.iLike]: `%${publisher}%` };
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { authorKh: { [Op.iLike]: `%${search}%` } },
          { isbn: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Validate sortBy to prevent SQL injection
      const validSortColumns = ["id", "title", "author", "year", "publisher", "downloads", "views"];
      const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";

      const { count, rows } = await Publication.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[safeSortBy, order.toUpperCase()]],
        raw: true,
      });

      const publications = rows.map((pub) => ({
        id: pub.id.toString(),
        title: pub.title,
        titleKh: pub.titleKh,
        author: pub.author,
        authorKh: pub.authorKh,
        year: pub.year.toString(),
        cover: pub.coverUrl,
        category: pub.category,
        categoryKh: pub.categoryKh,
        publisher: pub.publisher,
        isbn: pub.isbn,
        pages: pub.pages,
        downloads: pub.downloads || 0,
        views: pub.views || 0,
      }));

      const pagination = ResponseFormatter.paginate(page, limit, count);
      return ResponseFormatter.success(
        res,
        publications,
        "Publications retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single publication by ID
  static async getById(req, res, next) {
    try {
      const publication = await Publication.findByPk(req.params.id);

      if (!publication) {
        return ResponseFormatter.notFound(res, "Publication not found");
      }

      return ResponseFormatter.success(res, {
        id: publication.id.toString(),
        title: publication.title,
        titleKh: publication.titleKh,
        author: publication.author,
        authorKh: publication.authorKh,
        year: publication.year.toString(),
        cover: publication.coverUrl,
        pdfUrl: publication.pdfUrl,
        category: publication.category,
        categoryKh: publication.categoryKh,
        description: publication.description,
        descriptionKh: publication.descriptionKh,
        publisher: publication.publisher,
        publisherKh: publication.publisherKh,
        isbn: publication.isbn,
        pages: publication.pages,
        language: publication.language,
        fileSize: publication.fileSize,
        downloads: publication.downloads || 0,
        views: publication.views || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new publication
  static async create(req, res, next) {
    try {
      const publicationData = { ...req.body };

      // Handle file uploads if present
      if (req.files) {
        if (req.files.cover) {
          publicationData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          publicationData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
          publicationData.fileSize = Helpers.formatFileSize(
            req.files.pdf[0].size
          );
        }
      }

      const publication = await Publication.create(publicationData);

      return ResponseFormatter.success(
        res,
        publication,
        "Publication created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update publication
  static async update(req, res, next) {
    try {
      const publication = await Publication.findByPk(req.params.id);

      if (!publication) {
        return ResponseFormatter.notFound(res, "Publication not found");
      }

      const updateData = { ...req.body };

      // Handle file uploads
      if (req.files) {
        if (req.files.cover) {
          if (publication.coverUrl) {
            await Helpers.deleteFile(`.${publication.coverUrl}`);
          }
          updateData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
        }
        if (req.files.pdf) {
          if (publication.pdfUrl) {
            await Helpers.deleteFile(`.${publication.pdfUrl}`);
          }
          updateData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
          updateData.fileSize = Helpers.formatFileSize(req.files.pdf[0].size);
        }
      }

      await publication.update(updateData);

      return ResponseFormatter.success(
        res,
        publication,
        "Publication updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete publication
  static async delete(req, res, next) {
    try {
      const publication = await Publication.findByPk(req.params.id);

      if (!publication) {
        return ResponseFormatter.notFound(res, "Publication not found");
      }

      // Delete associated files
      if (publication.coverUrl) {
        await Helpers.deleteFile(`.${publication.coverUrl}`);
      }
      if (publication.pdfUrl) {
        await Helpers.deleteFile(`.${publication.pdfUrl}`);
      }

      await publication.destroy();

      return ResponseFormatter.success(
        res,
        null,
        "Publication deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Download publication
  static async download(req, res, next) {
    try {
      const publication = await Publication.findByPk(req.params.id);

      if (!publication) {
        return ResponseFormatter.notFound(res, "Publication not found");
      }

      if (!publication.pdfUrl) {
        return ResponseFormatter.error(
          res,
          "PDF not available",
          404,
          "PDF_NOT_FOUND"
        );
      }

      // Increment download count
      await publication.increment("downloads");

      return ResponseFormatter.success(res, {
        downloadUrl: publication.pdfUrl,
        fileName: `${publication.title}.pdf`,
        fileSize: publication.fileSize,
      });
    } catch (error) {
      next(error);
    }
  }

  // Increment view count
  static async incrementView(req, res, next) {
    try {
      const publication = await Publication.findByPk(req.params.id);

      if (!publication) {
        return ResponseFormatter.notFound(res, "Publication not found");
      }

      await publication.increment("views");

      return ResponseFormatter.success(res, null, "View count updated");
    } catch (error) {
      next(error);
    }
  }

  // Get publications by category
  static async getByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 10 } = req.query;

      const publications = await Publication.findAll({
        where: { category },
        limit: parseInt(limit),
        order: [["id", "DESC"]],
      });

      return ResponseFormatter.success(res, publications);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PublicationController;