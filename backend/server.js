const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // ✅ Load env vars BEFORE anything else

const connectDB = require('./config/db');
const cors = require('cors');
const session = require('express-session');
const dmToolkitRoutes = require('./routes/dmToolkitRoutes');
const passport = require('passport');
const path = require('path');

// ✅ Passport should be configured AFTER dotenv
require('./config/passport');

const routes = require('./routes');
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/dmtoolkit', dmToolkitRoutes);
app.use(session({
  secret: 'sessionsecret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', routes);
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
