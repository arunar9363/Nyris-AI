const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/optimize', optionalAuth, upload.fields([
  { name: 'resumeFile', maxCount: 1 },
  { name: 'jdFile', maxCount: 1 },
]), resumeController.optimizeResume);
router.post('/build', optionalAuth, resumeController.buildResume);
router.get('/history', protect, resumeController.getHistory);
router.get('/:id', optionalAuth, resumeController.getResumeById);
router.patch('/:id/favorite', protect, resumeController.toggleFavorite);
router.delete('/:id', protect, resumeController.deleteResume);

module.exports = router;
