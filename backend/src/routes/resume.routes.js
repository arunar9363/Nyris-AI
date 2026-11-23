const express = require('express');
const resumeController = require('../controllers/resume.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { readUploads } = require('../middleware/upload.middleware');

const router = express.Router();
router.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});
router.post('/extract', optionalAuth, readUploads('document'), resumeController.extractDocument);
router.post('/optimize', optionalAuth, readUploads('resumeFile', 'jdFile'), resumeController.optimizeResume);
router.post('/preview', resumeController.previewResume);
router.post('/build', protect, resumeController.buildResume);
router.get('/history', protect, resumeController.getHistory);
router.get('/:id/export/:format', optionalAuth, resumeController.exportResume);
router.get('/:id', optionalAuth, resumeController.getResumeById);
router.patch('/:id/favorite', protect, resumeController.toggleFavorite);
router.delete('/:id', protect, resumeController.deleteResume);

module.exports = router;
