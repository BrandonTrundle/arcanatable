const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");

require("dotenv-flow").config();
const isDev = process.env.DEV_MODE === "true";

const connectDB = require("./config/db");
connectDB();

const app = express();
const server = http.createServer(app);

// 📁 Ensure uploads folder structure
const uploadsBasePath = path.join(__dirname, "uploads");
const requiredFolders = [
  "avatars",
  "campaigns",
  "characters",
  "maps",
  "monsters",
  "npcs",
  "tokenImages",
];
if (!fs.existsSync(uploadsBasePath)) fs.mkdirSync(uploadsBasePath);
requiredFolders.forEach((folder) => {
  const folderPath = path.join(uploadsBasePath, folder);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
});

// 🔌 Socket.IO setup
const io = new Server(server, {
  cors: isDev
    ? {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      }
    : undefined,
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  socket.on("joinRoom", (campaignId) => {
    socket.join(campaignId);
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

  socket.on("secretRoll", ({ targetUserId, ...rest }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) io.to(targetSocketId).emit("secretRoll", rest);
  });

  socket.on("chatMessage", (message) => {
    io.to(message.campaignId).emit("chatMessage", message);
  });

  socket.on("registerUser", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("loadMap", (map) => {
    const campaignId = map.content?.campaign;
    if (!campaignId) return;
    io.to(campaignId).emit("loadMap", map);
  });

  socket.on("updateTokens", ({ mapId, tokens }) => {
    socket.broadcast.emit("tokensUpdated", { mapId, tokens });
  });

  socket.on("tokensUpdated", () => {});

  socket.on("tokenSelected", ({ campaignId, ...rest }) => {
    if (!campaignId) return;
    io.to(campaignId).emit("tokenSelected", rest);
  });

  socket.on("tokenDeselected", ({ campaignId, ...rest }) => {
    io.to(campaignId).emit("tokenDeselected", rest);
  });

  socket.on("tokenDrop", ({ campaignId, mapId, token }) => {
    if (!campaignId || !mapId || !token) return;
    socket.to(campaignId).emit("tokenDropped", { mapId, token });
  });

  socket.on("aoePlaced", ({ campaignId, mapId, aoe }) => {
    if (!campaignId || !mapId || !aoe) return;
    socket.to(campaignId).emit("aoePlaced", { mapId, aoe });
  });

  socket.on("aoeRemoved", ({ campaignId, mapId, aoeId }) => {
    if (!campaignId || !mapId || !aoeId) return;
    socket.to(campaignId).emit("aoeRemoved", { mapId, aoeId });
  });

  socket.on("playerMovedToken", ({ campaignId, mapId, tokenId, x, y }) => {
    if (!campaignId || !mapId || !tokenId) return;
    io.to(campaignId).emit("playerMovedToken", { mapId, tokenId, x, y });
  });
});

// Middleware
if (isDev) {
  console.log("🧪 Running in DEV MODE");
  app.use(cors());
}
app.use(express.json({ limit: "20mb" }));

// Session + Auth
app.use(
  session({
    secret: "sessionsecret",
    resave: false,
    saveUninitialized: false,
  })
);
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
const staticPaths = [
  "avatars",
  "monsters",
  "npcs",
  "maps",
  "tokenImages",
  "campaigns",
  "characters",
];
staticPaths.forEach((folder) => {
  app.use(
    `/uploads/${folder}`,
    express.static(path.join(__dirname, `uploads/${folder}`))
  );
});

// API Routes
app.use("/api/dmtoolkit", require("./routes/dmToolkitRoutes"));
app.use("/api/characters", require("./routes/characterRoutes"));
app.use("/api/campaigns", require("./routes/campaignRoutes"));
app.use("/api", require("./routes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/sessionstate", require("./routes/sessionState"));
app.use("/api/player-toolkit-tokens", require("./routes/playerToolkitRoutes"));
app.use("/api/dicerolls", require("./routes/diceRollRoutes"));

// SPA fallback for React routes (only in production)
if (!isDev) {
  const distPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [DEV_MODE=${isDev}]`)
);
