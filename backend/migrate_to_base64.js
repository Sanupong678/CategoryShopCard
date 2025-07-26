const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('./models/Category');
const Product = require('./models/Product');
const { convertImageToBase64 } = require('./utils/imageUtils');

require('dotenv').config();

// Migration script to convert existing images to Base64
const migrateToBase64 = async () => {
  try {
    console.log('🔄 Starting migration to Base64...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Migrate Categories
    console.log('\n📁 Migrating Categories...');
    const categories = await Category.find({ 
      $or: [
        { imageType: { $ne: 'base64' } },
        { imageType: { $exists: false } }
      ]
    });
    let categoryUpdates = 0;
    
    for (const category of categories) {
      if (category.imageUrl) {
        const imagePath = path.join(__dirname, category.imageUrl);
        if (fs.existsSync(imagePath)) {
          const imageBase64 = convertImageToBase64(imagePath);
          if (imageBase64) {
            category.imageBase64 = imageBase64;
            category.imageType = 'base64';
            await category.save();
            categoryUpdates++;
            console.log(`✅ Migrated category: ${category.name}`);
          }
        } else {
          console.log(`❌ Missing image for category: ${category.name}`);
        }
      }
    }
    console.log(`✅ Migrated ${categoryUpdates} categories`);
    
    // Migrate Products
    console.log('\n📦 Migrating Products...');
    const products = await Product.find({ 
      $or: [
        { imageType: { $ne: 'base64' } },
        { imageType: { $exists: false } }
      ]
    });
    let productUpdates = 0;
    
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const imagesBase64 = [];
        let hasValidImages = false;
        
        for (const imageUrl of product.images) {
          const imagePath = path.join(__dirname, imageUrl);
          if (fs.existsSync(imagePath)) {
            const imageBase64 = convertImageToBase64(imagePath);
            if (imageBase64) {
              imagesBase64.push(imageBase64);
              hasValidImages = true;
            }
          }
        }
        
        if (hasValidImages) {
          product.imagesBase64 = imagesBase64;
          product.imageType = 'base64';
          await product.save();
          productUpdates++;
          console.log(`✅ Migrated product: ${product.nameproduct}`);
        }
      }
    }
    console.log(`✅ Migrated ${productUpdates} products`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories migrated: ${categoryUpdates}`);
    console.log(`   - Products migrated: ${productUpdates}`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToBase64();
}

module.exports = { migrateToBase64 }; 