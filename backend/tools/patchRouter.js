// tools/patchRouter.js

// Only patch Express router in development mode
if (process.env.DEV_MODE === "true") {
  const express = require("express");
  const originalRouter = express.Router;

  express.Router = function (...args) {
    const router = originalRouter(...args);
    const origUse = router.use;

    router.use = function (...useArgs) {
      const pathArg = useArgs[0];
      if (typeof pathArg !== "string" && typeof pathArg !== "function") {
        //console.log("🛑 BAD router.use() — invalid first arg:", pathArg);
      }
      return origUse.apply(router, useArgs);
    };

    return router;
  };
}
// No operations in production (DEV_MODE !== 'true')
