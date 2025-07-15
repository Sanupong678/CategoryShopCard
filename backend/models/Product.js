const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameproduct: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs for multiple images
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema); 