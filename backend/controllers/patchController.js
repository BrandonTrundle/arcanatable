const Patch = require("../models/patchModel");

exports.createPatch = async (req, res) => {
  try {
    const { version, title, content } = req.body;
    const patch = await Patch.create({ version, title, content });
    res.status(201).json(patch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPatches = async (req, res) => {
  try {
    const patches = await Patch.find().sort({ createdAt: -1 });
    res.json(patches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatchById = async (req, res) => {
  try {
    const patch = await Patch.findById(req.params.id);
    if (!patch) return res.status(404).json({ message: "Patch not found" });
    res.json(patch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePatch = async (req, res) => {
  try {
    const patch = await Patch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!patch) return res.status(404).json({ message: "Patch not found" });
    res.json(patch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePatch = async (req, res) => {
  try {
    const patch = await Patch.findByIdAndDelete(req.params.id);
    if (!patch) return res.status(404).json({ message: "Patch not found" });
    res.json({ message: "Patch deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
