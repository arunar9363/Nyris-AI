const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const httpError = require('./utils/httpError');

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const atsRoutes = require('./routes/ats.routes');
const roasterRoutes = require('./routes/roaster.routes');
const userRoutes = require('./routes/user.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));

const trustProxy = Number(process.env.TRUST_PROXY);
if (Number.isInteger(trustProxy) && trustProxy > 0) app.set('trust proxy', trustProxy);

const allowedOrigins = new Set([
  'https://nyris.in',
  'https://www.nyris.in',
]);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:5174');
  allowedOrigins.add('http://127.0.0.1:5174');
}
for (const candidate of (process.env.FRONTEND_URL || '').split(',')) {
  if (candidate.trim()) allowedOrigins.add(new URL(candidate.trim()).origin);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(httpError(403, 'This frontend origin is not allowed.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Resume-Access'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'AI request limit reached. Please wait a moment.' },
});
app.use('/api/resume/optimize', aiLimiter);
app.use('/api/roaster/roast', aiLimiter);
app.use('/api/resume/extract', rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  message: { success: false, message: 'Please wait a minute before reading another file.' },
}));

// Body parsing
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false, limit: '256kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/roaster', roasterRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Nyris AI API is running', timestamp: new Date().toISOString() });
});
app.get('/api/ready', (req, res) => {
  const database = mongoose.connection.readyState === 1;
  res.status(database ? 200 : 503).json({ success: database, services: { database, groqConfigured: !!process.env.GROQ_API_KEY } });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'That entry already exists.' });
  const validationError = ['ValidationError', 'CastError'].includes(err.name);
  const statusCode = err.statusCode || err.status || (validationError ? 400 : 500);
  if (statusCode >= 500) console.error(`Nyris request failed (${err.name}, ${statusCode}).`);
  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 || err.expose ? err.message : 'Something went wrong. Please try again.',
  });
});

module.exports = app;
