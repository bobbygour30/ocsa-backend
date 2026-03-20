const express = require('express');
const router = express.Router();
const {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and require admin access
router.use(protect, admin);

// Get admin dashboard stats
router.get('/stats', getAdminStats);

// Get all admins
router.get('/', getAdmins);

// Create new admin (super admin only)
router.post('/', createAdmin);

// Get admin by ID
router.get('/:id', getAdminById);

// Update admin
router.put('/:id', updateAdmin);

// Delete admin (super admin only)
router.delete('/:id', deleteAdmin);

module.exports = router;