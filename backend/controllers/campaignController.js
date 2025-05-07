const Campaign = require("../models/campaignModel");
const asyncHandler = require("express-async-handler");

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

  await campaign.deleteOne();
  res.status(200).json({ message: "Campaign deleted" });
});

module.exports = {
  createCampaign,
  getUserCampaigns,
  joinCampaign,
  deleteCampaign,
};
