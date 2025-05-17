const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createToolkitToken,
  getToolkitTokens,
  deleteToolkitToken,
} = require("../controllers/playerToolkitController");

//console.log("🧪 Protect middleware is:", typeof protect);
router.use(protect);

router.post("/", createToolkitToken);
router.get("/", getToolkitTokens);
router.delete("/:id", deleteToolkitToken);

module.exports = router;
