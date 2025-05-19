const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");
const Campaign = require("../backend/models/campaignModel");

const dotenv = require("dotenv");

const envPath =
  process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, ".env.development")
    : path.resolve(__dirname, ".env");

require("dotenv").config({ path: envPath });

console.log("NODE_ENV is:", process.env.NODE_ENV);
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);
console.log("✅ DEV_MODE:", process.env.DEV_MODE);

const isDev = process.env.DEV_MODE === "true";

// Only patch Express router in dev mode
if (isDev) {
  require("./tools/patchRouter");
}

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

  socket.on("secretRoll", async ({ campaignId, ...rest }) => {
    //console.log("📥 Received secretRoll for campaign:", campaignId);

    try {
      const campaign = await Campaign.findById(campaignId).select("creator");
      if (!campaign) {
        console.warn("❗️ No campaign found for ID:", campaignId);
        return;
      }

      const dmSocketInfo = userSocketMap.get(String(campaign.creator));
      if (dmSocketInfo?.socketId) {
        //console.log(
        //  "📤 Sending secretRoll to DM socket:",
        //  dmSocketInfo.socketId
        // );
        io.to(dmSocketInfo.socketId).emit("secretRoll", rest);
      } else {
        console.warn("❗️ DM socket not found in userSocketMap");
      }
    } catch (err) {
      console.error("❌ Failed to process secret roll:", err);
    }
  });

  socket.on("chatMessage", (message) => {
    io.to(message.campaignId).emit("chatMessage", message);
  });

  socket.on("registerUser", ({ userId, campaignId }) => {
    userSocketMap.set(userId, {
      socketId: socket.id,
      campaignId,
    });
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

  socket.on("playerDroppedToken", ({ mapId, campaignId, token }) => {
    console.log(
      "📡 Server relaying playerDroppedToken to campaign:",
      campaignId
    );
    io.to(campaignId).emit("playerDroppedToken", { mapId, token });
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
const allowed = isDev
  ? ["http://localhost:5173"]
  : ["https://arcanatable.onrender.com"];

app.use(
  cors({
    origin: allowed,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ PATCH added
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
  // point to frontend/dist instead of client/build
  const buildPath = path.resolve(__dirname, "..", "frontend", "dist");
  app.use(express.static(buildPath));

  // catch-all: hand off non-API/non-upload routes to index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
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
