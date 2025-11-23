import mongoose from 'mongoose';

const HallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Seminar Hall 1"
    unique: true,
  },
  capacity: {
    type: Number,
    required: true, // e.g., 100
  },
  location: {
    type: String, // e.g., "Block A"
  },
  image: {
    type: String, // We can put a URL to an image here later
  }
});

// This weird syntax checks if the model exists before creating it
// This is necessary because Next.js hot-reloading can try to create it twice
export default mongoose.models.Hall || mongoose.model('Hall', HallSchema);