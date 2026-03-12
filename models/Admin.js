const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  department: {
    type: String,
    enum: ['operations', 'finance', 'support', 'technical', 'management'],
  },
  permissions: [{
    module: String,
    actions: [String], // ['create', 'read', 'update', 'delete']
  }],
  activityLog: [{
    action: String,
    target: String,
    targetId: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ip: String,
  }],
  managedRegions: [String],
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Admin', AdminSchema);