const mongoose = require("mongoose");

const AoESchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Campaign",
  },
  mapId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  aoe: {
    type: Object,
    required: true,
  },
});

AoESchema.index({ campaignId: 1, mapId: 1, "aoe.id": 1 }, { unique: true });

module.exports = mongoose.model("AoE", AoESchema);
