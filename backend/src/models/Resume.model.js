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
  expiresAt: { type: Date, index: { expires: 0 } },
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
  paperSize: { type: String, enum: ['LETTER', 'A4'], default: 'LETTER' },
  sectionOrder: { type: [String], default: undefined },
  profile: { type: String, default: '' },
  resumeData: mongoose.Schema.Types.Mixed,
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
  tailoring: {
    mode: String,
    originalScore: Number,
    originalMatches: Number,
    warnings: [String],
  },
  atsReport: {
    missingKeywords: [String],
    formattingIssues: [String],
    suggestions: [String],
    strengths: [String],
    matchedKeywords: [String],
    scoreBreakdown: mongoose.Schema.Types.Mixed,
    evaluatedWithJobDescription: Boolean,
    targetRole: String,
    documentChecks: [{ label: String, passed: Boolean, detail: String, _id: false }],
    termEvidence: [{ term: String, status: String, excerpt: String, section: String, _id: false }],
    advanced: mongoose.Schema.Types.Mixed,
  },
  roastContent: {
    funnyRoast: String,
    seriousFeedback: String,
    mistakesBreakdown: [String],
    improvementTips: [String],
    overallRating: String,
    verdict: String,
    targetRole: String,
    tone: String,
    rubric: [{ label: String, score: Number, summary: String, _id: false }],
    findings: [{ id: String, title: String, priority: String, action: String, evidence: String, section: String, _id: false }],
    evidenceHighlight: { text: String, section: String },
    matchedKeywords: [String],
    missingKeywords: [String],
    coachingNote: String,
    coachingStatus: String,
    detailedReview: mongoose.Schema.Types.Mixed,
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

resumeSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('Resume', resumeSchema);
