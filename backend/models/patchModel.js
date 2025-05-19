const mongoose = require("mongoose");

const patchSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tag: {
      type: String,
      enum: ["feature", "fix", "tweak", "beta", "update"],
      default: "update",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patch", patchSchema);
