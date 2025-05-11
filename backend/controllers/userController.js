const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

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
      avatarUrl: user.avatarUrl || "/defaultav.png", // Include avatar in response
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
  console.log("[uploadAvatar] ⬅️ Avatar upload request received");

  try {
    if (!req.file) {
      console.warn("[uploadAvatar] ❌ No file uploaded in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("[uploadAvatar] 📂 Uploaded file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path,
    });

    const user = await User.findById(req.user._id);
    console.log("[uploadAvatar] 🔍 Found user:", user.username);

    const oldAvatar = user.avatarUrl;
    const oldFilename = oldAvatar?.split("/").pop();
    const oldPath = path.join(
      __dirname,
      "..",
      "uploads",
      "avatars",
      oldFilename
    );
    const isCustomAvatar =
      oldAvatar &&
      oldAvatar !== "/defaultav.png" &&
      oldAvatar.startsWith("/uploads/avatars/");

    if (isCustomAvatar) {
      console.log(
        "[uploadAvatar] 🧹 Attempting to delete old avatar at:",
        oldPath
      );

      fs.stat(oldPath, (err, stats) => {
        if (!err && stats.isFile()) {
          fs.unlink(oldPath, (unlinkErr) => {
            if (unlinkErr) {
              console.warn(
                "⚠️ Failed to delete old avatar:",
                unlinkErr.message
              );
            } else {
              console.log("🗑 Old avatar deleted successfully:", oldAvatar);
            }
          });
        } else {
          console.warn("⚠️ Old avatar not found or is not a file:", oldPath);
        }
      });
    }

    const newAvatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = newAvatarPath;
    await user.save();

    console.log("[uploadAvatar] ✅ New avatar saved:", newAvatarPath);

    res.status(200).json({ avatarUrl: newAvatarPath });
  } catch (error) {
    console.error("❌ [uploadAvatar] Server error:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};
