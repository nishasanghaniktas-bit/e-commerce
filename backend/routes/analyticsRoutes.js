const express = require("express");
const router = express.Router();
const { getDashboardStats, getSalesReport, getBestSelling } = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/sales", protect, admin, getSalesReport);
router.get("/best-selling", protect, admin, getBestSelling);

module.exports = router;
