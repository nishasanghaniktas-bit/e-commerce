const express = require("express");
const router = express.Router();
const { getCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getCoupons);
router.post("/validate", protect, validateCoupon);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
