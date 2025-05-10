const mongoose = require("mongoose");

const playerToolkitTokenSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    size: { type: String, default: "Medium" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PlayerToolkitToken", playerToolkitTokenSchema);
