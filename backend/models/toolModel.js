// models/toolModel.js
const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: "General" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tool", toolSchema);
