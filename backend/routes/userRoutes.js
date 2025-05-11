const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const { protect } = require("../middleware/authMiddleware");
const {
  getMe,
  updateOnboarding,
  lookupUserByUsername,
  uploadAvatar,
} = require("../controllers/userController");

// Configure Multer storage for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${req.user._id}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

// User-related routes
router.get("/me", protect, getMe);
router.get("/lookup", protect, lookupUserByUsername);
router.patch("/onboarding", protect, updateOnboarding);

// Avatar upload route
router.patch("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
