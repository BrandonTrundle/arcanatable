require("./tools/patchRouter");
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");

require("dotenv").config(); // ✅ Always load .env
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);

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
const allowedOrigins = isDev
  ? ["http://localhost:3000"]
  : ["https://arcanatable.onrender.com"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));

// Session + Passport
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
requiredFolders.forEach((folder) => {
  app.use(
    `/uploads/${folder}`,
    express.static(path.join(__dirname, `uploads/${folder}`))
  );
});

// ✅ Centralized API routing
console.log("🔍 Mounting central API router...");
const originalUse = app.use.bind(app);
app.use = function (...args) {
  const path = typeof args[0] === "string" ? args[0] : "<no-path>";
  if (path.includes("?") || path.includes("/:")) {
    console.log("🛑 Suspicious path passed to app.use:", path);
  } else {
    console.log("✅ app.use called with:", path);
  }
  return originalUse(...args);
};

app.use("/api", require("./routes")); // 👈 one mount to rule them all

// SPA fallback

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Route debug output
if (app._router?.stack) {
  app._router.stack.forEach((layer) => {
    if (layer.route?.path) {
      console.log("✅ ROUTE:", layer.route.path);
    }
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [DEV_MODE=${isDev}]`)
);
