const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createToolkitItem,
  getToolkitItems,
  updateToolkitItem,
  deleteToolkitItem,
} = require('../controllers/dmToolkitController');

router.use(protect);

router.post('/', createToolkitItem);
router.get('/', getToolkitItems);
router.patch('/:id', updateToolkitItem);
router.delete('/:id', deleteToolkitItem);

module.exports = router;
