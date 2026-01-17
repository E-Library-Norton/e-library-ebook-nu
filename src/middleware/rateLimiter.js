// ============================================
// FILE: src/middleware/rateLimiter.js
// ============================================

const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts, please try again later.",
    },
  },
  skipSuccessfulRequests: true,
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    error: {
      code: "UPLOAD_LIMIT_EXCEEDED",
      message: "Upload limit exceeded, please try again later.",
    },
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
};
