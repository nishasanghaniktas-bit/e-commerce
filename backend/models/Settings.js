const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: "MobileSale" },
  siteEmail: String,
  sitePhone: String,
  shippingCharge: { type: Number, default: 0 },
  freeShippingAbove: { type: Number, default: 500 },
  taxRate: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  paymentGateways: {
    razorpay: { enabled: Boolean, keyId: String, keySecret: String },
    stripe: { enabled: Boolean, publicKey: String, secretKey: String },
    paypal: { enabled: Boolean, clientId: String, clientSecret: String },
    cod: { enabled: { type: Boolean, default: true } }
  },
  emailSettings: {
    host: String,
    port: Number,
    user: String,
    password: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
