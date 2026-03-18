const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");
const { getDashboardStats, getAllUsers, toggleUserStatus } = require("../controllers/adminController");

router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.put("/users/status/:id", protect, admin, toggleUserStatus);

module.exports = router;
