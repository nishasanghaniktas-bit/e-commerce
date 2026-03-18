const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    returnRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ReturnRequest", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Completed"],
      default: "Processing",
    },
    transactionId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Refund", refundSchema);
