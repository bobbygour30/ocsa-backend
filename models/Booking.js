const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    mobile: String,
    email: String,
  },
  vendor: {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: String,
  },
  service: {
    name: String,
    category: String,
    price: Number,
    description: String,
  },
  schedule: {
    date: Date,
    timeSlot: String,
    duration: Number, // in minutes
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'wallet', 'online'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    amount: Number,
    transactionId: String,
    paidAt: Date,
  },
  ratings: {
    rating: Number,
    review: String,
    createdAt: Date,
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

// Generate booking ID before saving
BookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BKG${year}${month}${day}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);