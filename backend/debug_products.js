const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema, 'products');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mobilesale');
    const products = await Product.find({});
    console.log('PRODUCTS COUNT:', products.length);
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name} | productId: ${p.productId} | _id: ${p._id}`);
    });

    // Check for duplicate productIds
    const ids = products.map(p => p.productId).filter(id => id !== undefined && id !== null);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        console.log("WARNING: Duplicate productIds found!");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
