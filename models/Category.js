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
    from: { type: String, default: '#dc2626' },
    to: { type: String, default: '#b91c1c' },
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

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

module.exports = Category;