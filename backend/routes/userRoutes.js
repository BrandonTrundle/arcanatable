const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getMe,
  updateOnboarding,
  lookupUserByUsername,
} = require("../controllers/userController");

// User-related routes
router.get("/me", protect, getMe);
router.get("/lookup", protect, lookupUserByUsername);
router.patch("/onboarding", protect, updateOnboarding);

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
