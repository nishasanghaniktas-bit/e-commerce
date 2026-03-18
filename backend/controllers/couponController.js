const Coupon = require("../models/Coupon");
const buildCouponResponse = (coupon, amount) => {
  const usageLeft = coupon.usageLimit ? Math.max(coupon.usageLimit - (coupon.usedCount || 0), 0) : null;
  let discount = 0;
  if (typeof amount === "number") {
    discount = coupon.discountType === "percentage" ? (amount * coupon.discount) / 100 : coupon.discount;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  }
  return {
    _id: coupon._id,
    code: coupon.code,
    discount: coupon.discount,
    discountType: coupon.discountType,
    maxDiscount: coupon.maxDiscount,
    minPurchase: coupon.minPurchase,
    expiryDate: coupon.expiryDate,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    usageLeft,
    isActive: coupon.isActive,
    calculatedDiscount: discount,
  };
};

const validateAgainstAmount = (coupon, amount) => {
  if (!coupon || !coupon.isActive) return { ok: false, message: "Invalid coupon" };
  if (coupon.expiryDate && coupon.expiryDate < new Date()) return { ok: false, message: "Coupon expired" };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { ok: false, message: "Coupon usage limit reached" };
  if (coupon.minPurchase && amount < coupon.minPurchase) return { ok: false, message: `Minimum purchase of ${coupon.minPurchase} required` };

  let discount = coupon.discountType === "percentage" ? (amount * coupon.discount) / 100 : coupon.discount;
  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  return { ok: true, discount, code: coupon.code };
};

exports.getCoupons = async (req, res) => {
  try {
    const amount = req.query.amount ? Number(req.query.amount) : null;
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
    }).sort({ createdAt: -1 });

    const filtered = coupons
      .filter((c) => {
        if (c.usageLimit && c.usedCount >= c.usageLimit) return false;
        if (typeof amount === "number" && c.minPurchase && amount < c.minPurchase) return false;
        return true;
      })
      .map((c) => buildCouponResponse(c, amount));

    if (typeof amount === "number" && !isNaN(amount)) {
      return res.json({ coupons: filtered, count: filtered.length });
    }

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    const result = validateAgainstAmount(coupon, Number(amount));
    if (!result.ok) {
      return res.status(400).json({ message: result.message || "Invalid coupon" });
    }
    res.json({
      code: coupon.code,
      discount: result.discount,
      discountType: coupon.discountType,
      maxDiscount: coupon.maxDiscount,
      minPurchase: coupon.minPurchase,
      appliedOn: Number(amount) || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// helper for other controllers
exports.validateAgainstAmount = validateAgainstAmount;
exports.buildCouponResponse = buildCouponResponse;
