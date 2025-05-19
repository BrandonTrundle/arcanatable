const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getPlatformStatus } = require("../controllers/adminController");

router.get("/summary", protect, requireRole("admin", "owner"), (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}! You have admin access.`,
  });
});

// ✅ Add this:
router.get(
  "/platform-status",
  protect,
  requireRole("owner"),
  getPlatformStatus
);

module.exports = router;
