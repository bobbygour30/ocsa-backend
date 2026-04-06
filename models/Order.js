const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  image: {
    type: String,
  },
  additionalServices: {
    extendedWarranty: {
      type: Boolean,
      default: false,
    },
    priorityService: {
      type: Boolean,
      default: false,
    },
  },
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userDetails: {
    name: String,
    email: String,
    phone: String,
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  additionalCharges: {
    extendedWarranty: {
      type: Number,
      default: 0,
    },
    priorityService: {
      type: Number,
      default: 0,
    },
  },
  gst: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'upi', 'card', 'cod'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  promoCode: {
    code: String,
    discount: Number,
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  scheduleDate: {
    type: Date,
  },
  scheduleTime: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate order ID before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderId = `ORD${year}${month}${day}${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);