const express = require('express');
const router = express.Router();
const {
  addToCompare,
  removeFromCompare,
  clearCompare,
} = require('../controllers/compareController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:id', protect, addToCompare);
router.delete('/clear', protect, clearCompare);
router.delete('/:id', protect, removeFromCompare);

module.exports = router;
