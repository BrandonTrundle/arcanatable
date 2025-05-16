const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const { supabase } = require("../config/supabase");
console.log("[DEBUG] Supabase is:", supabase);

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const defineUploadRoute = (urlPath, folderName) => {
  router.post(urlPath, protect, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname);

    // ✅ Sanitize the base filename to remove problematic characters
    const base = path
      .basename(req.file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_"); // only letters, numbers, dash, underscore

    const uniqueName = `${base}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    const filePath = `${folderName}/${uniqueName}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return res.status(500).json({ error: "Upload failed" });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`;
    res.status(200).json({ url: publicUrl });
  });
};

defineUploadRoute("/monsters", "monsters");
defineUploadRoute("/npcs", "npcs");
defineUploadRoute("/maps", "maps");
defineUploadRoute("/tokenImages", "tokenImages");
defineUploadRoute("/campaigns", "campaigns");
defineUploadRoute("/avatars", "avatars");
defineUploadRoute("/characters", "characters");

module.exports = router;
