const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const lowStock = await Product.countDocuments({
      stock: { $lt: 10 },
    });

    const totalUsers = await User.countDocuments({ role: "user" });

    const totalOrders = await Order.countDocuments();

    const activeOrders = await Order.countDocuments({
      status: { $in: ["pending", "processing", "shipped", "out_for_delivery"] },
    });

    // revenue
    const revenueData = await Order.aggregate([
      { $match: { status: "delivered" } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { 
            $sum: { $ifNull: ["$pricing.total", "$total"] } 
          } 
        } 
      },
    ]);

    const revenue = revenueData[0]?.totalRevenue || 0;

    // Recent orders (latest 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    res.json({
      totalProducts,
      lowStock,
      totalUsers,
      totalOrders,
      activeOrders,
      revenue,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const userRoleOnly = users.filter((u) => u.role === "user");
    const total = userRoleOnly.length;
    const active = userRoleOnly.filter((u) => u.status === "active").length;
    const inactive = userRoleOnly.filter((u) => u.status === "inactive").length;
    const loggedIn = userRoleOnly.filter((u) => u.isLoggedIn).length;

    res.json({
      total,
      active,
      inactive,
      loggedIn,
      users,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};
