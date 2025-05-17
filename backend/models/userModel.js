const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: {
      type: String,
      required: function () {
        return !this.socialLogin || !this.socialLogin.googleId;
      },
    },
    hoursPlayed: {
      type: Number,
      default: 0,
    },

    roles: {
      type: [String],
      enum: ["user", "admin", "owner"],
      default: ["user"],
    },
    notificationPreferences: { type: Object, default: {} },
    twoFactorEnabled: { type: Boolean, default: false },
    activeCampaigns: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    ],
    socialLogin: {
      googleId: { type: String },
    },

    onboarding: {
      rolePreference: { type: String, enum: ["Player", "GM", "Both"] },
      theme: { type: String },
      experienceLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
      },
    },
    onboardingComplete: { type: Boolean, default: false },
    avatarUrl: {
      type: String,
      default: "/defaultav.png",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
