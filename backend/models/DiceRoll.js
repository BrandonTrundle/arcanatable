const mongoose = require("mongoose");

const diceRollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    die: { type: Number, required: true },
    modifier: { type: Number, default: 0 },
    advantage: {
      type: String,
      enum: ["normal", "advantage", "disadvantage"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DiceRoll", diceRollSchema);
