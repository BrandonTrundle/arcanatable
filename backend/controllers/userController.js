const User = require('../models/userModel');

exports.updateOnboarding = async (req, res) => {
  try {
    const user = req.user;

    const {
      rolePreference,
      theme,
      experienceLevel
    } = req.body;

    // Basic validation
    if (!rolePreference || !theme || !experienceLevel) {
      return res.status(400).json({ error: 'All onboarding fields are required.' });
    }

    // Update onboarding subdocument
    user.onboarding = {
      rolePreference,
      theme,
      experienceLevel
    };

    user.onboardingComplete = true;

    await user.save();

    res.status(200).json({ message: 'Onboarding complete', onboarding: user.onboarding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const user = req.user;

    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      onboardingComplete: user.onboardingComplete,
      roles: user.roles,
      onboarding: user.onboarding || {},
    });
  } catch (err) {
    console.error('Error in getMe:', err); // 🧪 Log actual issue
    res.status(500).json({ error: err.message });
  }
};