const mongoose = require('mongoose');

const dmToolkitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toolkitType: {
    type: String,
    enum: ['Monster', 'Item', 'NPC', 'Potion', 'Map', 'CustomRule', 'WorldBuilding', 'Token', 'CheatSheet'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Flexible structure
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('DMToolkit', dmToolkitSchema);
