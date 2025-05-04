const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // ✅ Load env vars BEFORE anything else

const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const dmToolkitRoutes = require('./routes/dmToolkitRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // ✅ New upload route
const appRoutes = require('./routes'); // general app routes
require('./config/passport'); // ✅ after dotenv

// Connect to MongoDB
connectDB();

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Session and Passport
app.use(session({
  secret: 'sessionsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Static file serving
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));
app.use('/uploads/monsters', express.static(path.join(__dirname, 'uploads/monsters'))); // ✅ for monster images
app.use('/uploads/npcs', express.static(path.join(__dirname, 'uploads/npcs')));
app.use('/uploads/maps', express.static(path.join(__dirname, 'uploads/maps')));


// API Routes
app.use('/api/dmtoolkit', dmToolkitRoutes);
app.use('/api', appRoutes);            // general app logic
app.use('/api', uploadRoutes);         // ✅ file upload API

// Root health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
