const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const PrivateMessageThread = require("../models/PrivateMessageThread");

// GET or CREATE thread with specific user
router.get("/thread/:otherUserId", protect, async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    let thread = await PrivateMessageThread.findOne({
      participants: { $all: [userId, otherUserId] },
    }).populate("messages.from", "username");

    if (!thread) {
      thread = await PrivateMessageThread.create({
        participants: [userId, otherUserId],
        messages: [],
      });
    }

    res.json(thread);
  } catch (err) {
    console.error("❌ Error loading thread:", err);
    res.status(500).json({ error: "Failed to load message thread" });
  }
});

// POST new message
router.post("/thread/:threadId", protect, async (req, res) => {
  const userId = req.user._id;
  const { content } = req.body;

  try {
    const thread = await PrivateMessageThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    thread.messages.push({ from: userId, content });
    await thread.save();

    res.status(201).json({ message: "Sent" });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// DELETE thread by ID
router.delete("/thread/:threadId", protect, async (req, res) => {
  const userId = req.user._id;
  const threadId = req.params.threadId;

  try {
    const thread = await PrivateMessageThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Ensure the requesting user is a participant
    if (!thread.participants.includes(userId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this thread" });
    }

    await thread.deleteOne();
    res.status(200).json({ message: "Thread deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting thread:", err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

module.exports = router;
