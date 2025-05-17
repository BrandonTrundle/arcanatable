const express = require("express");
const router = express.Router();
const { addPlaytime } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/userController");

const {
  getMe,
  updateOnboarding,
  lookupUserByUsername,
} = require("../controllers/userController");

// User-related routes
router.get("/me", protect, getMe);
router.get("/lookup", protect, lookupUserByUsername);
router.patch("/onboarding", protect, updateOnboarding);
router.patch("/update-profile", protect, updateProfile);
router.patch("/add-playtime", protect, addPlaytime);

// Avatar upload route
router.patch("/avatarUrl", protect, async (req, res) => {
  try {
    const user = await require("../models/userModel").findById(req.user._id);
    user.avatarUrl = req.body.avatarUrl;
    await user.save();
    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to update avatar URL" });
  }
});

module.exports = router;
