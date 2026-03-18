const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Refund = require("../models/Refund");

const isEligible = (order) => {
  if (!order.deliveredAt) return false;
  const days = (Date.now() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
  return days <= 7;
};

exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, productId, reason, message } = req.body;
    // If a file was uploaded via multipart/form-data, use its stored filename
    let image = req.body.image;
    if (req.file) {
      // normalize to uploads/<filename> so frontend getImageUrl works
      image = `uploads/${req.file.filename}`;
    }
    if (!orderId || !productId || !reason) {
      return res.status(400).json({ message: "orderId, productId, and reason are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!isEligible(order)) {
      return res.status(400).json({ message: "Return window closed" });
    }

    const exists = await ReturnRequest.findOne({
      orderId,
      productId,
      status: { $in: ["Pending", "Approved"] },
    });
    if (exists) return res.status(400).json({ message: "Return already requested for this item" });

    const payload = await ReturnRequest.create({
      orderId,
      productId,
      userId: req.user._id,
      reason,
      message,
      image,
      logs: [{ action: "requested", status: "Pending", by: req.user._id }],
    });

    order.statusHistory.push({
      status: "returned",
      note: `Return requested for item in order ${order.orderId}`,
      changedAt: new Date(),
    });
    await order.save();

    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReturns = async (req, res) => {
  try {
    const data = await ReturnRequest.find({ userId: req.user._id })
      .populate("productId", "name image")
      .populate("orderId", "orderId status deliveredAt")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminListReturns = async (_req, res) => {
  try {
    const data = await ReturnRequest.find()
      .sort({ createdAt: -1 })
      .populate("orderId", "orderId status user")
      .populate("userId", "name email")
      .populate("productId", "name image");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminUpdateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const allowed = ["Approved", "Rejected"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const request = await ReturnRequest.findById(id).populate("orderId");
    if (!request) return res.status(404).json({ message: "Return not found" });

    request.status = status;
    request.logs.push({ action: "status_update", status, note, by: req.user._id, at: new Date() });
    await request.save();

    const order = await Order.findById(request.orderId);
    if (order && status === "Approved") {
      // Mark item as returned
      const item = order.items.find(it => it.product.toString() === request.productId.toString());
      if (item) item.status = "returned";

      // If all items are returned, we could mark overall order as returned, 
      // but the user requirement just said "mark order item as 'Returned'"
      order.statusHistory.push({ status: "Approved", note: `Return Approved (Item ${request.productId}): ${note}`, changedAt: new Date() });
      await order.save();

      const itemPrice = item?.price || 0;
      
      await Refund.create({
        returnRequest: request._id,
        order: order._id,
        user: request.userId,
        amount: itemPrice,
        status: "Completed",
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
