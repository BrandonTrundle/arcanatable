const express = require("express");
const router = express.Router();
const {
  createPatch,
  getAllPatches,
  getPatchById,
  updatePatch,
  deletePatch,
} = require("../controllers/patchController");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Public read access
router.get("/", getAllPatches);
router.get("/:id", getPatchById);

// Admin-only write access
router.post("/", protect, requireRole("admin", "owner"), createPatch);
router.patch("/:id", protect, requireRole("admin", "owner"), updatePatch);
router.delete("/:id", protect, requireRole("admin", "owner"), deletePatch);

module.exports = router;
