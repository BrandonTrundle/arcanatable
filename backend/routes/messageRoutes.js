const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesForUser,
  getSentMessages,
  getMessageById,
  markAsRead,
  deleteMessage,
  searchMessages,
  archiveMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Compose & read
router.post('/', sendMessage);
router.get('/', getMessagesForUser);
router.get('/sent', getSentMessages); // Moved ABOVE :id route
router.get('/search/query', searchMessages);
router.get('/:id', getMessageById);

// Status updates
router.patch('/:id/read', markAsRead);
router.patch('/:id/archive', archiveMessage);

// Delete
router.delete('/:id', deleteMessage);

module.exports = router;
