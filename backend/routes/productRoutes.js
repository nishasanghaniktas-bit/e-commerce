const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin CRUD (supports single cover + unlimited gallery images)
const productUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images" },
]);
router.post("/", protect, admin, productUpload, addProduct);
router.put("/:id", protect, admin, productUpload, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
