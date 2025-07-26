const mongoose = require('mongoose');
const AdminProfile = require('./models/AdminProfile');

require('dotenv').config();

const checkAdminProfileDetailed = async () => {
  try {
    console.log('🔍 Checking Admin Profile (Detailed)...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Check Admin Profile
    const adminProfile = await AdminProfile.findOne();
    if (adminProfile) {
      console.log('\n👤 Admin Profile (Raw Data):');
      console.log(`  Name: ${adminProfile.firstName} ${adminProfile.lastName}`);
      console.log(`  ImageType: ${adminProfile.imageType || 'undefined'}`);
      console.log(`  Has imageUrls: ${!!(adminProfile.imageUrls && adminProfile.imageUrls.length > 0)}`);
      console.log(`  Has imagesBase64: ${!!(adminProfile.imagesBase64 && adminProfile.imagesBase64.length > 0)}`);
      console.log(`  Has qrcode: ${!!adminProfile.qrcode}`);
      console.log(`  Has qrcodeBase64: ${!!adminProfile.qrcodeBase64}`);
      console.log(`  ImageUrls: ${adminProfile.imageUrls}`);
      console.log(`  QR Code: ${adminProfile.qrcode}`);
      console.log(`  ImagesBase64 length: ${adminProfile.imagesBase64 ? adminProfile.imagesBase64.length : 0}`);
      console.log(`  QRCodeBase64 exists: ${!!adminProfile.qrcodeBase64}`);
      
      // Test virtual fields
      const profileObj = adminProfile.toObject();
      console.log('\n📋 Virtual Fields:');
      console.log(`  displayImages: ${profileObj.displayImages ? profileObj.displayImages.length : 0}`);
      console.log(`  displayQrcode: ${!!profileObj.displayQrcode}`);
      
    } else {
      console.log('\n❌ No admin profile found');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin profile:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run check if this script is executed directly
if (require.main === module) {
  checkAdminProfileDetailed();
}

module.exports = { checkAdminProfileDetailed }; 