const express = require("express");
const router = express.Router();
const toolController = require("../controllers/toolController");
const { requireRole } = require("../middleware/roleMiddleware");
const { protect } = require("../middleware/authMiddleware"); // ✅ add this

// Public route to fetch tools
router.get("/", toolController.getAllTools);

// Admin-only routes
router.post(
  "/",
  protect,
  requireRole("admin", "owner"),
  toolController.createTool
);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "owner"),
  toolController.updateTool
);
router.delete(
  "/:id",
  protect,
  requireRole("admin", "owner"),
  toolController.deleteTool
);
module.exports = router; // ✅ this is critical
