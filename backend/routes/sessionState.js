const express = require("express");
const router = express.Router();
const SessionState = require("../models/SessionState");
const { protect: authenticateToken } = require("../middleware/authMiddleware");

// GET session state by campaign ID
router.get("/:campaignId", authenticateToken, async (req, res) => {
  const campaignId = req.params.campaignId;
  // console.log("🔍 Incoming session state request for campaign:", campaignId);

  try {
    const session = await SessionState.findOne({ campaignId }).populate(
      "currentMapId"
    );

    if (!session) {
      console.warn("⚠️ No session state found for campaign:", campaignId);
      return res.status(404).json({ message: "No session state found." });
    }

    //console.log("✅ Session state found:", session);
    res.json(session);
  } catch (err) {
    console.error("❌ ERROR in /sessionstate GET:", err);
    res.status(500).json({
      message: "Error retrieving session state.",
      details: err.message,
    });
  }
});

// GET just the current map ID for a campaign (for reconnecting players)
router.get("/:campaignId/current-map", authenticateToken, async (req, res) => {
  try {
    const session = await SessionState.findOne({
      campaignId: req.params.campaignId,
    });

    if (!session || !session.currentMapId) {
      return res.status(404).json({ message: "No active map for campaign." });
    }

    res.json({ mapId: session.currentMapId });
  } catch (err) {
    console.error("❌ Error fetching current map ID:", err);
    res.status(500).json({ message: "Error retrieving current map ID." });
  }
});

// CREATE or UPDATE current map
router.put("/:campaignId/set-map", authenticateToken, async (req, res) => {
  const { mapId } = req.body;
  try {
    const session = await SessionState.findOneAndUpdate(
      { campaignId: req.params.campaignId },
      { currentMapId: mapId },
      { new: true, upsert: true }
    ).populate("currentMapId");
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Error updating current map." });
  }
});

// UPDATE live token state
router.put(
  "/:campaignId/update-map-tokens",
  authenticateToken,
  async (req, res) => {
    const { placedTokens } = req.body;
    try {
      const session = await SessionState.findOneAndUpdate(
        { campaignId: req.params.campaignId },
        { "liveMapState.placedTokens": placedTokens },
        { new: true, upsert: true }
      );
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: "Error updating tokens." });
    }
  }
);

module.exports = router;
