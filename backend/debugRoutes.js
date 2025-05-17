const fs = require("fs");
const path = require("path");

const ROUTES_DIR = path.join(__dirname, "routes");

function scanFileForBadPaths(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("router.use(") ||
      trimmed.startsWith("router.get(") ||
      trimmed.startsWith("router.post(") ||
      trimmed.startsWith("router.patch(") ||
      trimmed.startsWith("router.put(") ||
      trimmed.startsWith("router.delete(")
    ) {
      if (/\/:($|[^a-zA-Z])/.test(trimmed) || /\/[^/]*\?[^:]/.test(trimmed)) {
        //console.log(`🚨 Possibly invalid path in ${filePath}:${index + 1}`);
        //console.log(`   → ${trimmed}`);
      }
    }
  });
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith(".js")) {
      scanFileForBadPaths(fullPath);
    }
  });
}

//console.log("🔍 Scanning routes for malformed paths...");
walk(ROUTES_DIR);
