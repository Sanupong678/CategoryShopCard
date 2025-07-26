const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('./models/Category');
const Product = require('./models/Product');
const AdminProfile = require('./models/AdminProfile');
const Banner = require('./models/Banner');

require('dotenv').config();

// Helper function to check if image file exists
const checkImageExists = (imageUrl) => {
  if (!imageUrl) return false;
  const imagePath = path.join(__dirname, imageUrl);
  return fs.existsSync(imagePath);
};

// Cleanup missing images from database
const cleanupMissingImages = async () => {
  try {
    console.log('🔍 Starting cleanup of missing images...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Cleanup Categories
    console.log('\n📁 Cleaning up Categories...');
    const categories = await Category.find();
    let categoryUpdates = 0;
    
    for (const category of categories) {
      if (category.imageUrl && !checkImageExists(category.imageUrl)) {
        console.log(`❌ Missing image for category "${category.name}": ${category.imageUrl}`);
        category.imageUrl = null;
        await category.save();
        categoryUpdates++;
      }
    }
    console.log(`✅ Updated ${categoryUpdates} categories`);
    
    // Cleanup Products
    console.log('\n📦 Cleaning up Products...');
    const products = await Product.find();
    let productUpdates = 0;
    
    for (const product of products) {
      let hasChanges = false;
      if (product.images && Array.isArray(product.images)) {
        const validImages = product.images.filter(imageUrl => {
          const exists = checkImageExists(imageUrl);
          if (!exists) {
            console.log(`❌ Missing image for product "${product.nameproduct}": ${imageUrl}`);
          }
          return exists;
        });
        
        if (validImages.length !== product.images.length) {
          product.images = validImages;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        await product.save();
        productUpdates++;
      }
    }
    console.log(`✅ Updated ${productUpdates} products`);
    
    // Cleanup Admin Profile
    console.log('\n👤 Cleaning up Admin Profile...');
    const adminProfile = await AdminProfile.findOne();
    if (adminProfile) {
      let hasChanges = false;
      
      if (adminProfile.imageUrls && Array.isArray(adminProfile.imageUrls)) {
        const validImages = adminProfile.imageUrls.filter(imageUrl => {
          const exists = checkImageExists(imageUrl);
          if (!exists) {
            console.log(`❌ Missing admin profile image: ${imageUrl}`);
          }
          return exists;
        });
        
        if (validImages.length !== adminProfile.imageUrls.length) {
          adminProfile.imageUrls = validImages;
          hasChanges = true;
        }
      }
      
      if (adminProfile.qrcode && !checkImageExists(adminProfile.qrcode)) {
        console.log(`❌ Missing admin profile QR code: ${adminProfile.qrcode}`);
        adminProfile.qrcode = null;
        hasChanges = true;
      }
      
      if (hasChanges) {
        await adminProfile.save();
        console.log('✅ Updated admin profile');
      }
    }
    
    // Cleanup Banners
    console.log('\n🖼️ Cleaning up Banners...');
    const banners = await Banner.find();
    let bannerUpdates = 0;
    
    for (const banner of banners) {
      if (banner.imageUrl && !checkImageExists(banner.imageUrl)) {
        console.log(`❌ Missing banner image: ${banner.imageUrl}`);
        banner.imageUrl = null;
        await banner.save();
        bannerUpdates++;
      }
    }
    console.log(`✅ Updated ${bannerUpdates} banners`);
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories updated: ${categoryUpdates}`);
    console.log(`   - Products updated: ${productUpdates}`);
    console.log(`   - Banners updated: ${bannerUpdates}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupMissingImages();
}

module.exports = { cleanupMissingImages }; 