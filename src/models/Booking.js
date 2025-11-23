import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall', // This links this booking to a specific Hall ID
    required: true,
  },
  userEmail: {
    type: String,
    required: true, // Who booked it?
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  purpose: {
    type: String,
    required: true, // e.g., "Class Project Presentation"
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'], // Simple status
    default: 'confirmed',
  }
}, { timestamps: true }); // timestamps: true automatically adds 'createdAt'

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);