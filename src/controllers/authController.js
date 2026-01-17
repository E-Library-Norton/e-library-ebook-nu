// ============================================
// FILE: src/controllers/authController.js
// ============================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ResponseFormatter = require("../utils/responseFormatter");

class AuthController {
  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
  }

  // Register new user
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, role, universityId } =
        req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return ResponseFormatter.error(
          res,
          "Email already registered",
          400,
          "DUPLICATE_EMAIL"
        );
      }

      // Create user
      const user = await User.create({
        email,
        passwordHash: password,
        firstName,
        lastName,
        role: role || "student",
        universityId,
      });

      // Generate token
      const token = AuthController.generateToken(user);

      return ResponseFormatter.success(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
        "User registered successfully!",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return ResponseFormatter.unauthorized(res, "Invalid email or password");
      }

      // Check if user is active
      if (!user.isActive) {
        return ResponseFormatter.forbidden(res, "Account is deactivated");
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return ResponseFormatter.unauthorized(res, "Invalid email or password");
      }

      // Generate token
      const token = AuthController.generateToken(user);

      return ResponseFormatter.success(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
        "Login successfully!"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      return ResponseFormatter.success(res, {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        universityId: req.user.universityId,
        createdAt: req.user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update profile
  static async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, universityId } = req.body;

      await req.user.update({
        firstName,
        lastName,
        universityId,
      });

      return ResponseFormatter.success(
        res,
        {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          universityId: req.user.universityId,
        },
        "Profile updated successfully!"
      );
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate current password
      const isValid = await req.user.validatePassword(currentPassword);
      if (!isValid) {
        return ResponseFormatter.error(
          res,
          "Current password is incorrect",
          400,
          "INVALID_PASSWORD"
        );
      }

      // Update password
      await req.user.update({ passwordHash: newPassword });

      return ResponseFormatter.success(
        res,
        null,
        "Password changed successfully!"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
