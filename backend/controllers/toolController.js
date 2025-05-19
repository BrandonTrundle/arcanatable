const Tool = require("../models/toolModel");

// Get all tools (public)
exports.getAllTools = async (req, res) => {
  try {
    const tools = await Tool.find().sort({ featured: -1, name: 1 });
    res.json(tools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new tool (admin)
exports.createTool = async (req, res) => {
  try {
    const { name, url, description, category, featured } = req.body;
    const tool = await Tool.create({
      name,
      url,
      description,
      category,
      featured,
    });
    res.status(201).json(tool);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an existing tool (admin)
exports.updateTool = async (req, res) => {
  try {
    const tool = await Tool.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!tool) return res.status(404).json({ message: "Tool not found" });
    res.json(tool);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a tool (admin)
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);
    if (!tool) return res.status(404).json({ message: "Tool not found" });
    res.json({ message: "Tool deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
