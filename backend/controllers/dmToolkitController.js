const DMToolkit = require("../models/dmToolkitModel");
const fs = require("fs");
const path = require("path");

const getFolderForToolkitType = (type) => {
  switch (type) {
    case "Map":
      return "maps";
    case "Token":
      return "tokenImages";
    case "Monster":
      return "monsters";
    case "NPC":
      return "npcs";
    default:
      return null;
  }
};

exports.getSingleToolkitItem = async (req, res) => {
  try {
    const item = await DMToolkit.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Map not found" });
    }

    // ✅ Check if user is in the campaign — not just the map owner
    // You can enhance this by verifying membership via campaign access rules

    res.json(item);
  } catch (err) {
    console.error("❌ Error fetching toolkit item:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch item", error: err.message });
  }
};

// --- Map Upload Handler ---
exports.uploadMap = async (req, res) => {
  try {
    const { name, width, height, imageUrl } = req.body;
    const userId = req.user._id;

    if (!name || !width || !height || !imageUrl) {
      return res.status(400).json({ message: "Missing map data" });
    }

    const mapContent = {
      name,
      width: parseInt(width),
      height: parseInt(height),
      imageUrl,
    };

    const newMap = await DMToolkit.create({
      toolkitType: "Map",
      userId,
      title: name,
      content: mapContent,
    });

    res.status(201).json(newMap);
  } catch (err) {
    console.error("Map save failed:", err);
    res.status(500).json({ message: "Failed to save map", error: err.message });
  }
};

// --- Existing Toolkit CRUD ---
exports.createToolkitItem = async (req, res) => {
  try {
    const { toolkitType, title = "Untitled", content } = req.body;

    const item = new DMToolkit({
      userId: req.user._id,
      toolkitType,
      title,
      content,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create toolkit item", error: err.message });
  }
};

exports.getToolkitItems = async (req, res) => {
  try {
    const items = await DMToolkit.find({ userId: req.user._id });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch toolkit items", error: err.message });
  }
};

exports.getToolkitItemsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ["Token", "Monster", "NPC"];

    if (type === "AllTokens") {
      const items = await DMToolkit.find({
        userId: req.user._id,
        toolkitType: { $in: validTypes },
      });

      return res.status(200).json(items);
    }

    // Fallback for direct type like /type/Token
    const items = await DMToolkit.find({
      userId: req.user._id,
      toolkitType: type,
    });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch toolkit items by type",
      error: err.message,
    });
  }
};

exports.updateToolkitItem = async (req, res) => {
  try {
    const existing = await DMToolkit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existing)
      return res.status(404).json({ message: "Toolkit item not found" });

    // Merge content updates if applicable
    const updatedFields = { ...req.body };

    if (req.body.content) {
      updatedFields.content = {
        ...existing.content,
        ...req.body.content,
      };
    }

    const updated = await DMToolkit.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update toolkit item", error: err.message });
  }
};

exports.deleteToolkitItem = async (req, res) => {
  try {
    const item = await DMToolkit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Toolkit item not found" });
    }

    const folder = getFolderForToolkitType(item.toolkitType);

    // ✅ Check both image keys: "image" and "imageUrl"
    const imagePathRaw = ["Token", "Map"].includes(item.toolkitType)
      ? item.content?.imageUrl
      : item.content?.image;

    if (imagePathRaw && folder) {
      const imageFile = path.basename(imagePathRaw); // e.g. "goblin.png"
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        folder,
        imageFile
      );

      // console.log(`🧪 Attempting to delete image: ${imagePath}`);

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn("⚠️ Failed to delete image:", err.message);
        } else {
          //    console.log("🗑 Successfully deleted image:", imageFile);
        }
      });
    }

    await DMToolkit.deleteOne({ _id: req.params.id, userId: req.user._id });

    res.status(204).end();
  } catch (err) {
    console.error("❌ Error deleting toolkit item:", err);
    res
      .status(500)
      .json({ message: "Failed to delete toolkit item", error: err.message });
  }
};
