const express = require('express');
const router = express.Router();
const { getMe, updateOnboarding } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { lookupUserByUsername } = require('../controllers/userController');

router.patch('/onboarding', protect, updateOnboarding);
router.get('/me', protect, getMe);
router.get('/lookup', protect, lookupUserByUsername);

module.exports = router;
