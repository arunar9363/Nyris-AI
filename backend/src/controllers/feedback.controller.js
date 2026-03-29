const Feedback = require('../models/Feedback.model')

// POST /api/feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { name, email, feedbackType, message, rating } = req.body

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please write at least 10 characters of feedback.' })
    }

    const feedback = await Feedback.create({
      name: name?.trim() || 'User',
      email: email?.trim() || '',
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
