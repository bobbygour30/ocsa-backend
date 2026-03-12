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
  
  // Vendor specific fields
  businessName: {
    type: String,
    trim: true,
  },
  businessType: {
    type: String,
    enum: ['repair', 'auto', 'beauty', 'restaurant', 'delivery', 'professional'],
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  gstNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
  serviceAreas: [{
    type: String,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  // Franchiser specific fields
  franchiseName: {
    type: String,
  },
  franchiseRegion: {
    type: String,
  },
  franchiseCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  assignedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Admin specific fields
  adminLevel: {
    type: String,
    enum: ['super', 'regional', 'support'],
  },
  permissions: [{
    type: String,
  }],
  
  // Common fields
  profileImage: {
    type: String,
    default: '',
  },
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

// Generate franchise code for franchisers
UserSchema.pre('save', async function (next) {
  if (this.role === 'franchiser' && !this.franchiseCode) {
    this.franchiseCode = 'FRAN' + Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);