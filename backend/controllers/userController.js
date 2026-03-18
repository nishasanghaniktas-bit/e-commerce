const User = require("../models/User");
const Order = require("../models/Order");

/* ================= GET ALL USERS (ONLY USERS, NOT ADMINS) ================= */
exports.getAllUsers = async (req, res) => {
  try {
    // Filter only users with role "user", exclude admins
    const users = await User.find({ role: "user" }).select("-password");

    const usersWithOrders = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({
          user: u._id
        });

        return {
          _id: u._id,
          userId: u.userId,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          isLoggedIn: u.isLoggedIn,
          joined: u.createdAt,
          orders: orderCount
        };
      })
    );

    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const inactive = users.filter(u => u.status === "inactive").length;
    const loggedIn = users.filter(u => u.isLoggedIn).length;

    res.json({
      total,
      active,
      inactive,
      loggedIn,
      users: usersWithOrders
    });

  } catch (err) {
    console.log("Get Users Error:", err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

/* ================= EXPORT USERS TO EXCEL ================= */
exports.exportUsersToExcel = async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    
    // Get all users with order counts
    const users = await User.find({ role: "user" }).select("-password");

    const usersWithOrders = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({
          user: u._id
        });

        return {
          name: u.name,
          email: u.email,
          phone: u.phone,
          status: u.status,
          joined: new Date(u.createdAt).toLocaleDateString(),
          orders: orderCount
        };
      })
    );

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Joined Date", key: "joined", width: 15 },
      { header: "Total Orders", key: "orders", width: 12 }
    ];

    // Add data
    usersWithOrders.forEach(user => {
      worksheet.addRow(user);
    });

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=users_report.xlsx");
    res.send(buffer);

  } catch (err) {
    console.log("Export Error:", err);
    res.status(500).json({
      message: "Failed to export users"
    });
  }
};

/* ================= TOGGLE ACTIVE / INACTIVE ================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const newStatus = user.status === "active" ? "inactive" : "active";
    user.status = newStatus;
    await user.save();

    res.json({
      message: "Status updated",
      status: newStatus
    });

  } catch (error) {
    console.log("Toggle Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

/* ================= DASHBOARD ================= */
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User missing"
      });
    }

    const orders = await Order.find({
      user: req.user._id
    });

    res.json({
      totalOrders: orders.length,
      activeOrders: orders.filter((o) =>
        ["pending", "processing", "shipped", "out_for_delivery"].includes(
          (o.orderStatus || o.status)?.toLowerCase()
        )
      ).length,
      deliveredOrders: orders.filter((o) => (o.orderStatus || o.status)?.toLowerCase() === "delivered")
        .length,
    });

  } catch (error) {
    console.log("Dashboard Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

/* ================= GET PROFILE ================= */
exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Profile Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.file) {
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user
    });

  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

/* ================= UPDATE USER STATUS ================= */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: "Server Error"
    });
  }
};
