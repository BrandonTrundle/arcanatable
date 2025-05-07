const express = require("express");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const dmToolkitRoutes = require("./routes/dmToolkitRoutes");
const characterRoutes = require("./routes/characterRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const appRoutes = require("./routes"); // General app routes

require("./config/passport"); // Initialize passport config

// Connect to MongoDB
connectDB();

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Session and Passport setup
app.use(
  session({
    secret: "sessionsecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Static file serving for uploads
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "uploads/avatars"))
);
app.use(
  "/uploads/monsters",
  express.static(path.join(__dirname, "uploads/monsters"))
);
app.use("/uploads/npcs", express.static(path.join(__dirname, "uploads/npcs")));
app.use("/uploads/maps", express.static(path.join(__dirname, "uploads/maps")));
app.use(
  "/uploads/tokenImages",
  express.static(path.join(__dirname, "uploads/tokenImages"))
);
app.use(
  "/uploads/campaigns", // ✅ Added for campaign image access
  express.static(path.join(__dirname, "uploads/campaigns"))
);

// API Routes
app.use("/api/dmtoolkit", dmToolkitRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api", appRoutes); // General app logic (auth, users, etc.)
app.use("/api", uploadRoutes); // Upload endpoints

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
