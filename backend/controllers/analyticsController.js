const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } }
    ]);

    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const totalUsers = await User.countDocuments({ role: "user" });
    const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });

    const recentOrders = await Order.find().sort("-createdAt").limit(10).populate("user", "name email");

    const salesByMonth = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalSales: totalSales[0]?.total || 0,
      todayOrders,
      totalUsers,
      lowStock,
      recentOrders,
      salesByMonth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: { $ne: "cancelled" } };
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Order.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBestSelling = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" }
    ]);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
