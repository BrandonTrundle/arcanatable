const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gameSystem: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
module.exports = Campaign;
