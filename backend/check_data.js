const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

require('dotenv').config();

const checkData = async () => {
  try {
    console.log('🔍 Checking database data...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Check Categories
    console.log('\n📁 Checking Categories...');
    const categories = await Category.find();
    console.log(`Total categories: ${categories.length}`);
    
    categories.forEach((category, index) => {
      console.log(`\nCategory ${index + 1}:`);
      console.log(`  Name: ${category.name}`);
      console.log(`  ImageType: ${category.imageType || 'undefined'}`);
      console.log(`  Has imageUrl: ${!!category.imageUrl}`);
      console.log(`  Has imageBase64: ${!!category.imageBase64}`);
      console.log(`  ImageUrl: ${category.imageUrl}`);
    });
    
    // Check Products
    console.log('\n📦 Checking Products...');
    const products = await Product.find();
    console.log(`Total products: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}:`);
      console.log(`  Name: ${product.nameproduct}`);
      console.log(`  ImageType: ${product.imageType || 'undefined'}`);
      console.log(`  Has images: ${!!(product.images && product.images.length > 0)}`);
      console.log(`  Has imagesBase64: ${!!(product.imagesBase64 && product.imagesBase64.length > 0)}`);
      console.log(`  Images count: ${product.images ? product.images.length : 0}`);
      console.log(`  ImagesBase64 count: ${product.imagesBase64 ? product.imagesBase64.length : 0}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run check if this script is executed directly
if (require.main === module) {
  checkData();
}

module.exports = { checkData }; 