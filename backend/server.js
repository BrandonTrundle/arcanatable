require("./tools/patchRouter");
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");

// Load environment variables as early as possible
require("dotenv").config();
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);

const isDev = process.env.DEV_MODE === "true";

// Connect to database
const connectDB = require("./config/db");
connectDB();

const app = express();
const server = http.createServer(app);

// Ensure uploads folder structure exists
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
  const folderPath = path.join(uploadsBase, dir);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
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

const userSocketMap = new Map();
io.on("connection", (socket) => {
  socket.on("joinRoom", (campaignId) => {
    socket.join(campaignId);
    io.to(campaignId).emit("userJoined", { socketId: socket.id });
  });

  socket.on("registerUser", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("secretRoll", ({ targetUserId, ...rest }) => {
    const targetSocket = userSocketMap.get(targetUserId);
    if (targetSocket) io.to(targetSocket).emit("secretRoll", rest);
  });

  socket.on("chatMessage", (message) => {
    io.to(message.campaignId).emit("chatMessage", message);
  });

  socket.on("loadMap", (map) => {
    const campaignId = map.content?.campaign;
    if (campaignId) io.to(campaignId).emit("loadMap", map);
  });

  socket.on("updateTokens", ({ mapId, tokens }) => {
    socket.broadcast.emit("tokensUpdated", { mapId, tokens });
  });

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
    for (const [userId, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// Middleware
const allowedOrigins = isDev
  ? ["http://localhost:3000"]
  : ["https://arcanatable.onrender.com"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "20mb" }));

// Session + Passport
app.use(
  session({ secret: "sessionsecret", resave: false, saveUninitialized: false })
);
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Static uploads with CORS headers
uploadDirs.forEach((dir) => {
  const folderPath = path.join(uploadsBase, dir);
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
    express.static(folderPath)
  );
});

// Central API routing
console.log("🔍 Mounting central API router...");
app.use = ((orig) =>
  function (...args) {
    const p = typeof args[0] === "string" ? args[0] : "<no-path>";
    if (p.includes("?") || p.includes("/:")) {
      console.log("🛑 Suspicious path passed to app.use:", p);
    } else console.log("✅ app.use called with:", p);
    return orig.apply(this, args);
  })(app.use.bind(app));

app.use("/api", require("./routes"));

// Serve React build and enable SPA client-side routing
if (!isDev) {
  const clientBuild = path.join(__dirname, "client", "build");
  app.use(express.static(clientBuild));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
      return next();
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

// Health check
app.get("/", (req, res) => res.send("API is running..."));

// Debug registered routes
if (app._router?.stack) {
  app._router.stack.forEach((layer) => {
    if (layer.route?.path) console.log("✅ ROUTE:", layer.route.path);
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [DEV_MODE=${isDev}]`)
);
