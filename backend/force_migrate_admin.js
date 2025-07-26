const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const AdminProfile = require('./models/AdminProfile');
const { convertImageToBase64 } = require('./utils/imageUtils');

require('dotenv').config();

// Force migration script to convert admin profile images to Base64
const forceMigrateAdmin = async () => {
  try {
    console.log('🔄 Force migrating admin profile to Base64...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get Admin Profile
    console.log('\n👤 Getting Admin Profile...');
    let adminProfile = await AdminProfile.findOne();
    
    if (!adminProfile) {
      console.log('❌ No admin profile found');
      return;
    }
    
    console.log('Current profile data:');
    console.log(`  Name: ${adminProfile.firstName} ${adminProfile.lastName}`);
    console.log(`  ImageType: ${adminProfile.imageType || 'undefined'}`);
    console.log(`  ImageUrls: ${adminProfile.imageUrls}`);
    console.log(`  QR Code: ${adminProfile.qrcode}`);
    
    // Force convert images to Base64
    console.log('\n🔄 Converting images to Base64...');
    
    // Convert profile images
    if (adminProfile.imageUrls && adminProfile.imageUrls.length > 0) {
      const imagesBase64 = [];
      for (const imageUrl of adminProfile.imageUrls) {
        console.log(`Processing image: ${imageUrl}`);
        const imagePath = path.join(__dirname, imageUrl);
        console.log(`Full path: ${imagePath}`);
        console.log(`File exists: ${fs.existsSync(imagePath)}`);
        
        if (fs.existsSync(imagePath)) {
          const imageBase64 = convertImageToBase64(imagePath);
          if (imageBase64) {
            imagesBase64.push(imageBase64);
            console.log(`✅ Converted image: ${imageUrl}`);
          } else {
            console.log(`❌ Failed to convert image: ${imageUrl}`);
          }
        } else {
          console.log(`❌ File not found: ${imagePath}`);
        }
      }
      
      if (imagesBase64.length > 0) {
        adminProfile.imagesBase64 = imagesBase64;
        console.log(`✅ Added ${imagesBase64.length} Base64 images`);
      }
    }
    
    // Convert QR code
    if (adminProfile.qrcode) {
      console.log(`Processing QR code: ${adminProfile.qrcode}`);
      const qrcodePath = path.join(__dirname, adminProfile.qrcode);
      console.log(`Full path: ${qrcodePath}`);
      console.log(`File exists: ${fs.existsSync(qrcodePath)}`);
      
      if (fs.existsSync(qrcodePath)) {
        const qrcodeBase64 = convertImageToBase64(qrcodePath);
        if (qrcodeBase64) {
          adminProfile.qrcodeBase64 = qrcodeBase64;
          console.log(`✅ Converted QR code: ${adminProfile.qrcode}`);
        } else {
          console.log(`❌ Failed to convert QR code: ${adminProfile.qrcode}`);
        }
      } else {
        console.log(`❌ QR code file not found: ${qrcodePath}`);
      }
    }
    
    // Set image type to base64
    adminProfile.imageType = 'base64';
    
    // Save the profile
    await adminProfile.save();
    console.log('✅ Admin profile saved with Base64 data');
    
    // Verify the result
    const updatedProfile = await AdminProfile.findOne();
    console.log('\n📋 Updated profile data:');
    console.log(`  ImageType: ${updatedProfile.imageType}`);
    console.log(`  Has imagesBase64: ${!!(updatedProfile.imagesBase64 && updatedProfile.imagesBase64.length > 0)}`);
    console.log(`  Has qrcodeBase64: ${!!updatedProfile.qrcodeBase64}`);
    console.log(`  ImagesBase64 count: ${updatedProfile.imagesBase64 ? updatedProfile.imagesBase64.length : 0}`);
    
    console.log('\n🎉 Force migration completed!');
    
  } catch (error) {
    console.error('❌ Error during force migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  forceMigrateAdmin();
}

module.exports = { forceMigrateAdmin }; 