const Message = require('../models/messageModel');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientIds, subject, body, category } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      recipientIds,
      subject,
      body,
      category
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

// Get messages for user (inbox)
exports.getMessagesForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      recipientIds: userId,
      deletedFor: { $ne: userId }
    })
      .populate('senderId', 'username email')
      .sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

// Get a specific message
exports.getMessageById = async (req, res) => {
  try {
    const userId = req.user._id;
    const message = await Message.findById(req.params.id)
      .populate('senderId', 'username email');

    if (!message || (!message.recipientIds.includes(userId) && message.senderId.toString() !== userId.toString())) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch message.' });
  }
};

// Mark a message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    const userId = req.user._id;

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }

    res.json({ message: 'Message marked as read.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
};

// Soft delete a message for the user
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    const userId = req.user._id;

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({ message: 'Message deleted for user.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
};

// Search messages (basic subject/body match)
exports.searchMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query } = req.query;

    const messages = await Message.find({
      recipientIds: userId,
      deletedFor: { $ne: userId },
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } }
      ]
    }).populate('senderId', 'username email');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Search failed.' });
  }
};

exports.archiveMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    if (!message.archivedBy.includes(req.user._id)) {
      message.archivedBy.push(req.user._id);
      await message.save();
    }

    res.status(200).json({ message: 'Message archived.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive message.' });
  }
};
