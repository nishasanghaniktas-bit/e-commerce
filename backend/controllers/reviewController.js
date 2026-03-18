const Review = require("../models/Review");
const Product = require("../models/Product");

/* ================= ADD REVIEW ================= */
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Upsert: if user already reviewed, update instead of failing
    let review = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (review) {
      review.rating = rating ?? review.rating;
      review.comment = comment ?? review.comment;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: req.user.id,
        rating,
        comment
      });
    }

    // Update product average rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: allReviews.length
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PRODUCT REVIEWS ================= */
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE REVIEW ================= */
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating
    });

    res.json({
      message: "Review updated successfully",
      review
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE REVIEW ================= */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: allReviews.length
    });

    res.json({ message: "Review deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET REVIEW STATS ================= */
exports.getReviewStats = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId });

    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    res.json(stats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
