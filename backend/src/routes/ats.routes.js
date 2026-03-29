const express = require('express');
const router = express.Router();
const atsController = require('../controllers/ats.controller');
const { optionalAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/check', optionalAuth, upload.single('resumeFile'), atsController.checkATS);

module.exports = router;
