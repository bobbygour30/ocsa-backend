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

// Public routes
router.get('/services', getServices);
router.get('/services/:id', getServiceById);
router.get('/category/:category', getServicesByCategory);
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Admin only routes
router.post(
  '/services',
  protect,
  admin,
  uploadMultiple.array('images', 5),
  createService
);

router.put(
  '/services/:id',
  protect,
  admin,
  uploadMultiple.array('images', 5),
  updateService
);

router.delete('/services/:id', protect, admin, deleteService);

router.post(
  '/categories',
  protect,
  admin,
  uploadSingle.single('image'),
  createCategory
);

router.put(
  '/categories/:slug',
  protect,
  admin,
  uploadSingle.single('image'),
  createCategory
);

module.exports = router;