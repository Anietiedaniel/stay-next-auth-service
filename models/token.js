// models/Token.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['verifyEmail', 'resetPassword'],
    default: 'verifyEmail',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Auto-delete after 1 hour
  },
});

const Token = mongoose.model('Token', tokenSchema);
export default Token;
