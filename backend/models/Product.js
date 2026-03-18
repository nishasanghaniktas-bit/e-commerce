const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory'
    },
    peta_subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PetaSubcategory'
    },
    brand: String,
    price: {
      type: Number,
      required: true,
    },
    originalPrice: Number,
    discount: { type: Number, default: 0 },
    stock: {
      type: Number,
      required: true,
    },
    description: String,
    image: {
      type: String,
      required: true,
    },
    images: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    specifications: mongoose.Schema.Types.Mixed,
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSalePrice: Number,
    flashSaleEnd: Date,
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);