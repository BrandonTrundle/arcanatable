const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Helper: Create dynamic multer storage
 */
const createStorage = (folderName) => {
  const uploadPath = path.join(__dirname, `../uploads/${folderName}`);

  // Ensure folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${unique}${ext}`);
    },
  });
};

/**
 * Helper: Create upload route for a category
 */
const createUploadRoute = (routePath, folderName) => {
  const upload = multer({ storage: createStorage(folderName) });

  router.post(routePath, protect, upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const imageUrl = `/uploads/${folderName}/${req.file.filename}`;
      res.status(200).json({ url: imageUrl });
    } catch (err) {
      console.error(`${folderName} upload error:`, err);
      res.status(500).json({ error: "Upload failed" });
    }
  });
};

// ✅ Define all upload routes
createUploadRoute("/uploads/monsters", "monsters");
createUploadRoute("/uploads/npcs", "npcs");
createUploadRoute("/uploads/maps", "maps");
createUploadRoute("/uploads/tokenImages", "tokenImages");
createUploadRoute("/uploads/campaigns", "campaigns"); // ✅ new route

module.exports = router;
