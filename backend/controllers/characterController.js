const path = require("path");
const fs = require("fs");
const Character = require("../models/characterModel");
const asyncHandler = require("express-async-handler");

const parseStructuredFields = (body) => {
  ["attacks", "skills", "equipment", "spells", "coins"].forEach((field) => {
    if (body[field] && typeof body[field] === "string") {
      try {
        body[field] = JSON.parse(body[field]);
      } catch (err) {
        console.warn(`⚠️ Failed to parse ${field}:`, err.message);
      }
    }
  });
};

// @desc    Create a new character
// @route   POST /api/characters
// @access  Private
const createCharacter = asyncHandler(async (req, res) => {
  const { body, files } = req;

  parseStructuredFields(body);

  // Convert "" to null for optional ObjectId fields
  if (body.campaign === "") {
    body.campaign = null;
  }

  const characterData = {
    ...body,
    creator: req.user._id,
  };

  if (files?.portraitImage) {
    characterData.portraitImage = `/uploads/characters/${files.portraitImage[0].filename}`;
  }

  if (files?.orgSymbolImage) {
    characterData.orgSymbolImage = `/uploads/characters/${files.orgSymbolImage[0].filename}`;
  }

  const character = await Character.create(characterData);
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
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error("Character not found");
  }

  res.json(character);
});

// @desc    Update a character
// @route   PUT /api/characters/:id
// @access  Private

const updateCharacter = asyncHandler(async (req, res) => {
  const { body, params } = req;

  parseStructuredFields(body);

  if (body.campaign === "") {
    body.campaign = null;
  }

  // Only allow updates to fields defined in schema
  const allowedFields = Object.keys(Character.schema.paths);

  // ✅ Allow any authenticated user to edit (DM or player)
  const character = await Character.findById(params.id);

  if (!character) {
    res.status(404);
    throw new Error("Character not found or not authorized");
  }

  for (const [key, value] of Object.entries(body)) {
    if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) {
      continue;
    }

    try {
      const parsed = JSON.parse(value);

      if (key === "coins") {
        character.coins = parsed;
        character.markModified("coins");
      } else {
        character[key] = parsed;
      }
    } catch (err) {
      character[key] = value;
      console.warn(
        `⚠️ Failed to parse field '${key}', using raw value:`,
        value
      );
    }
  }

  await character.save();
  res.json(character);
});

// @desc    Delete a character
// @route   DELETE /api/characters/:id
// @access  Private
const deleteCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findOneAndDelete({
    _id: req.params.id,
    creator: req.user._id,
  });

  if (!character) {
    res.status(404);
    throw new Error("Character not found or not authorized");
  }

  // Cleanup portrait and symbol images
  [character.portraitImage, character.orgSymbolImage].forEach((imgPath) => {
    if (imgPath && imgPath.startsWith("/uploads/characters/")) {
      const fullPath = path.join(__dirname, "..", imgPath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.warn("⚠️ Failed to delete character image:", err.message);
        } else {
          //  console.log("🗑 Deleted character image:", fullPath);
        }
      });
    }
  });

  res.json({ message: "Character deleted" });
});

// @desc    Get all characters assigned to a specific campaign (for DM view)
// @route   GET /api/characters/campaign/:campaignId
// @access  Private
const getCharactersByCampaign = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;

  const characters = await Character.find({ campaign: campaignId });

  res.status(200).json(characters);
});

module.exports = {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
  getCharactersByCampaign,
};
