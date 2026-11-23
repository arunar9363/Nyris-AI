const express = require('express');
const { checkATS } = require('../controllers/ats.controller');
const { protect } = require('../middleware/auth.middleware');
const { readUploads } = require('../middleware/upload.middleware');

const router = express.Router();
router.post('/check', protect, readUploads('resumeFile'), checkATS);
module.exports = router;
