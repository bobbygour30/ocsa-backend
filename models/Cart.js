const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
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
  priceDisplay: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  image: {
    type: String,
  },
  category: {
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

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [CartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);