const express = require('express')
const router = express.Router()
const feedbackController = require('../controllers/feedback.controller')
const { optionalAuth } = require('../middleware/auth.middleware')

router.post('/', optionalAuth, feedbackController.submitFeedback)
router.get('/public', feedbackController.getPublicFeedback)

module.exports = router
