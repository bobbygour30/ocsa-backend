const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  getServicesByCategory,
  updateService,
  deleteService,
  createCategory,
  getCategories,
  getCategoryBySlug,
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/auth');
const uploadMultiple = require('../middleware/uploadMultiple');
const uploadSingle = require('../middleware/uploadSingle');

// ==================== TEST ROUTE ====================
router.get('/test', (req, res) => {
  res.json({ msg: 'Service routes are working!' });
});

// ==================== PUBLIC ROUTES ====================
// Get all services (with filters)
router.get('/', getServices);

// Get single service by ID
router.get('/:id', getServiceById);

// Get services by category
router.get('/category/:category', getServicesByCategory);

// Get all categories
router.get('/categories', getCategories);

// Get category by slug
router.get('/categories/:slug', getCategoryBySlug);

// ==================== ADMIN ONLY ROUTES ====================
// Create new service (admin only)
router.post('/', protect, admin, uploadMultiple.array('images', 5), createService);

// Update service (admin only)
router.put('/:id', protect, admin, uploadMultiple.array('images', 5), updateService);

// Delete service (admin only)
router.delete('/:id', protect, admin, deleteService);

// Create or update category (admin only)
router.post('/categories', protect, admin, uploadSingle.single('image'), createCategory);
router.put('/categories/:slug', protect, admin, uploadSingle.single('image'), createCategory);

module.exports = router;