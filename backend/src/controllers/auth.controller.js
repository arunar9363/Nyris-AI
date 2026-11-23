const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      educationLevel: user.educationLevel,
      degree: user.degree,
      branch: user.branch,
      createdAt: user.createdAt,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, educationLevel, degree, branch } = req.body || {};

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !educationLevel) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Choose a shorter password. The limit is 72 bytes.' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, educationLevel, degree: degree || 'N/A', branch });
    sendAuthResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
