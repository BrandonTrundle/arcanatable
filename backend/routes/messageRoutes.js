const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesForUser,
  getMessageById,
  markAsRead,
  deleteMessage,
  searchMessages,
  archiveMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Secure all routes
router.use(protect);

// Send a message
router.post('/', sendMessage);

// Get all messages for logged-in user
router.get('/', getMessagesForUser);

// Get a specific message
router.get('/:id', getMessageById);

// Mark a message as read
router.patch('/:id/read', markAsRead);

// Soft-delete message for user
router.delete('/:id', deleteMessage);

// Search messages
router.get('/search/query', searchMessages);

// Archive messages
router.patch('/:id/archive', protect, archiveMessage);

module.exports = router;
