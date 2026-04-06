const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getOrders,
  getOrderById,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart', updateCartItem);
router.delete('/cart/:serviceId', removeFromCart);
router.delete('/cart', clearCart);

// Order routes
router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

module.exports = router;