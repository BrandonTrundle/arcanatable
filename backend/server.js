const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
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

// Base uploads folder path (adjust if your uploads folder is elsewhere)
const uploadsBasePath = path.join(__dirname, "uploads");

// List all subfolders you need
const requiredFolders = [
  "avatars",
  "campaigns",
  "characters",
  "maps",
  "monsters",
  "npcs",
  "tokenImages",
];

// Create base uploads folder if missing
if (!fs.existsSync(uploadsBasePath)) {
  fs.mkdirSync(uploadsBasePath);
}

// Create each required subfolder if missing
requiredFolders.forEach((folder) => {
  const folderPath = path.join(uploadsBasePath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust if deploying elsewhere
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  //console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("joinRoom", (campaignId) => {
    socket.join(campaignId);
    //console.log(`🟢 Socket ${socket.id} joined room ${campaignId}`);
    io.to(campaignId).emit("userJoined", { socketId: socket.id });
  });

  socket.on("disconnect", () => {
    for (const [userId, id] of userSocketMap.entries()) {
      if (id === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });

  socket.on("secretRoll", (message) => {
    const { targetUserId } = message;
    const targetSocketId = userSocketMap.get(targetUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("secretRoll", message);
    }
  });

  socket.on("chatMessage", (message) => {
    const { campaignId } = message;
    io.to(campaignId).emit("chatMessage", message);
  });

  socket.on("registerUser", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("loadMap", (map) => {
    const campaignId = map.content?.campaign;

    if (!campaignId) {
      console.warn("⚠️ Map missing campaign ID:", map);
      return;
    }

    //console.log(`📡 Broadcasting map to room ${campaignId}`);
    io.to(campaignId).emit("loadMap", map);
  });

  socket.on("updateTokens", ({ mapId, tokens }) => {
    //console.log(`🔁 Tokens updated for map ${mapId}`);

    // Optional: figure out which campaign this map belongs to (if not already handled)
    // For now, just broadcast to all clients except sender:
    socket.broadcast.emit("tokensUpdated", { mapId, tokens });
  });

  socket.on("tokensUpdated", (payload) => {
    //console.log("📥 Player received tokensUpdated:", payload);
    if (String(payload.mapId) === String(map._id)) {
      setTokens(payload.tokens || []);
    }
  });

  socket.on("tokenSelected", (payload) => {
    //console.log("🛬 Received tokenSelected payload:", payload);

    const { mapId, campaignId, tokenId, userId, username } = payload;

    if (!campaignId) {
      console.warn("⚠️ Missing campaignId, not broadcasting selection.");
      return;
    }

    //console.log(
    //  `🎯 Token selected: ${tokenId} by ${username} in campaign ${campaignId}`
    // );
    io.to(campaignId).emit("tokenSelected", {
      mapId,
      tokenId,
      userId,
      username,
    });
  });

  socket.on("tokenDeselected", ({ campaignId, mapId, userId }) => {
    //console.log(`🧹 Deselection received from ${userId} in ${campaignId}`);
    io.to(campaignId).emit("tokenDeselected", { mapId, userId });
  });

  socket.on("tokenDrop", ({ campaignId, mapId, token }) => {
    if (!campaignId || !mapId || !token) {
      console.warn("⚠️ Invalid tokenDrop payload:", {
        campaignId,
        mapId,
        token,
      });
      return;
    }

    //console.log(
    //  `📤 Token dropped by player in campaign ${campaignId}: ${token.title}`
    // );
    socket.to(campaignId).emit("tokenDropped", { mapId, token });
  });

  socket.on("aoePlaced", ({ campaignId, mapId, aoe }) => {
    if (!campaignId || !mapId || !aoe) {
      console.warn("⚠️ Invalid aoePlaced payload:", { campaignId, mapId, aoe });
      return;
    }

    console.log("📡 Broadcasting AoE to campaign:", { campaignId, mapId, aoe });

    // Send to everyone in the same campaign
    socket.to(campaignId).emit("aoePlaced", { mapId, aoe });
  });

  socket.on("aoeRemoved", ({ campaignId, mapId, aoeId }) => {
    if (!campaignId || !mapId || !aoeId) return;

    console.log("📡 Broadcasting AoE removal:", { campaignId, mapId, aoeId });

    socket.to(campaignId).emit("aoeRemoved", { mapId, aoeId });
  });

  socket.on("playerMovedToken", ({ campaignId, mapId, tokenId, x, y }) => {
    if (!campaignId || !mapId || !tokenId) return;

    io.to(campaignId).emit("playerMovedToken", { mapId, tokenId, x, y });
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
  "characters", // ✅ Add this line
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
app.use("/api/player-toolkit-tokens", require("./routes/playerToolkitRoutes"));
app.use("/api/dicerolls", require("./routes/diceRollRoutes"));

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
