// ============================================
// FILE: src/utils/helpers.js
// ============================================

const fs = require("fs").promises;
const path = require("path");

class Helpers {
  // Delete file helper
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // Generate unique filename
  static generateFileName(originalName) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    return `${safeName}-${timestamp}-${randomStr}${ext}`;
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  // Sanitize filename
  static sanitizeFileName(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  // Parse tags
  static parseTags(tags) {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        return JSON.parse(tags);
      } catch {
        return tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
    }
    return [];
  }

  // Validate email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate random string
  static generateRandomString(length = 8) {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  // Sleep helper
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = Helpers;
