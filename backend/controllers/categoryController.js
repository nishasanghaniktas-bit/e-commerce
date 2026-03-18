const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const PetaSubcategory = require("../models/PetaSubcategory");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { subcategories, ...rest } = req.body;
    const category = await Category.create(rest);

    if (Array.isArray(subcategories) && subcategories.length) {
      // support both simple string names and objects { name, petas: [] }
      const subsToCreate = [];
      const petasToCreate = [];
      for (const s of subcategories) {
        if (!s) continue;
        if (typeof s === 'string') {
          subsToCreate.push({ name: s, category_id: category._id });
        } else {
          subsToCreate.push({ name: s.name, category_id: category._id });
        }
      }

      const createdSubs = await Subcategory.insertMany(subsToCreate);

      // create peta subcategories if provided
      for (let i = 0; i < subcategories.length; i++) {
        const s = subcategories[i];
        if (s && typeof s === 'object' && Array.isArray(s.petas) && s.petas.length) {
          const created = createdSubs.shift();
          if (!created) continue;
          for (const p of s.petas) {
            if (!p) continue;
            petasToCreate.push({ name: p, subcategory_id: created._id });
          }
        }
      }
      if (petasToCreate.length) await PetaSubcategory.insertMany(petasToCreate);
    }

    const created = await Category.findById(category._id);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { subcategories, ...rest } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, rest, { new: true });

    if (Array.isArray(subcategories)) {
      // sync: remove existing subcategories and peta children, then recreate
      const existingSubs = await Subcategory.find({ category_id: req.params.id });
      const existingIds = existingSubs.map(s => s._id);
      if (existingIds.length) await PetaSubcategory.deleteMany({ subcategory_id: { $in: existingIds } });
      await Subcategory.deleteMany({ category_id: req.params.id });

      const subsToCreate = [];
      const petasToCreate = [];
      for (const s of subcategories) {
        if (!s) continue;
        if (typeof s === 'string') subsToCreate.push({ name: s, category_id: req.params.id });
        else subsToCreate.push({ name: s.name, category_id: req.params.id });
      }
      const createdSubs = await Subcategory.insertMany(subsToCreate);
      for (let i = 0; i < subcategories.length; i++) {
        const s = subcategories[i];
        if (s && typeof s === 'object' && Array.isArray(s.petas) && s.petas.length) {
          const created = createdSubs.shift();
          if (!created) continue;
          for (const p of s.petas) {
            if (!p) continue;
            petasToCreate.push({ name: p, subcategory_id: created._id });
          }
        }
      }
      if (petasToCreate.length) await PetaSubcategory.insertMany(petasToCreate);
    }

    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const subs = await Subcategory.find({ category_id: req.params.id });
    const subIds = subs.map(s => s._id);
    const petas = await PetaSubcategory.find({ subcategory_id: { $in: subIds } });

    // attach petas to their parent subcategory
    const subsWithPetas = subs.map(s => ({
      _id: s._id,
      name: s.name,
      slug: s.slug,
      category_id: s.category_id,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      petas: petas.filter(p => String(p.subcategory_id) === String(s._id))
    }));

    res.json(subsWithPetas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
