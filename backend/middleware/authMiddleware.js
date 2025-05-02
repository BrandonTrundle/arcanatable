const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ error: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ error: 'No token provided' });
  }
};

module.exports = { protect };
