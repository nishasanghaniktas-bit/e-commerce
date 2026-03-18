const Notification = require("../models/Notification");

const { emitToUser, emitToAdmins, getIo } = require("../utils/socket");

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type = "system", userId = null, recipients = [], meta = {}, link, isGlobal = false } = req.body;
    const note = await Notification.create({ title, message, type, userId, recipients, meta, link, isGlobal });

    // emit via socket.io
    try {
      if (isGlobal) {
        // Broadcast to admins and (optionally) all connected clients
        emitToAdmins("notification", note);
        const io = getIo();
        if (io) io.emit("notification", note);
      } else if (userId) {
        emitToUser(userId, "notification", note);
      } else if (Array.isArray(recipients) && recipients.length) {
        recipients.forEach((r) => emitToUser(r, "notification", note));
      } else {
        // fallback: emit to admins
        emitToAdmins("notification", note);
      }
    } catch (e) {
      console.error("Socket emit error:", e.message || e);
    }

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dev-only: create and broadcast a global notification (no auth) -- only when not in production
exports.createDevNotification = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed' });
    const { title = 'Dev Notification', message = 'This is a test notification', type = 'system' } = req.body;
    const note = await Notification.create({ title, message, type, isGlobal: true });
    try {
      emitToAdmins('notification', note);
      const io = getIo();
      if (io) io.emit('notification', note);
    } catch (e) {
      console.error('Dev emit error', e.message || e);
    }
    res.json({ ok: true, note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // pagination
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(10, Math.min(100, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const filter = { $or: [{ userId }, { recipients: userId }, { isGlobal: true }] };
    const total = await Notification.countDocuments(filter);
    const notes = await Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.json({ notifications: notes, page, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!note) return res.status(404).json({ message: "Notification not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    await Notification.updateMany({ $or: [{ userId }, { recipients: userId }, { isGlobal: true }], isRead: false }, { isRead: true });
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminListAll = async (req, res) => {
  try {
    const notes = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    // If admin, include global notifications
    let filter;
    if (req.user && req.user.role === "admin") {
      filter = { $or: [{ userId }, { recipients: userId }, { isGlobal: true }], isRead: false };
    } else {
      // users should also see global unread (match list endpoint)
      filter = { $or: [{ userId }, { recipients: userId }, { isGlobal: true }], isRead: false };
    }
    const count = await Notification.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const id = req.params.id;
    const note = await Notification.findById(id);
    if (!note) return res.status(404).json({ message: "Notification not found" });

    // allow owner or admin to delete
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (note.userId && note.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Notification.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper to programmatically create a notification (not an express handler)
exports.createNotificationInternal = async ({ userId = null, title, message, type = "system", recipients = [], meta = {}, link }) => {
  try {
    return await Notification.create({ title, message, type, userId, recipients, meta, link });
  } catch (err) {
    console.error("Notification internal create error:", err.message || err);
    return null;
  }
};
