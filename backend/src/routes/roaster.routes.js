const express = require('express');
const { roastResume } = require('../controllers/roaster.controller');
const { protect } = require('../middleware/auth.middleware');
const { readUploads } = require('../middleware/upload.middleware');

const router = express.Router();
router.post('/roast', protect, readUploads('resumeFile'), roastResume);
module.exports = router;
