const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createToolkitItem,
  getToolkitItems,
  getToolkitItemsByType,
  getSingleToolkitItem,
  updateToolkitItem,
  deleteToolkitItem,
  uploadMap,
} = require("../controllers/dmToolkitController");

router.use(protect);

// CRUD
router.post("/", createToolkitItem);
router.get("/", getToolkitItems);
router.get("/type/:type", getToolkitItemsByType); // ✅ must be above /:id
router.get("/:id", getSingleToolkitItem);
router.patch("/:id", updateToolkitItem);
router.delete("/:id", deleteToolkitItem);

// Map upload
router.post("/maps/upload", uploadMap);

module.exports = router;
