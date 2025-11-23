import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
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
    required: true,
  },
  status: {
    type: String,
    // UPDATE THIS LINE BELOW:
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'], 
    default: 'pending', 
  }
}, { timestamps: true });

BookingSchema.index({ hallId: 1, startTime: 1, endTime: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);