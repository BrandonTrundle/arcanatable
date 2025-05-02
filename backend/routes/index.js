const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const messageRoutes = require('./messageRoutes'); // <- Import here

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes); // <- Mount here

module.exports = router;
