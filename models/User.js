const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'franchiser', 'admin'],
    default: 'user',
  },
  
  // Admin specific fields
  adminLevel: {
    type: String,
    enum: ['super', 'regional', 'support'],
    default: 'support',
  },
  department: {
    type: String,
    enum: ['management', 'operations', 'finance', 'support', 'technical'],
    default: 'support',
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_vendors', 'manage_franchisers', 'manage_services', 'manage_categories', 'view_reports', 'manage_settings', 'manage_admins'],
  }],
  
  // Employee details
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  designation: {
    type: String,
  },
  joiningDate: {
    type: Date,
  },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  
  // Profile
  profileImage: {
    type: String,
    default: '',
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  
  // Reset OTP
  resetOTP: {
    type: String,
  },
  resetOTPExpire: {
    type: Date,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate employee ID for admins
UserSchema.pre('save', async function (next) {
  if (this.role === 'admin' && !this.employeeId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model('User').countDocuments({ role: 'admin' }) + 1;
    this.employeeId = `ADM${year}${count.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);