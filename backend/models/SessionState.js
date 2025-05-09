const mongoose = require("mongoose");

const sessionStateSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      unique: true, // only one live session per campaign
    },
    currentMapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DMToolkit",
    },
    liveMapState: {
      placedTokens: [
        {
          id: String,
          imageUrl: String,
          x: Number,
          y: Number,
          tokenSize: String,
          layer: String,
          title: String,
        },
      ],
      fogState: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      notes: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SessionState", sessionStateSchema);
