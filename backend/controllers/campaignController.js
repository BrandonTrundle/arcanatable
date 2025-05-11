const Campaign = require("../models/campaignModel");
const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private
const createCampaign = asyncHandler(async (req, res) => {
  const { name, gameSystem, imageUrl } = req.body;

  if (!name || !gameSystem) {
    res.status(400);
    throw new Error("Please include a campaign name and game system");
  }

  const campaign = await Campaign.create({
    name,
    gameSystem,
    imageUrl,
    creator: req.user.id,
    players: [req.user.id], // creator is added as a player too
  });

  res.status(201).json(campaign);
});

// @desc    Get campaigns user is part of or created
// @route   GET /api/campaigns
// @access  Private
const getUserCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({
    $or: [{ creator: req.user.id }, { players: req.user.id }],
  })
    .populate("players", "username avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json(campaigns);
});

// @desc    Join a campaign via invite code
// @route   POST /api/campaigns/join
// @access  Private
const joinCampaign = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    res.status(400);
    throw new Error("Invite code is required");
  }

  const campaign = await Campaign.findOne({ inviteCode });

  if (!campaign) {
    res.status(404);
    throw new Error("Campaign not found");
  }

  const userId = req.user.id;

  if (campaign.players.includes(userId)) {
    return res.status(200).json({ message: "Already joined", campaign });
  }

  campaign.players.push(userId);
  await campaign.save();

  res.status(200).json({ message: "Successfully joined", campaign });
});

const deleteCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error("Campaign not found");
  }

  if (campaign.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this campaign");
  }

  // ✅ Attempt to delete the campaign image
  if (campaign.imageUrl?.startsWith("/uploads/campaigns/")) {
    const imagePath = path.join(__dirname, "..", campaign.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.warn("⚠️ Failed to delete campaign image:", err.message);
      } else {
        // console.log("🗑 Deleted campaign image:", imagePath);
      }
    });
  }

  await campaign.deleteOne();
  res.status(200).json({ message: "Campaign deleted" });
});

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("players", "username avatarUrl _id")
      .populate("creator", "username _id");

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Optional: check if the user is either the DM or a player
    const isParticipant =
      campaign.creator._id.equals(req.user._id) ||
      campaign.players.some((p) => p._id.equals(req.user._id));

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCampaign,
  getUserCampaigns,
  joinCampaign,
  deleteCampaign,
  getCampaignById,
};
