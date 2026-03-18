const express = require("express");
const router = express.Router();
const { getProductReviews, addReview, deleteReview, getReviewStats, updateReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:productId", getProductReviews);
router.get("/:productId/stats", getReviewStats);
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
