const express = require("express");
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { getSubcategoriesByCategory } = require("../controllers/categoryController");
const subcategoryRoutes = require('./subcategoryRoutes');
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);
router.get("/:id/subcategories", getSubcategoriesByCategory);
router.use('/subcategories', subcategoryRoutes);

module.exports = router;
