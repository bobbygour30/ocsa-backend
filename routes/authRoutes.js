const express = require('express');
const router = express.Router();
const {
  register,
  registerVendor,
  registerFranchiser,
  registerAdmin,
  login,
  getDashboard,
  forgotPassword,
  resetPassword,
  getMe,
  getVendors,
  verifyVendor,
} = require('../controllers/authController');
const { protect, admin, vendor, franchiser } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/register-vendor', registerVendor);
router.post('/register-franchiser', registerFranchiser);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (all authenticated users)
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);

// Vendor routes
router.get('/vendors', protect, getVendors);

// Admin only routes
router.post('/register-admin', protect, admin, registerAdmin);
router.put('/verify-vendor/:id', protect, admin, verifyVendor);

module.exports = router;