const express = require('express');
const router = express.Router();
const {
  getSavedProperties,
  saveProperty,
  unsaveProperty,
} = require('../controllers/savedController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSavedProperties);
router.post('/:id', protect, saveProperty);
router.delete('/:id', protect, unsaveProperty);

module.exports = router;
