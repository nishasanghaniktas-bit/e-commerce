const Product = require("../models/Product");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Notification = require("../models/Notification");

/* ================= ADD PRODUCT ================= */
exports.addProduct = async (req, res) => {
  try {
    const files = req.files || {};
    const galleryUploads = (files.images || []).map((f) => f.path.replace(/\\/g, "/"));

    let bodyImages = [];
    if (Array.isArray(req.body.images)) {
      bodyImages = req.body.images;
    } else if (typeof req.body.images === "string" && req.body.images.trim().length) {
      bodyImages = req.body.images.split(",").map((i) => i.trim());
    }

    const payload = {
      productId: req.body.productId || Date.now(),
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      discount: req.body.discount,
      stock: req.body.stock,
      description: req.body.description,
      image:
        req.body.image ||
        files.image?.[0]?.path?.replace(/\\/g, "/") ||
        galleryUploads[0],
      images: [...bodyImages, ...galleryUploads].filter(Boolean),
      specifications: typeof req.body.specifications === 'string' ? JSON.parse(req.body.specifications) : req.body.specifications,
      tags: req.body.tags,
      isFeatured: req.body.isFeatured,
      isFlashSale: req.body.isFlashSale,
      flashSalePrice: req.body.flashSalePrice,
      flashSaleEnd: req.body.flashSaleEnd,
    };

    console.log("Creating product with payload:", payload);
    const product = await Product.create(payload);

    try {
      const note = await Notification.create({
        title: "New Product Added",
        message: `${product.name} is now live`,
        type: "product",
        meta: { productId: product._id },
      });
      // emit to admins and broadcast
      const { emitToAdmins, getIo } = require("../utils/socket");
      emitToAdmins("notification", note);
      const io = getIo();
      if (io) io.emit("notification", note);
    } catch (e) {
      console.error("Product notification error:", e.message);
    }

    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    console.error("addProduct Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PRODUCTS (WITH FILTERS) ================= */
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = "newest",
      search,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (rating) filter.rating = { $gte: Number(rating) };
    if (search) filter.name = { $regex: search, $options: "i" };

    const sortMap = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { rating: -1 },
      popular: { views: -1 },
      newest: { createdAt: -1 },
    };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = sortMap[sort] || sortMap.newest;
    
    console.log("Fetching products with filter:", JSON.stringify(filter));

    // allow category passed as id or name
    if (category) {
      if (/^[0-9a-fA-F]{24}$/.test(category)) filter.category = category;
      else {
        const cat = await Category.findOne({ name: category });
        if (cat) filter.category = cat._id;
      }
    }
    if (req.query.subcategory) {
      const sc = req.query.subcategory;
      if (/^[0-9a-fA-F]{24}$/.test(sc)) filter.subcategory = sc;
      else {
        const s = await Subcategory.findOne({ name: sc });
        if (s) filter.subcategory = s._id;
      }
    }
    if (req.query.peta_subcategory) {
      const ps = req.query.peta_subcategory;
      if (/^[0-9a-fA-F]{24}$/.test(ps)) filter.peta_subcategory = ps;
      else {
        const p = await require('../models/PetaSubcategory').findOne({ name: ps });
        if (p) filter.peta_subcategory = p._id;
      }
    }

    const products = await Product.find(filter)
      .populate('category')
      .populate('subcategory')
      .populate('peta_subcategory')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
      
    const total = await Product.countDocuments(filter);

    res.json({
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getProducts Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= SINGLE PRODUCT ================= */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!require("mongoose").Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(id).populate('category').populate('subcategory').populate('peta_subcategory');
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.views = (product.views || 0) + 1;
    await product.save();

    const related = await Product.find({ category: product.category._id || product.category, _id: { $ne: product._id } }).limit(6).populate('category').populate('subcategory').populate('peta_subcategory');

    res.json({ product, related });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    const files = req.files || {};
    const galleryUploads = (files.images || []).map((f) => f.path.replace(/\\/g, "/"));

    let bodyImages = [];
    if (Array.isArray(req.body.images)) {
      bodyImages = req.body.images;
    } else if (typeof req.body.images === "string" && req.body.images.trim().length) {
      bodyImages = req.body.images.split(",").map((i) => i.trim());
    }

    const update = {
      ...req.body,
      image:
        req.body.image ||
        files.image?.[0]?.path?.replace(/\\/g, "/") ||
        galleryUploads[0],
    };

    if (req.body.specifications && typeof req.body.specifications === 'string') {
      try {
        update.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        console.error("Failed to parse specifications:", e);
      }
    }

    if (bodyImages.length || galleryUploads.length) {
      update.images = [...bodyImages, ...galleryUploads].filter(Boolean);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: "after" }
    ).populate('category').populate('subcategory').populate('peta_subcategory');

    if (!product) return res.status(404).json({ message: "Product not found" });

    try {
      const note = await Notification.create({
        title: "Product Updated",
        message: `${product.name} was updated by admin`,
        type: "product",
        meta: { productId: product._id }
      });
      const { emitToAdmins, getIo } = require("../utils/socket");
      emitToAdmins("notification", note);
      const io = getIo();
      if (io) io.emit("notification", note);
    } catch (e) {
      console.error("Product update notification error:", e.message);
    }

    res.json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DEDUCT STOCK (UTILITY) ================= */
exports.deductStock = async (productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return false;
    if (product.stock < quantity) return false;

    product.stock -= quantity;
    await product.save();
    try {
      if (product.stock <= 10) {
        const note = await Notification.create({
          title: "Low Stock Alert",
          message: `${product.name} stock is low (${product.stock})`,
          type: "product",
          meta: { productId: product._id, stock: product.stock }
        });
        const { emitToAdmins } = require("../utils/socket");
        emitToAdmins("notification", note);
      }
    } catch (e) {
      console.error("Low stock notification error:", e.message);
    }
    return true;
  } catch (error) {
    console.log("Stock deduction error:", error);
    return false;
  }
};
