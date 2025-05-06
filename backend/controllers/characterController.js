const Character = require('../models/characterModel');
const asyncHandler = require('express-async-handler');

// @desc    Create a new character
// @route   POST /api/characters
// @access  Private
const createCharacter = asyncHandler(async (req, res) => {
  const character = await Character.create({
    ...req.body,
    creator: req.user._id,
  });
  res.status(201).json(character);
});

// @desc    Get all characters for the logged-in user
// @route   GET /api/characters
// @access  Private
const getCharacters = asyncHandler(async (req, res) => {
  const characters = await Character.find({ creator: req.user._id });
  res.json(characters);
});

// @desc    Get a single character by ID
// @route   GET /api/characters/:id
// @access  Private
const getCharacterById = asyncHandler(async (req, res) => {
  const character = await Character.findOne({ _id: req.params.id, creator: req.user._id });

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  res.json(character);
});

// @desc    Update a character
// @route   PUT /api/characters/:id
// @access  Private
const updateCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findOneAndUpdate(
    { _id: req.params.id, creator: req.user._id },
    req.body,
    { new: true }
  );

  if (!character) {
    res.status(404);
    throw new Error('Character not found or not authorized');
  }

  res.json(character);
});

// @desc    Delete a character
// @route   DELETE /api/characters/:id
// @access  Private
const deleteCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findOneAndDelete({ _id: req.params.id, creator: req.user._id });

  if (!character) {
    res.status(404);
    throw new Error('Character not found or not authorized');
  }

  res.json({ message: 'Character deleted' });
});

module.exports = {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
};
