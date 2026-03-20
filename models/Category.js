const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  icon: String,
  image: {
    url: String,
    publicId: String,
  },
  heroTitle: String,
  heroDescription: String,
  heroGradient: {
    from: String,
    to: String,
  },
  features: [{
    icon: String,
    title: String,
    description: String,
  }],
  brands: [String],
  testimonials: [{
    name: String,
    comment: String,
    rating: Number,
    date: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
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

CategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Category', CategorySchema);