const express = require("express");
const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Express app + HTTP server (for Socket.IO)
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust if deploying elsewhere
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("joinRoom", (campaignId) => {
    socket.join(campaignId);
    console.log(`🟢 Socket ${socket.id} joined room ${campaignId}`);
    io.to(campaignId).emit("userJoined", { socketId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    // Optional: io.to(room).emit("userLeft", ...) if tracking
  });

  socket.on("chatMessage", (message) => {
    const { campaignId } = message;
    io.to(campaignId).emit("chatMessage", message);
  });

  socket.on("loadMap", (map) => {
    const campaignId = map.content?.campaign;

    if (!campaignId) {
      console.warn("⚠️ Map missing campaign ID:", map);
      return;
    }

    console.log(`📡 Broadcasting map to room ${campaignId}`);
    io.to(campaignId).emit("loadMap", map);
  });
});

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
require("./config/passport"); // Load Passport strategies
app.use(passport.initialize());
app.use(passport.session());

// Static files (uploads)
const staticPaths = [
  "avatars",
  "monsters",
  "npcs",
  "maps",
  "tokenImages",
  "campaigns",
];
staticPaths.forEach((folder) => {
  app.use(
    `/uploads/${folder}`,
    express.static(path.join(__dirname, `uploads/${folder}`))
  );
});

// Routes
const dmToolkitRoutes = require("./routes/dmToolkitRoutes");
const characterRoutes = require("./routes/characterRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const appRoutes = require("./routes"); // General app logic

app.use("/api/dmtoolkit", dmToolkitRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api", appRoutes);
app.use("/api", uploadRoutes);
app.use("/api/sessionstate", require("./routes/sessionState"));

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
