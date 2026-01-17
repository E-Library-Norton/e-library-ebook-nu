// ============================================
// FILE: src/controllers/videoController.js
// ============================================

const { Op } = require("sequelize");
const Video = require("../models/Video");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class VideoController {
  // Get all videos with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        instructor,
        search,
        sortBy = "createdAt",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filters
      if (category) where.category = category;
      if (instructor) where.instructor = { [Op.iLike]: `%${instructor}%` };
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { instructor: { [Op.iLike]: `%${instructor}%` } },
          { instructorKh: { [Op.iLike]: `%${instructor}%` } },
        ];
      }

      const { count, rows } = await Video.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order.toUpperCase()]],
      });

      const videos = rows.map((video) => ({
        id: video.id.toString(),
        thumbnail: video.thumbnailUrl,
        title: video.title,
        titleKh: video.titleKh,
        instructor: video.instructor,
        instructorKh: video.instructorKh,
        duration: video.duration,
        videoUrl: video.videoUrl,
        category: video.category,
        tags: video.tags,
        views: video.views,
      }));

      const pagination = ResponseFormatter.paginate(page, limit, count);
      return ResponseFormatter.success(
        res,
        videos,
        "Videos retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single video by ID
  static async getById(req, res, next) {
    try {
      const video = await Video.findByPk(req.params.id);

      if (!video) {
        return ResponseFormatter.notFound(res, "Video not found");
      }

      return ResponseFormatter.success(res, {
        id: video.id.toString(),
        title: video.title,
        titleKh: video.titleKh,
        instructor: video.instructor,
        instructorKh: video.instructorKh,
        thumbnail: video.thumbnailUrl,
        videoUrl: video.videoUrl,
        duration: video.duration,
        description: video.description,
        descriptionKh: video.descriptionKh,
        category: video.category,
        tags: video.tags,
        fileSize: video.fileSize,
        views: video.views,
        createdAt: video.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new video
  static async create(req, res, next) {
    try {
      const videoData = {
        ...req.body,
        tags: Helpers.parseTags(req.body.tags),
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.thumbnail) {
          videoData.thumbnailUrl = `/uploads/covers/${req.files.thumbnail[0].filename}`;
        }
        if (req.files.video) {
          videoData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
          videoData.fileSize = Helpers.formatFileSize(req.files.video[0].size);
        }
      }

      const video = await Video.create(videoData);

      return ResponseFormatter.success(
        res,
        video,
        "Video created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update video
  static async update(req, res, next) {
    try {
      const video = await Video.findByPk(req.params.id);

      if (!video) {
        return ResponseFormatter.notFound(res, "Video not found");
      }

      const updateData = {
        ...req.body,
        tags: req.body.tags ? Helpers.parseTags(req.body.tags) : video.tags,
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.thumbnail) {
          if (video.thumbnailUrl) {
            await Helpers.deleteFile(`.${video.thumbnailUrl}`);
          }
          updateData.thumbnailUrl = `/uploads/covers/${req.files.thumbnail[0].filename}`;
        }
        if (req.files.video) {
          if (video.videoUrl) {
            await Helpers.deleteFile(`.${video.videoUrl}`);
          }
          updateData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
          updateData.fileSize = Helpers.formatFileSize(req.files.video[0].size);
        }
      }

      await video.update(updateData);

      return ResponseFormatter.success(
        res,
        video,
        "Video updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete video
  static async delete(req, res, next) {
    try {
      const video = await Video.findByPk(req.params.id);

      if (!video) {
        return ResponseFormatter.notFound(res, "Video not found");
      }

      // Delete associated files
      if (video.thumbnailUrl) {
        await Helpers.deleteFile(`.${video.thumbnailUrl}`);
      }
      if (video.videoUrl) {
        await Helpers.deleteFile(`.${video.videoUrl}`);
      }

      await video.destroy();

      return ResponseFormatter.success(res, null, "Video deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Increment view count
  static async incrementView(req, res, next) {
    try {
      const video = await Video.findByPk(req.params.id);

      if (!video) {
        return ResponseFormatter.notFound(res, "Video not found");
      }

      await video.increment("views");

      return ResponseFormatter.success(
        res,
        {
          videoUrl: video.videoUrl,
          views: video.views + 1,
        },
        "View count updated"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get trending videos
  static async getTrending(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const videos = await Video.findAll({
        order: [["views", "DESC"]],
        limit: parseInt(limit),
        attributes: [
          "id",
          "title",
          "titleKh",
          "instructor",
          "thumbnailUrl",
          "duration",
          "views",
          "category",
        ],
      });

      return ResponseFormatter.success(
        res,
        videos,
        "Trending videos retrieved"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VideoController;
