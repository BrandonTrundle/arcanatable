const express = require("express");
const router = express.Router();
const {
  createCampaign,
  getUserCampaigns,
  joinCampaign,
  deleteCampaign,
  getCampaignById,
} = require("../controllers/campaignController");
const { protect } = require("../middleware/authMiddleware");

// Create a new campaign
router.post("/", protect, createCampaign);

// Get campaigns associated with the logged-in user
router.get("/", protect, getUserCampaigns);
router.get("/:id", protect, getCampaignById);
// Join a campaign with an invite code
router.post("/join", protect, joinCampaign);

router.delete("/:id", protect, deleteCampaign);

module.exports = router;
