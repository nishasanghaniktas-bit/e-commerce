const Razorpay = require("razorpay");
const crypto = require("crypto");
const Stripe = require("stripe");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/* ================= RAZORPAY: CREATE ORDER ================= */
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ message: "Razorpay keys missing" });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const amountPaise = Math.round((order.pricing?.total || 0) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.orderId || order._id.toString(),
    });

    await Payment.create({
      order: order._id,
      user: order.user,
      provider: "razorpay",
      method: "online",
      amount: order.pricing?.total || 0,
      currency: "INR",
      status: "pending",
      transactionId: rzpOrder.id,
      raw: rzpOrder,
    });

    res.json({ orderId: rzpOrder.id, amount: amountPaise, currency: "INR", key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= RAZORPAY: VERIFY SIGNATURE ================= */
exports.verifyRazorpaySignature = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const sign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

    if (expectedSign !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        transactionId: razorpayPaymentId,
        orderStatus: "Processing",
        status: "Processing",
        "payment.status": "Paid",
        "payment.transactionId": razorpayPaymentId,
        "payment.provider": "razorpay",
      },
      { new: true }
    );

    await Payment.findOneAndUpdate(
      { order: orderId, provider: "razorpay" },
      { status: "paid", transactionId: razorpayPaymentId, signature: razorpaySignature }
    );

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= STRIPE: CREATE CHECKOUT SESSION ================= */
exports.createStripeSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe key missing" });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId}`,
      metadata: { orderId },
    });

    await Payment.create({
      order: order._id,
      user: order.user,
      provider: "stripe",
      method: "card",
      amount: order.pricing?.total || 0,
      currency: "USD",
      status: "pending",
      transactionId: session.id,
      raw: session,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
