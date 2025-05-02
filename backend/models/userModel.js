const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: {
    type: String,
    required: function () {
      return !this.socialLogin || !this.socialLogin.googleId;
    },
  },
  roles: { type: [String], default: ['Player'] },
  notificationPreferences: { type: Object, default: {} },
  twoFactorEnabled: { type: Boolean, default: false },
  activeCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
  socialLogin: { googleId: { type: String },},
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
