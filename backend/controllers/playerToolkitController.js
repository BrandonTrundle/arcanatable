const asyncHandler = require("express-async-handler");
const PlayerToolkitToken = require("../models/playerToolkitTokenModel");

// @desc    Create a toolkit token
// @route   POST /api/player-toolkit-tokens
// @access  Private
const createToolkitToken = asyncHandler(async (req, res) => {
  const { name, imageUrl, size } = req.body;

  if (!name || !imageUrl) {
    res.status(400);
    throw new Error("Name and image URL are required");
  }

  const token = await PlayerToolkitToken.create({
    name,
    imageUrl,
    size,
    owner: req.user._id,
  });

  res.status(201).json(token);
});

// @desc    Get all toolkit tokens for logged-in player
// @route   GET /api/player-toolkit-tokens
// @access  Private
const getToolkitTokens = asyncHandler(async (req, res) => {
  const tokens = await PlayerToolkitToken.find({ owner: req.user._id });
  res.json(tokens);
});

module.exports = {
  createToolkitToken,
  getToolkitTokens,
};

// @desc    Delete a toolkit token
// @route   DELETE /api/player-toolkit-tokens/:id
// @access  Private
const deleteToolkitToken = asyncHandler(async (req, res) => {
  const token = await PlayerToolkitToken.findById(req.params.id);

  if (!token) {
    res.status(404);
    throw new Error("Token not found");
  }

  if (token.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this token");
  }

  await token.deleteOne();

  res.json({ message: "Token removed" });
});

module.exports = {
  createToolkitToken,
  getToolkitTokens,
  deleteToolkitToken, // 👈 export it
};
