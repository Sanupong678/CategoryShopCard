const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const AdminProfile = require('./models/AdminProfile');
const { convertImageToBase64 } = require('./utils/imageUtils');

require('dotenv').config();

// Migration script to convert admin profile images to Base64
const migrateAdminProfile = async () => {
  try {
    console.log('🔄 Starting admin profile migration to Base64...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Migrate Admin Profile
    console.log('\n👤 Migrating Admin Profile...');
    const adminProfile = await AdminProfile.findOne();
    
    if (adminProfile) {
      let hasChanges = false;
      
      // Migrate profile images
      if (adminProfile.imageUrls && adminProfile.imageUrls.length > 0) {
        const imagesBase64 = [];
        for (const imageUrl of adminProfile.imageUrls) {
          const imagePath = path.join(__dirname, imageUrl);
          if (fs.existsSync(imagePath)) {
            const imageBase64 = convertImageToBase64(imagePath);
            if (imageBase64) {
              imagesBase64.push(imageBase64);
              hasChanges = true;
              console.log(`✅ Migrated profile image: ${imageUrl}`);
            }
          } else {
            console.log(`❌ Missing profile image: ${imageUrl}`);
          }
        }
        
        if (imagesBase64.length > 0) {
          adminProfile.imagesBase64 = imagesBase64;
        }
      }
      
      // Migrate QR code
      if (adminProfile.qrcode) {
        const qrcodePath = path.join(__dirname, adminProfile.qrcode);
        if (fs.existsSync(qrcodePath)) {
          const qrcodeBase64 = convertImageToBase64(qrcodePath);
          if (qrcodeBase64) {
            adminProfile.qrcodeBase64 = qrcodeBase64;
            hasChanges = true;
            console.log(`✅ Migrated QR code: ${adminProfile.qrcode}`);
          }
        } else {
          console.log(`❌ Missing QR code: ${adminProfile.qrcode}`);
        }
      }
      
      if (hasChanges) {
        adminProfile.imageType = 'base64';
        await adminProfile.save();
        console.log('✅ Admin profile migration completed');
      } else {
        console.log('ℹ️ No changes needed for admin profile');
      }
    } else {
      console.log('❌ No admin profile found');
    }
    
    console.log('\n🎉 Admin profile migration completed!');
    
  } catch (error) {
    console.error('❌ Error during admin profile migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateAdminProfile();
}

module.exports = { migrateAdminProfile }; 