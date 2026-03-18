const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["order", "product", "system", "offer", "return"], default: "system" },
    // single user recipient (user notifications) - optional
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // array of recipients (useful for broadcasting to multiple users)
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // mark read flag (for simple single-user notifications)
    isRead: { type: Boolean, default: false },
    // global/system notification
    isGlobal: { type: Boolean, default: false },
    // optional related product or order
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    // freeform metadata
    meta: { type: Object },
    // optional link for frontend navigation
    link: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
