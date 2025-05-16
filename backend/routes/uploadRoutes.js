const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Helper: Create dynamic multer storage for a folder
 */
const createStorage = (folderName) => {
  const uploadPath = path.join(__dirname, `../uploads/${folderName}`);

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
 * Helper: Define an upload route for a specific resource
 */
const defineUploadRoute = (urlPath, folderName) => {
  const upload = multer({ storage: createStorage(folderName) });

  router.post(urlPath, protect, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${folderName}/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  });
};

// ✅ Define routes for each category
defineUploadRoute("/monsters", "monsters");
defineUploadRoute("/npcs", "npcs");
defineUploadRoute("/maps", "maps");
defineUploadRoute("/tokenImages", "tokenImages");
defineUploadRoute("/campaigns", "campaigns");

module.exports = router;
