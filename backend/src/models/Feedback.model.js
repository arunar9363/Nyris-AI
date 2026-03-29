const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'User',
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
  feedbackType: {
    type: String,
    enum: ['suggestion', 'bug_report', 'general', 'feature_request', 'appreciation'],
    default: 'general',
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [10, 'Feedback must be at least 10 characters'],
    maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true })

module.exports = mongoose.model('Feedback', feedbackSchema)
