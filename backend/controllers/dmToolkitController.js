const DMToolkit = require('../models/dmToolkitModel');

// --- Map Upload Handler ---
exports.uploadMap = async (req, res) => {
  try {
    const { name, width, height, imageUrl } = req.body;
    const userId = req.user._id;

    if (!name || !width || !height || !imageUrl) {
      return res.status(400).json({ message: 'Missing map data' });
    }

    const mapContent = {
      name,
      width: parseInt(width),
      height: parseInt(height),
      imageUrl
    };

    const newMap = await DMToolkit.create({
      toolkitType: 'Map',
      userId,
      title: name,
      content: mapContent
    });

    res.status(201).json(newMap);
  } catch (err) {
    console.error('Map save failed:', err);
    res.status(500).json({ message: 'Failed to save map', error: err.message });
  }
};

// --- Existing Toolkit CRUD ---
exports.createToolkitItem = async (req, res) => {
  try {
    const { toolkitType, title = 'Untitled', content } = req.body;

    const item = new DMToolkit({
      userId: req.user._id,
      toolkitType,
      title,
      content,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create toolkit item', error: err.message });
  }
};

exports.getToolkitItems = async (req, res) => {
  try {
    const items = await DMToolkit.find({ userId: req.user._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch toolkit items', error: err.message });
  }
};

exports.updateToolkitItem = async (req, res) => {
  try {
    const existing = await DMToolkit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!existing) return res.status(404).json({ message: 'Toolkit item not found' });

    // Merge content updates if applicable
    const updatedFields = { ...req.body };

    if (req.body.content) {
      updatedFields.content = {
        ...existing.content,
        ...req.body.content
      };
    }

    const updated = await DMToolkit.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update toolkit item', error: err.message });
  }
};


exports.deleteToolkitItem = async (req, res) => {
  try {
    const result = await DMToolkit.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Toolkit item not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete toolkit item', error: err.message });
  }
};
