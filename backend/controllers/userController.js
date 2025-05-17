const path = require("path");
const { supabase } = require("../config/supabase");
const User = require("../models/userModel"); // Keep this consistent
// Removed: const fs = require("fs");

exports.updateOnboarding = async (req, res) => {
  try {
    const user = req.user;

    const { rolePreference, theme, experienceLevel } = req.body;

    if (!rolePreference || !theme || !experienceLevel) {
      return res
        .status(400)
        .json({ error: "All onboarding fields are required." });
    }

    user.onboarding = {
      rolePreference,
      theme,
      experienceLevel,
    };

    user.onboardingComplete = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Onboarding complete", onboarding: user.onboarding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const user = req.user;

    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      onboardingComplete: user.onboardingComplete,
      roles: user.roles,
      onboarding: user.onboarding || {},
      avatarUrl: user.avatarUrl || "/defaultav.png",
      createdAt: user.createdAt, // ✅ add this
      hoursPlayed: user.hoursPlayed ?? 0, // ✅ add this
    });
  } catch (err) {
    console.error("Error in getMe:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.lookupUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username is required." });
    }

    const user = await User.findOne({ username }).select("_id username");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      console.warn("[uploadAvatar] ❌ No file uploaded in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ext = path.extname(req.file.originalname);
    const base = path.basename(req.file.originalname, ext);
    const uniqueName = `${base}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    const filePath = `avatars/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("🛑 Supabase upload error:", uploadError.message);
      return res.status(500).json({ message: "Failed to upload to Supabase" });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`;

    user.avatarUrl = publicUrl;
    await user.save();

    //console.log("[uploadAvatar] ✅ Avatar uploaded and saved:", publicUrl);
    res.status(200).json({ avatarUrl: publicUrl });
  } catch (error) {
    console.error("❌ [uploadAvatar] Server error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addPlaytime = async (req, res) => {
  try {
    const { hours } = req.body;
    if (typeof hours !== "number" || hours <= 0) {
      return res.status(400).json({ message: "Invalid hours value" });
    }

    const user = await User.findById(req.user._id);
    user.hoursPlayed = (user.hoursPlayed || 0) + hours;
    await user.save();

    res
      .status(200)
      .json({ message: "Playtime updated", hoursPlayed: user.hoursPlayed });
  } catch (err) {
    console.error("Failed to update playtime:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // assumes middleware handles hashing

    await user.save();

    res.status(200).json({
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("[UpdateProfile] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
