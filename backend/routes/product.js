const express = require('express');
const router = express.Router();
const { 
  getAllProducts,
  getProductsByCategory, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload
} = require('../controllers/productController');

// GET all products
router.get('/', getAllProducts);

// GET products by category
router.get('/by-category', getProductsByCategory);

// GET single product by ID
router.get('/:id', getProductById);

// POST create new product (with multiple image uploads)
router.post('/', upload.array('images', 10), createProduct);

// PUT update product (with multiple image uploads)
router.put('/:id', upload.array('images', 10), updateProduct);

// DELETE product
router.delete('/:id', deleteProduct);

module.exports = router; 