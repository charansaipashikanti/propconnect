const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  compareProperties,
} = require('../controllers/propertyController');

router.get('/', getProperties);
router.post('/compare', compareProperties);
router.get('/:id', getPropertyById);

module.exports = router;
