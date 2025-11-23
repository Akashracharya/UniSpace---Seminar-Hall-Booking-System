import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // <--- CHANGED: Password is now optional for Google users
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);