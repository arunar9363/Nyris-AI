const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  sessionId: {
    type: String, // for non-logged-in users
    default: null,
  },
  type: {
    type: String,
    enum: ['optimized', 'built', 'ats_check', 'roasted'],
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Resume',
  },
  templateId: {
    type: String,
    enum: ['minimal', 'modern', 'creative'],
    default: 'minimal',
  },
  originalResumeText: {
    type: String,
    default: '',
  },
  jobDescription: {
    type: String,
    default: '',
  },
  optimizedHtml: {
    type: String,
    default: '',
  },
  pdfPath: {
    type: String,
    default: '',
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  atsReport: {
    missingKeywords: [String],
    formattingIssues: [String],
    suggestions: [String],
    strengths: [String],
  },
  roastContent: {
    funnyRoast: String,
    seriousFeedback: String,
    mistakesBreakdown: [String],
    improvementTips: [String],
  },
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    portfolio: String,
    projectLinks: [String],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  comparison: {
    addedContent: [String],
    removedContent: [String],
    improvedContent: [String],
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
