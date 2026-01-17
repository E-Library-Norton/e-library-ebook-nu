// ============================================
// FILE: src/middleware/auth.js
// ============================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ResponseFormatter = require("../utils/responseFormatter");

// Authenticate JWT token
const authenticate = async (req, res, next) => {
  // return next(); // Temporarily disable authentication
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return ResponseFormatter.unauthorized(res, "Authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return ResponseFormatter.unauthorized(res, "Invalid authentication");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return ResponseFormatter.unauthorized(res, "Invalid or expired token");
  }
};

// Authorize by roles
const authorize = (...allowedRoles) => {

  // return next();
  return (req, res, next) => {
    if (!req.user) {
      return ResponseFormatter.unauthorized(res, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ResponseFormatter.forbidden(
        res,
        "You do not have permission to perform this action"
      );
    }

    next();
  };
};

// Optional authentication (for public endpoints that benefit from auth)
const optionalAuth = async (req, res, next) => {

  // return next();
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
