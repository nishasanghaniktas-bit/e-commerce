const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  toggleUserStatus,
  getDashboard,
  getProfile,
  updateProfile,
  exportUsersToExcel,
} = require("../controllers/userController");

/* ================= USERS (ADMIN) ================= */
router.get("/", protect, admin, getAllUsers);
router.get("/export", protect, admin, exportUsersToExcel);
router.put("/status/:id", protect, admin, toggleUserStatus);

/* ================= DASHBOARD (USER) ================= */
router.get("/dashboard", protect, getDashboard);

/* ================= PROFILE (USER) ================= */
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("image"), updateProfile);

module.exports = router;
