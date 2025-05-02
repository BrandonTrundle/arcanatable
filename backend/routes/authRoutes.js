const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');


router.post('/signup', signup);
router.post('/login', login);
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
      session: false,
    }),
    (req, res) => {
      // Return a JWT after Google login
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      res.redirect(`http://localhost:3000/?token=${token}`);
    }
  );

module.exports = router;
