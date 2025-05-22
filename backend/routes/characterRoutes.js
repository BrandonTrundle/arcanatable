const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
  getCharactersByCampaign, // 👈 Add this
} = require("../controllers/characterController");

const { protect } = require("../middleware/authMiddleware");

// Multer storage configuration for character images
const characterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/characters");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage: characterStorage,
});

// 👉 New route for DM to get all characters by campaign ID
router.get("/campaign/:campaignId", protect, getCharactersByCampaign);

// Routes for character management
router
  .route("/")
  .post(
    protect,
    upload.fields([
      { name: "portraitImage", maxCount: 1 },
      { name: "orgSymbolImage", maxCount: 1 },
    ]),
    createCharacter
  )
  .get(protect, getCharacters);

router
  .route("/:id")
  .get(protect, getCharacterById)
  .put(
    protect,
    upload.fields([
      { name: "portraitImage", maxCount: 1 },
      { name: "orgSymbolImage", maxCount: 1 },
    ]),
    updateCharacter
  )
  .delete(protect, deleteCharacter);

module.exports = router;
