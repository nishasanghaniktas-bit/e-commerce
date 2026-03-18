const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const { deductStock } = require("./productController");
const { emitToAdmins, emitToUser } = require("../utils/socket");

const buildOrderId = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      items = [],
      subtotal = 0,
      discount = 0,
      tax = 0,
      shippingCharge = 0,
      total = 0,
      couponCode,
      paymentMethod = "COD", // Default to COD as per requirement strings
      paymentStatus = "Pending",
      transactionId,
      shippingAddress,
    } = req.body;

    if (!items.length) return res.status(400).json({ message: "Cart is empty" });

    // Validate stock
    for (const item of items) {
      const productId = item.product || item._id;
      const ok = await deductStock(productId, item.quantity);
      if (!ok) return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
    }

    const calculatedTotal = total || (subtotal + tax + shippingCharge - discount);

    const order = await Order.create({
      orderId: buildOrderId(),
      user: req.user._id,
      userId: req.user._id, // Field redundancy for requirement compliance
      items: items.map((item) => {
        const prodId = item.product || item._id || item.productId;
        let img = item.image;
        if (Array.isArray(img)) img = img[0];
        if (typeof img !== "string") img = "";
        
        return {
          product: prodId,
          productId: prodId,
          name: item.name || "Product",
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: img.replace(/\\/g, "/"),
          status: "ordered"
        };
      }),
      pricing: {
        subtotal,
        discount,
        tax,
        shipping: shippingCharge,
        total: calculatedTotal,
      },
      totalAmount: calculatedTotal, // Compliance field
      coupon: couponCode ? { code: couponCode, discount: discount } : undefined,
      shippingAddress,
      paymentMethod: paymentMethod === "online" ? "Online" : "COD",
      paymentStatus: paymentStatus || (paymentMethod === "COD" ? "Pending" : "Pending"),
      transactionId,
      orderStatus: "Processing", // Default requested
      status: "Processing", // Compatibility
      statusHistory: [{ status: "Processing", note: "Order placed" }],
    });

    // create notification for admin and user
    try {
      const note = await Notification.create({
        title: "New Order Placed",
        message: `Order ${order.orderId} placed by ${req.user.name || req.user.email}`,
        type: "order",
        userId: req.user._id,
        recipients: [],
        meta: { orderId: order._id }
      });
      // emit to admins and the user
      emitToAdmins("notification", note);
      emitToUser(req.user._id, "notification", note);
    } catch (e) {
      console.error("Notification error:", e.message);
    }

    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= USER ORDERS ================= */
exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User context missing" });
    }
    // Use .lean() for performance
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SINGLE ORDER ================= */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name price image");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN ALL ORDERS ================= */
exports.getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CANCEL ORDER ================= */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!require("mongoose").Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: "Order cancelled" });

    // restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE STATUS (ADMIN) ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
    ];

    const incomingStatus = req.body.status?.toLowerCase();
    if (incomingStatus && !allowedStatuses.includes(incomingStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (incomingStatus) {
      order.status = incomingStatus;
      order.orderStatus = incomingStatus.charAt(0).toUpperCase() + incomingStatus.slice(1); // Standardize to capitalized for orderStatus
    } else {
      return res.status(400).json({ message: "Status is required" });
    }
    order.courier = req.body.courier || order.courier;
    order.trackingId = req.body.trackingId || order.trackingId;

    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: order.status,
      note: req.body.note,
      changedAt: new Date(),
    });

    if (order.status === "delivered") order.deliveredAt = new Date();

    await order.save();
    // send notification to user about status change
    try {
      const note = await Notification.create({
        title: `Order ${order.orderId} status updated`,
        message: `Your order ${order.orderId} is now ${order.orderStatus || order.status}`,
        type: "order",
        userId: order.user,
        meta: { orderId: order._id, status: order.status }
      });
      emitToUser(order.user, "notification", note);
      emitToAdmins("notification", note);
    } catch (e) {
      console.error("Notification error:", e.message);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= REORDER ================= */
exports.reorderOrder = async (req, res) => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ message: "Order not found" });
    if (oldOrder.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    for (const item of oldOrder.items) {
      const ok = await deductStock(item.product, item.quantity);
      if (!ok) return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
    }

    const newOrder = await Order.create({
      orderId: buildOrderId(),
      user: req.user._id,
      items: oldOrder.items,
      pricing: oldOrder.pricing,
      payment: { method: "cod", status: "pending" },
      statusHistory: [{ status: "pending", note: "Reorder placed" }],
    });

    res.status(201).json({ message: "Reordered", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= RETURN ================= */
exports.requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "returned";
    order.returnReason = req.body.reason;
    order.statusHistory.push({ status: "returned", note: req.body.reason });
    await order.save();

    // restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= REFUND ================= */
exports.processRefund = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        "payment.status": "refunded",
        refundAmount: req.body.refundAmount,
        status: "returned",
      },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ================= DELETE ORDER ================= */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restrict deletion: Users can only delete their own orders if they are cancelled or delivered
    // Admins can delete any order
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If user is deleting, ensure it's in a final state (cancelled/delivered)
    if (!isAdmin && !["cancelled", "delivered", "returned"].includes(order.status)) {
       return res.status(400).json({ message: "You can only delete cancelled or completed orders" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
