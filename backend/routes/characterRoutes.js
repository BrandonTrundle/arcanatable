const express = require('express');
const router = express.Router();
const {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
} = require('../controllers/characterController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes for character management
router.route('/')
  .post(protect, createCharacter)    // Create
  .get(protect, getCharacters);      // List

router.route('/:id')
  .get(protect, getCharacterById)    // Read
  .put(protect, updateCharacter)     // Update
  .delete(protect, deleteCharacter); // Delete

module.exports = router;
