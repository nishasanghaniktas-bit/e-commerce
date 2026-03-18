require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Connect to DB
connectDB();

const app = express();

// Disable ETag caching
app.set("etag", false);

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow static assets to be embedded cross-origin
    crossOriginEmbedderPolicy: false, // avoid blocking images/files on different origin (frontend dev port)
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/order", require("./routes/orderRoutes")); // Alias
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes")); // Alias
app.use("/api/returns", require("./routes/returnRoutes"));
app.use("/api/return", require("./routes/returnRoutes")); // Alias


// Users & admin
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

// Static uploads (add CORP header explicitly)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static("uploads")
);

// Server (with Socket.IO)
const PORT = process.env.PORT || 5000;
const http = require("http");
const server = http.createServer(app);

// initialize socket helper
const { init } = require("./utils/socket");
init(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
