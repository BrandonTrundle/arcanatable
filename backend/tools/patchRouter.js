// tools/patchRouter.js

// Disable patchRouter in production
if (process.env.DEV_MODE !== "true") {
  // No-op: skip patching Express router
  return;
}

const express = require("express");

// Monkey-patch express.Router to log invalid uses
const originalRouter = express.Router;
express.Router = function (...args) {
  const router = originalRouter(...args);
  const origUse = router.use;

  router.use = function (...useArgs) {
    const pathArg = useArgs[0];
    if (typeof pathArg !== "string" && typeof pathArg !== "function") {
      console.log("🛑 BAD router.use() — invalid first arg:", pathArg);
    }
    return origUse.apply(router, useArgs);
  };

  return router;
};
