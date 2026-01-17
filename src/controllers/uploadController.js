// ============================================
// FILE: src/controllers/uploadController.js
// ============================================

const ResponseFormatter = require("../utils/responseFormatter");
const Helpers = require("../utils/helpers");

class UploadController {
  // Single file upload
  static async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return ResponseFormatter.error(
          res,
          "No file uploaded",
          400,
          "FILE_REQUIRED"
        );
      }

      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        formattedSize: Helpers.formatFileSize(req.file.size),
        path: `/${req.file.path.replace(/\\/g, "/")}`,
        url: `${req.protocol}://${req.get("host")}/${req.file.path.replace(
          /\\/g,
          "/"
        )}`,
      };

      return ResponseFormatter.success(
        res,
        fileInfo,
        "File uploaded successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Multiple files upload
  static async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return ResponseFormatter.error(
          res,
          "No files uploaded",
          400,
          "FILES_REQUIRED"
        );
      }

      const filesInfo = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        formattedSize: Helpers.formatFileSize(file.size),
        path: `/${file.path.replace(/\\/g, "/")}`,
        url: `${req.protocol}://${req.get("host")}/${file.path.replace(
          /\\/g,
          "/"
        )}`,
      }));

      return ResponseFormatter.success(
        res,
        { files: filesInfo, count: filesInfo.length },
        "Files uploaded successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete uploaded file
  static async deleteFile(req, res, next) {
    try {
      const { filepath } = req.body;

      if (!filepath) {
        return ResponseFormatter.error(
          res,
          "File path is required",
          400,
          "FILEPATH_REQUIRED"
        );
      }

      const deleted = await Helpers.deleteFile(`.${filepath}`);

      if (!deleted) {
        return ResponseFormatter.error(
          res,
          "Failed to delete file",
          500,
          "DELETE_FAILED"
        );
      }

      return ResponseFormatter.success(res, null, "File deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UploadController;
