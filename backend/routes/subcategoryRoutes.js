const express = require('express');
const router = express.Router();
const { getPetaBySubcategory, createSubcategory } = require('../controllers/subcategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:id/petasubcategories', getPetaBySubcategory);
router.post('/', protect, admin, createSubcategory);

module.exports = router;
