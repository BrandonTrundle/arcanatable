const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/summary", protect, requireRole("admin", "owner"), (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}! You have admin access.`,
  });
});

module.exports = router;
