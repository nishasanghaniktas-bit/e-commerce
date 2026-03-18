const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createReturnRequest,
  getMyReturns,
  adminListReturns,
  adminUpdateReturnStatus,
} = require("../controllers/returnController");

// User
router.post("/request", protect, upload.single("image"), createReturnRequest);
router.get("/user", protect, getMyReturns);

// Admin
router.get("/admin", protect, admin, adminListReturns);
router.put("/update-status/:id", protect, admin, adminUpdateReturnStatus);

module.exports = router;
