const DMToolkit = require('../models/dmToolkitModel');

exports.createToolkitItem = async (req, res) => {
  try {
    const { toolkitType, title, content } = req.body;

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
    const item = await DMToolkit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Toolkit item not found' });
    res.json(item);
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
