const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createToolkitItem,
  getToolkitItems,
  getToolkitItemsByType,
  updateToolkitItem,
  deleteToolkitItem,
  uploadMap,
} = require("../controllers/dmToolkitController");

// Apply auth protection to all routes
router.use(protect);

// Standard CRUD routes
router.post("/", createToolkitItem);
router.get("/", getToolkitItems);
router.get("/type/:type", getToolkitItemsByType);
router.patch("/:id", updateToolkitItem);
router.delete("/:id", deleteToolkitItem);

// Cleaned map metadata route (expects imageUrl from frontend)
router.post("/maps/upload", uploadMap);

module.exports = router;
