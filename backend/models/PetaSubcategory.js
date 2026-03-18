const mongoose = require('mongoose');

const petaSubcategorySchema = new mongoose.Schema({
  subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  name: { type: String, required: true },
  slug: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PetaSubcategory', petaSubcategorySchema);
