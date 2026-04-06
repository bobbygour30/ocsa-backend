const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'repair-services',
      'auto-services',
      'beauty-services',
      'fine-dining-services',
      'home-delivery-services',
      'professional-services'
    ],
  },
  subCategory: {
    type: String,
    trim: true,
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  features: [{
    icon: String,
    title: String,
    description: String,
  }],
  duration: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Update timestamp on save
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if model already exists to prevent overwriting
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

module.exports = Service;