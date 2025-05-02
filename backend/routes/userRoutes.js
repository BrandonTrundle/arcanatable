const express = require('express');
const router = express.Router();
const { getMe, updateOnboarding } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.patch('/onboarding', protect, updateOnboarding);
router.get('/me', protect, getMe);

module.exports = router;
