const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: { // Explicitly adding for requirement compliance
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Compliance
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        status: { type: String, default: "ordered" }, // "ordered" or "returned"
      },
    ],

    pricing: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    totalAmount: { type: Number }, // Compliance

    coupon: {
      code: String,
      discount: { type: Number, default: 0 },
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: { 
      type: String, 
      enum: ["COD", "Online"], 
      default: "COD" 
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "refunded", "pending", "paid", "failed", "Refunded"],
      default: "Pending"
    },

    transactionId: String,

    orderStatus: {
      type: String,
      enum: [
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "returned",
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "Returned",
        "Pending"
      ],
      default: "Processing",
    },

    payment: { // Keeping for internal/extra data
      method: String,
      status: String,
      provider: String,
      transactionId: String,
      signature: String,
      amount: Number,
      currency: { type: String, default: "INR" },
    },

    status: String, // Keeping for backward compatibility

    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],

    trackingId: String,
    courier: String,
    deliveredAt: Date,
    cancelReason: String,
    returnReason: String,
    refundAmount: Number,
    invoiceUrl: String,
  },
  { timestamps: true }
);

orderSchema.virtual("total").get(function () {
  return this.pricing?.total || 0;
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
