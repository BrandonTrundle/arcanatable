const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");

// Load environment variables
require("dotenv").config();
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);

const isDev = process.env.DEV_MODE === "true";

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

const app = express();
const server = http.createServer(app);

// Ensure uploads directory structure
const uploadsBase = path.join(__dirname, "uploads");
const uploadDirs = [
  "avatars",
  "campaigns",
  "characters",
  "maps",
  "monsters",
  "npcs",
  "tokenImages",
];
if (!fs.existsSync(uploadsBase)) fs.mkdirSync(uploadsBase);
uploadDirs.forEach((dir) => {
  const dirPath = path.join(uploadsBase, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// Socket.IO setup
const io = new Server(server, {
  cors: isDev
    ? {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      }
    : undefined,
});
const userSockets = new Map();
io.on("connection", (socket) => {
  socket.on("joinRoom", (id) => {
    socket.join(id);
    io.to(id).emit("userJoined", { socketId: socket.id });
  });
  socket.on("registerUser", (uid) => userSockets.set(uid, socket.id));
  socket.on("secretRoll", ({ targetUserId, ...rest }) => {
    const sock = userSockets.get(targetUserId);
    if (sock) io.to(sock).emit("secretRoll", rest);
  });
  socket.on("chatMessage", (m) => io.to(m.campaignId).emit("chatMessage", m));
  socket.on("loadMap", (map) => {
    const cid = map.content?.campaign;
    if (cid) io.to(cid).emit("loadMap", map);
  });
  socket.on("updateTokens", ({ mapId, tokens }) =>
    socket.broadcast.emit("tokensUpdated", { mapId, tokens })
  );
  socket.on("tokenSelected", ({ campaignId, ...rest }) => {
    if (campaignId) io.to(campaignId).emit("tokenSelected", rest);
  });
  socket.on("tokenDeselected", ({ campaignId, ...rest }) => {
    if (campaignId) io.to(campaignId).emit("tokenDeselected", rest);
  });
  socket.on("tokenDrop", ({ campaignId, mapId, token }) => {
    if (campaignId && mapId && token)
      socket.to(campaignId).emit("tokenDropped", { mapId, token });
  });
  socket.on("aoePlaced", ({ campaignId, mapId, aoe }) => {
    if (campaignId && mapId && aoe)
      socket.to(campaignId).emit("aoePlaced", { mapId, aoe });
  });
  socket.on("aoeRemoved", ({ campaignId, mapId, aoeId }) => {
    if (campaignId && mapId && aoeId)
      socket.to(campaignId).emit("aoeRemoved", { mapId, aoeId });
  });
  socket.on("playerMovedToken", ({ campaignId, mapId, tokenId, x, y }) => {
    if (campaignId && mapId && tokenId)
      io.to(campaignId).emit("playerMovedToken", { mapId, tokenId, x, y });
  });
  socket.on("disconnect", () => {
    for (const [uid, sid] of userSockets.entries()) {
      if (sid === socket.id) {
        userSockets.delete(uid);
        break;
      }
    }
  });
});

// Middleware
const allowed = isDev
  ? ["http://localhost:3000"]
  : ["https://arcanatable.onrender.com"];
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json({ limit: "20mb" }));

// Session & Passport
app.use(
  session({ secret: "sessionsecret", resave: false, saveUninitialized: false })
);
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
uploadDirs.forEach((dir) => {
  const p = path.join(uploadsBase, dir);
  app.use(
    `/uploads/${dir}`,
    (req, res, next) => {
      res.header(
        "Access-Control-Allow-Origin",
        "https://arcanatable.onrender.com"
      );
      res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    },
    express.static(p)
  );
});

// API routes
app.use("/api", require("./routes"));

// Serve React in production
if (!isDev) {
  const buildPath = path.join(__dirname, "client", "build");
  app.use(express.static(buildPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
      return next();
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// Health check
app.get("/", (req, res) => res.send("API is running..."));

// Debug routes
if (app._router?.stack)
  app._router.stack.forEach(
    (layer) => layer.route?.path && console.log("✅ ROUTE:", layer.route.path)
  );

// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server on port ${PORT} [DEV_MODE=${isDev}]`)
);
