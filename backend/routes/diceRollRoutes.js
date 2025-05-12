const express = require("express");
const router = express.Router();
const DiceRoll = require("../models/DiceRoll");
const { protect } = require("../middleware/authMiddleware");

// @desc    Get all saved rolls for a user in a specific campaign
// @route   GET /api/dicerolls/:campaignId
// @access  Private
router.get("/:campaignId", protect, async (req, res) => {
  try {
    const rolls = await DiceRoll.find({
      user: req.user._id,
      campaign: req.params.campaignId,
    }).sort({ createdAt: -1 });

    res.status(200).json(rolls);
  } catch (err) {
    console.error("❌ Failed to fetch saved rolls:", err);
    res.status(500).json({ error: "Failed to fetch saved rolls" });
  }
});

// @desc    Save a new custom roll
// @route   POST /api/dicerolls
// @access  Private
router.post("/", protect, async (req, res) => {
  const { campaignId, name, quantity, die, modifier, advantage } = req.body;

  if (!campaignId || !name || !quantity || !die) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newRoll = new DiceRoll({
      user: req.user._id,
      campaign: campaignId,
      name,
      quantity,
      die,
      modifier: modifier || 0,
      advantage: advantage || "normal",
    });

    const savedRoll = await newRoll.save();
    res.status(201).json(savedRoll);
  } catch (err) {
    console.error("❌ Failed to save roll:", err);
    res.status(500).json({ error: "Failed to save roll" });
  }
});

// @desc    Delete a saved roll by ID
// @route   DELETE /api/dicerolls/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await DiceRoll.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Roll not found" });
    }

    res.status(200).json({ success: true, message: "Roll deleted" });
  } catch (err) {
    console.error("❌ Failed to delete roll:", err);
    res.status(500).json({ error: "Failed to delete roll" });
  }
});

module.exports = router;
