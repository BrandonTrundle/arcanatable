const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");
const Campaign = require("../backend/models/campaignModel");
const AoEModel = require("./models/AoE");

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

  socket.on("updateTokens", ({ campaignId, mapId, tokens }) => {
    //   console.log("📡 [server] updateTokens received:", {
    //     campaignId,
    //    mapId,
    //     tokenCount: tokens.length,
    //    });

    io.to(campaignId).emit("tokensUpdated", { mapId, tokens });
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

  socket.on("combatModeUpdate", ({ campaignId, isCombatMode }) => {
    io.to(campaignId).emit("combatModeUpdate", { isCombatMode });
  });

  socket.on("playerDroppedToken", ({ mapId, campaignId, token }) => {
    //   console.log(
    //     "📡 Server relaying playerDroppedToken to campaign:",
    //     campaignId
    //   );
    io.to(campaignId).emit("playerDroppedToken", { mapId, token });
  });

  socket.on("tokensUpdated", ({ mapId, tokens }) => {
    // Log for server-side visibility
    //  console.log("🛰️ Broadcasting token updates for map:", mapId);

    // Broadcast to everyone else in the room
    socket.broadcast.emit("tokensUpdated", { mapId, tokens });
  });

  socket.on("playerMovedToken", ({ campaignId, mapId, tokenId, x, y }) => {
    if (!campaignId || !mapId || !tokenId) return;
    io.to(campaignId).emit("playerMovedToken", { mapId, tokenId, x, y });
  });

  // Handle AoE add (broadcast)
  socket.on("aoe:add", ({ campaignId, aoe }) => {
    //   console.log(`[SERVER] aoe:add from ${socket.id}`, aoe);
    socket.to(campaignId).emit("aoe:add", aoe);
  });

  // Handle AoE update (broadcast)
  socket.on("aoe:update", ({ campaignId, id, updates }) => {
    //   console.log(`[SERVER] aoe:update from ${socket.id}`, { id, updates });
    socket.to(campaignId).emit("aoe:update", { id, updates });
  });

  // Handle AoE remove (broadcast)
  socket.on("aoe:remove", ({ campaignId, id }) => {
    //   console.log(`[SERVER] aoe:remove from ${socket.id}`, id);
    socket.to(campaignId).emit("aoe:remove", id);
  });

  // Handle AoE save (persist)
  socket.on("aoe:save", async ({ campaignId, mapId, aoe }) => {
    try {
      await AoEModel.findOneAndUpdate(
        { campaignId, mapId, "aoe.id": aoe.id },
        { $set: { campaignId, mapId, aoe } },
        { upsert: true }
      );
      //  console.log(`[SERVER] Saved AoE ${aoe.id} for map ${mapId}`);
    } catch (err) {
      console.error("[SERVER] Failed to save AoE:", err);
    }
  });

  // Handle AoE delete (persist)
  socket.on("aoe:delete", async ({ campaignId, mapId, id }) => {
    try {
      await AoEModel.deleteOne({ campaignId, mapId, "aoe.id": id });
      //  console.log(`[SERVER] Deleted AoE ${id} from map ${mapId}`);
    } catch (err) {
      console.error("[SERVER] Failed to delete AoE:", err);
    }
  });

  // Handle AoE load (initial sync)
  socket.on("aoe:load", async ({ campaignId, mapId }) => {
    try {
      const aoes = await AoEModel.find({ campaignId, mapId }).lean();
      socket.emit(
        "aoe:load",
        aoes.map((doc) => doc.aoe)
      );
      //  console.log(`[SERVER] Loaded ${aoes.length} AoEs for map ${mapId}`);
    } catch (err) {
      console.error("[SERVER] Failed to load AoEs:", err);
    }
  });

  socket.on("measurement:update", (data) => {
    // console.log("[SERVER] measurement:update received:", data);
    socket.to(data.mapId).emit("measurement:receive", data);
  });

  socket.on("measurement:clear", ({ mapId, userId }) => {
    socket.to(mapId).emit("measurement:clear", { userId });
  });

  socket.on("measurement:clearMy", ({ mapId, userId }) => {
    // Broadcast only to others in the same map room
    socket.to(mapId).emit("measurement:clearMy", { userId });
  });

  socket.on("measurement:lock", (data) => {
    //  console.log("[SERVER] Locked measurement:", data);
    socket.to(data.mapId).emit("measurement:lock", data);
  });

  socket.on("measurement:clearLocked", ({ mapId, userId }) => {
    //   socket.to(mapId).emit("measurement:clearLocked", { userId });
  });

  socket.on("measurement:clearAll", ({ mapId }) => {
    //   console.log(`[SERVER] Clearing all measurements in map ${mapId}`);
    io.to(mapId).emit("measurement:clearAll");
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
