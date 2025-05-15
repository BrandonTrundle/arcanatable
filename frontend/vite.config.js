import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  // Load env variables based on current mode (development, production)
  const env = loadEnv(mode, process.cwd(), "");
  const isDevMode = env.VITE_DEV_MODE === "true";

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: isDevMode
        ? {
            "/api": {
              target: "http://localhost:5000",
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined, // No proxy in production
    },
    test: {
      globals: true,
      environment: "jsdom",
      include: ["src/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
      },
      setupFiles: ["./src/setupTests.js"],
    },
  });
};
