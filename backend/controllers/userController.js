const User = require('../models/userModel');

exports.updateOnboarding = async (req, res) => {
  try {
    const user = req.user;

    const {
      rolePreference,
      theme,
      experienceLevel
    } = req.body;

    if (!rolePreference || !theme || !experienceLevel) {
      return res.status(400).json({ error: 'All onboarding fields are required.' });
    }

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
      avatarUrl: user.avatarUrl || '/defaultav.png', // Include avatar in response
    });
  } catch (err) {
    console.error('Error in getMe:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.lookupUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const user = await User.findOne({ username }).select('_id username');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.status(200).json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
