const Feedback = require('../models/Feedback.model')

// POST /api/feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { name, email, feedbackType, message, rating } = req.body || {}

    if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 1000) {
      return res.status(400).json({ success: false, message: 'Write between 10 and 1,000 characters of feedback.' })
    }

    const feedback = await Feedback.create({
      name: typeof name === 'string' && name.trim() ? name.trim() : 'User',
      email: typeof email === 'string' ? email.trim() : '',
      feedbackType: feedbackType || 'general',
      message: message.trim(),
      rating: rating || null,
      isPublic: true,
      userId: req.user?._id || null,
    })

    res.status(201).json({ success: true, data: feedback })
  } catch (error) {
    next(error)
  }
}

// GET /api/feedback/public
exports.getPublicFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('name feedbackType message rating createdAt')

    res.json({ success: true, data: feedbacks })
  } catch (error) {
    next(error)
  }
}
