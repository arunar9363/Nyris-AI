const express = require('express');
const router = express.Router();
const roasterController = require('../controllers/roaster.controller');
const { optionalAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/roast', optionalAuth, upload.single('resumeFile'), roasterController.roastResume);

module.exports = router;
