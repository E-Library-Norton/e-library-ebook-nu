// ============================================
// FILE: src/controllers/audioController.js
// ============================================

const { Op } = require("sequelize");
const Audio = require("../models/Audio");
const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class AudioController {
  // Get all audios with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        speaker,
        search,
        sortBy = "createdAt",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filters
      if (category) where.category = category;
      if (speaker) where.speaker = { [Op.iLike]: `%${speaker}%` };
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { titleKh: { [Op.iLike]: `%${search}%` } },
          { speaker: { [Op.iLike]: `%${search}%` } },
          { speakerKh: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Audio.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order.toUpperCase()]],
      });

      const audios = rows.map((audio) => ({
        id: audio.id.toString(),
        thumbnail: audio.thumbnailUrl,
        title: audio.title,
        titleKh: audio.titleKh,
        duration: audio.duration,
        speaker: audio.speaker,
        speakerKh: audio.speakerKh,
        audioUrl: audio.audioUrl,
        category: audio.category,
        tags: audio.tags,
        plays: audio.plays,
        downloads: audio.downloads,
      }));

      const pagination = ResponseFormatter.paginate(page, limit, count);
      return ResponseFormatter.success(
        res,
        audios,
        "Audios retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single audio by ID
  static async getById(req, res, next) {
    try {
      const audio = await Audio.findByPk(req.params.id);

      if (!audio) {
        return ResponseFormatter.notFound(res, "Audio not found");
      }

      return ResponseFormatter.success(res, {
        id: audio.id.toString(),
        title: audio.title,
        titleKh: audio.titleKh,
        speaker: audio.speaker,
        speakerKh: audio.speakerKh,
        thumbnail: audio.thumbnailUrl,
        audioUrl: audio.audioUrl,
        duration: audio.duration,
        description: audio.description,
        descriptionKh: audio.descriptionKh,
        category: audio.category,
        tags: audio.tags,
        fileSize: audio.fileSize,
        plays: audio.plays,
        downloads: audio.downloads,
        createdAt: audio.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new audio
  static async create(req, res, next) {
    try {
      const audioData = {
        ...req.body,
        tags: Helpers.parseTags(req.body.tags),
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.thumbnail) {
          audioData.thumbnailUrl = `/uploads/covers/${req.files.thumbnail[0].filename}`;
        }
        if (req.files.audio) {
          audioData.audioUrl = `/uploads/audios/${req.files.audio[0].filename}`;
          audioData.fileSize = Helpers.formatFileSize(req.files.audio[0].size);
        }
      }

      const audio = await Audio.create(audioData);

      return ResponseFormatter.success(
        res,
        audio,
        "Audio created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update audio
  static async update(req, res, next) {
    try {
      const audio = await Audio.findByPk(req.params.id);

      if (!audio) {
        return ResponseFormatter.notFound(res, "Audio not found");
      }

      const updateData = {
        ...req.body,
        tags: req.body.tags ? Helpers.parseTags(req.body.tags) : audio.tags,
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.thumbnail) {
          if (audio.thumbnailUrl) {
            await Helpers.deleteFile(`.${audio.thumbnailUrl}`);
          }
          updateData.thumbnailUrl = `/uploads/covers/${req.files.thumbnail[0].filename}`;
        }
        if (req.files.audio) {
          if (audio.audioUrl) {
            await Helpers.deleteFile(`.${audio.audioUrl}`);
          }
          updateData.audioUrl = `/uploads/audios/${req.files.audio[0].filename}`;
          updateData.fileSize = Helpers.formatFileSize(req.files.audio[0].size);
        }
      }

      await audio.update(updateData);

      return ResponseFormatter.success(
        res,
        audio,
        "Audio updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete audio
  static async delete(req, res, next) {
    try {
      const audio = await Audio.findByPk(req.params.id);

      if (!audio) {
        return ResponseFormatter.notFound(res, "Audio not found");
      }

      // Delete associated files
      if (audio.thumbnailUrl) {
        await Helpers.deleteFile(`.${audio.thumbnailUrl}`);
      }
      if (audio.audioUrl) {
        await Helpers.deleteFile(`.${audio.audioUrl}`);
      }

      await audio.destroy();

      return ResponseFormatter.success(res, null, "Audio deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Increment play count
  static async incrementPlay(req, res, next) {
    try {
      const audio = await Audio.findByPk(req.params.id);

      if (!audio) {
        return ResponseFormatter.notFound(res, "Audio not found");
      }

      await audio.increment("plays");

      return ResponseFormatter.success(
        res,
        {
          audioUrl: audio.audioUrl,
          plays: audio.plays + 1,
        },
        "Play count updated"
      );
    } catch (error) {
      next(error);
    }
  }

  // Download audio
  static async download(req, res, next) {
    try {
      const audio = await Audio.findByPk(req.params.id);

      if (!audio) {
        return ResponseFormatter.notFound(res, "Audio not found");
      }

      if (!audio.audioUrl) {
        return ResponseFormatter.error(
          res,
          "Audio file not available",
          404,
          "AUDIO_NOT_FOUND"
        );
      }

      await audio.increment("downloads");

      return ResponseFormatter.success(res, {
        downloadUrl: audio.audioUrl,
        fileName: `${audio.title}.mp3`,
        fileSize: audio.fileSize,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AudioController;
