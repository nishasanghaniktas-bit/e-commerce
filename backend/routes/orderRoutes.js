const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
  reorderOrder,
  requestReturn,
  processRefund,
  deleteOrder,
} = require("../controllers/orderController");

// Static routes first to avoid parameter conflicts
router.get("/user", protect, getUserOrders);
router.get("/my", protect, getUserOrders);
router.get("/all", protect, admin, getAllOrders);
router.get("/admin", protect, admin, getAllOrders);

router.post("/", protect, createOrder);
router.post("/create", protect, createOrder);

router.put("/cancel/:id", protect, cancelOrder);
router.post("/reorder/:id", protect, reorderOrder);
router.put("/return/:id", protect, requestReturn);
router.put("/refund/:id", protect, admin, processRefund);
router.put("/:id/status", protect, admin, updateOrderStatus);

// Parameterized routes last
router.get("/:id", protect, getOrderById);
router.delete("/:id", protect, deleteOrder);

module.exports = router;
