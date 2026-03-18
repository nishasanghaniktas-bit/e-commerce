const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");   // 👈 multer import

// REGISTER (admin + user + image upload)
router.post("/register", upload.single("image"), register);

router.post("/login", login);

router.post("/logout", protect, logout);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;