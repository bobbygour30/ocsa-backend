const mongoose = require('mongoose');

const FranchiserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  region: {
    type: String,
    required: true,
  },
  territories: [{
    city: String,
    state: String,
    pincodes: [String],
  }],
  vendors: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    commission: {
      type: Number,
      default: 10, // percentage
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  }],
  franchiseFee: {
    amount: Number,
    paidDate: Date,
    nextDueDate: Date,
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
  },
  earnings: {
    total: {
      type: Number,
      default: 0,
    },
    monthly: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
  },
  documents: {
    agreement: String,
    idProof: String,
    addressProof: String,
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

module.exports = mongoose.model('Franchiser', FranchiserSchema);