const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile', protect, userController.getProfile);
router.patch('/profile', protect, userController.updateProfile);
router.get('/favorites', protect, userController.getFavorites);

module.exports = router;
