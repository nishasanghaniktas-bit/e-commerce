const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  createStripeSession,
} = require("../controllers/paymentController");

router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpaySignature);
router.post("/stripe/session", protect, createStripeSession);

// Generic Compliance Routes (mapping to Razorpay for now as it's the default in existing code)
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpaySignature);

module.exports = router;
