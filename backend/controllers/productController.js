const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to check if image file exists
const checkImageExists = (imageUrl) => {
  if (!imageUrl) return false;
  const imagePath = path.join(__dirname, '..', imageUrl);
  return fs.existsSync(imagePath);
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, jpg, png, gif)'));
    }
  }
});

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.nameproduct = { $regex: search, $options: 'i' }; // filter by nameproduct (case-insensitive)
    }
    const products = await Product.find(filter).populate('category', 'name');
    
    // Check and fix missing images
    const productsWithValidImages = products.map(product => {
      const productObj = product.toObject();
      if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images.filter(imageUrl => {
          const exists = checkImageExists(imageUrl);
          if (!exists) {
            console.log(`[${new Date().toISOString()}] Missing product image: ${imageUrl}`);
          }
          return exists;
        });
      }
      return productObj;
    });
    
    res.json(productsWithValidImages);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าทั้งหมด' });
  }
};

// GET products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
};

// GET single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
};

// POST create new product
const createProduct = async (req, res) => {
  try {
    const { nameproduct, price, category, subcategory, description, phone } = req.body;
    
    // Get uploaded image files
    const imageUrls = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    const product = new Product({
      nameproduct,
      price: parseFloat(price),
      category,
      subcategory,
      description,
      phone,
      images: imageUrls
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างสินค้า' });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  try {
    const { nameproduct, price, category, subcategory, description, phone } = req.body;
    
    // Get uploaded image files
    const newImageUrls = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    const updateData = {
      nameproduct,
      price: parseFloat(price),
      category,
      subcategory,
      description,
      phone
    };
    
    // If new images are uploaded, replace the images array
    if (newImageUrls.length > 0) {
      updateData.images = newImageUrls;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า' });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    
    // Delete associated images from filesystem
    if (product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
};

module.exports = { 
  getAllProducts,
  getProductsByCategory, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload
}; 