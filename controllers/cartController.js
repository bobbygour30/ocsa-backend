const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Service = require('../models/Service');

// Get user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { serviceId, quantity = 1, additionalServices = {} } = req.body;
    
    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    
    // Parse price to number
    let price = parseFloat(service.price);
    if (isNaN(price)) {
      const priceMatch = service.price.match(/\d+(?:\.\d+)?/);
      price = priceMatch ? parseFloat(priceMatch[0]) : 0;
    }
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.serviceId.toString() === serviceId
    );
    
    const cartItem = {
      serviceId,
      title: service.title,
      price: price,
      priceDisplay: service.price,
      quantity,
      image: service.images && service.images[0] ? service.images[0].url : '',
      category: service.category,
      additionalServices: {
        extendedWarranty: additionalServices.extendedWarranty || false,
        priorityService: additionalServices.priorityService || false,
      },
    };
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push(cartItem);
    }
    
    await cart.save();
    
    res.json({ msg: 'Item added to cart', cart });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { serviceId, quantity, additionalServices } = req.body;
    
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.serviceId.toString() === serviceId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    
    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }
    
    if (additionalServices) {
      cart.items[itemIndex].additionalServices = {
        extendedWarranty: additionalServices.extendedWarranty || false,
        priorityService: additionalServices.priorityService || false,
      };
    }
    
    await cart.save();
    
    res.json({ msg: 'Cart updated', cart });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.serviceId.toString() !== serviceId
    );
    
    await cart.save();
    
    res.json({ msg: 'Item removed from cart', cart });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ msg: 'Cart cleared', cart });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const {
      paymentMethod,
      promoCode,
      address,
      scheduleDate,
      scheduleTime,
      notes,
      additionalServices,
    } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }
    
    // Calculate totals
    let subtotal = 0;
    const items = cart.items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return {
        serviceId: item.serviceId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        additionalServices: item.additionalServices,
      };
    });
    
    // Additional services charges
    let additionalCharges = {
      extendedWarranty: 0,
      priorityService: 0,
    };
    
    if (additionalServices) {
      if (additionalServices.extendedWarranty) {
        additionalCharges.extendedWarranty = 299;
      }
      if (additionalServices.priorityService) {
        additionalCharges.priorityService = 199;
      }
    }
    
    const additionalTotal = additionalCharges.extendedWarranty + additionalCharges.priorityService;
    const totalBeforeGST = subtotal + additionalTotal;
    const gst = totalBeforeGST * 0.18;
    const total = totalBeforeGST + gst;
    
    // Get user details
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    // Create order
    const order = new Order({
      userId: req.user.id,
      userDetails: {
        name: user.username,
        email: user.email,
        phone: user.mobile,
      },
      items,
      subtotal,
      additionalCharges,
      gst,
      total,
      paymentMethod,
      promoCode: promoCode ? { code: promoCode.code, discount: promoCode.discount } : undefined,
      address,
      scheduleDate,
      scheduleTime,
      notes,
      orderStatus: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    });
    
    await order.save();
    
    // Clear cart after successful order
    cart.items = [];
    await cart.save();
    
    res.status(201).json({
      msg: 'Order created successfully',
      order,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user's orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.id,
      userId: req.user.id,
    });
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getOrders,
  getOrderById,
};