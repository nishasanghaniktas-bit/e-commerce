const Subcategory = require('../models/Subcategory');
const PetaSubcategory = require('../models/PetaSubcategory');

exports.getPetaBySubcategory = async (req, res) => {
  try {
    const petas = await PetaSubcategory.find({ subcategory_id: req.params.id });
    res.json(petas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSubcategory = async (req, res) => {
  try {
    const { name, category_id, petas } = req.body;
    const sub = await Subcategory.create({ name, category_id });
    if (Array.isArray(petas) && petas.length) {
      const toCreate = petas.filter(Boolean).map(n => ({ name: n, subcategory_id: sub._id }));
      await PetaSubcategory.insertMany(toCreate);
    }
    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
