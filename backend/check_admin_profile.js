const mongoose = require('mongoose');
const AdminProfile = require('./models/AdminProfile');

require('dotenv').config();

const checkAdminProfile = async () => {
  try {
    console.log('🔍 Checking Admin Profile...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Check Admin Profile
    const adminProfile = await AdminProfile.findOne();
    if (adminProfile) {
      console.log('\n👤 Admin Profile:');
      console.log(`  Name: ${adminProfile.firstName} ${adminProfile.lastName}`);
      console.log(`  Has imageUrls: ${!!(adminProfile.imageUrls && adminProfile.imageUrls.length > 0)}`);
      console.log(`  Has qrcode: ${!!adminProfile.qrcode}`);
      console.log(`  ImageUrls: ${adminProfile.imageUrls}`);
      console.log(`  QR Code: ${adminProfile.qrcode}`);
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
  checkAdminProfile();
}

module.exports = { checkAdminProfile }; 