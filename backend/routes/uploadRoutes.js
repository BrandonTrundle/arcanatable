const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Define storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/monsters'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/uploads/monsters
router.post('/uploads/monsters', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const imageUrl = `/uploads/monsters/${req.file.filename}`;
      res.status(200).json({ url: imageUrl });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  const npcStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/npcs'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${unique}${ext}`);
    }
  });
  
  const npcUpload = multer({ storage: npcStorage });
  
  router.post('/uploads/npcs', npcUpload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const imageUrl = `/uploads/npcs/${req.file.filename}`;
      res.status(200).json({ url: imageUrl });
    } catch (err) {
      console.error('NPC upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
  const mapStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/maps'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${unique}${ext}`);
    }
  });
  
  const mapUpload = multer({ storage: mapStorage });
  
  router.post('/uploads/maps', mapUpload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const imageUrl = `/uploads/maps/${req.file.filename}`;
      res.status(200).json({ url: imageUrl });
    } catch (err) {
      console.error('Map upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

module.exports = router;
