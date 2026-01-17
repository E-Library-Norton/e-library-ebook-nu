// ============================================
// FILE: src/routes/auth.js
// ============================================

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

router.post('/register', userValidation.register, AuthController.register);
router.post('/login', userValidation.login, AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/change-password', authenticate, AuthController.changePassword);

module.exports = router;
