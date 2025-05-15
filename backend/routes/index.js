const express = require("express");
const router = express.Router();

const routeDefs = [
  { path: "/auth", module: "./authRoutes" },
  { path: "/users", module: "./userRoutes" },
  { path: "/messages", module: "./messageRoutes" },
  { path: "/characters", module: "./characterRoutes" },
  { path: "/campaigns", module: "./campaignRoutes" },
  { path: "/dmtoolkit", module: "./dmToolkitRoutes" },
  { path: "/uploads", module: "./uploadRoutes" },
  { path: "/sessionstate", module: "./sessionState" },
  { path: "/player-toolkit-tokens", module: "./playerToolkitRoutes" },
  { path: "/dicerolls", module: "./diceRollRoutes" },
];

// Safe dynamic mounting with logging
routeDefs.forEach(({ path, module }) => {
  try {
    console.log(`🔗 Mounting route: /api${path}`);
    const routeModule = require(module);

    if (typeof routeModule !== "function" || !routeModule.stack) {
      console.warn(
        `⚠️  Route module at ${module} is not a valid Express Router`
      );
      console.warn(`🔍 typeof routeModule: ${typeof routeModule}`);
      console.warn(`🔍 routeModule keys:`, Object.keys(routeModule));
    }

    router.use(path, routeModule);
  } catch (err) {
    console.error(
      `❌ Failed to mount /api${path} from ${module}:`,
      err.message
    );
  }
});

module.exports = router;
