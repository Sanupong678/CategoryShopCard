const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { convertImageToBase64 } = require('./utils/imageUtils');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/categoryshopcard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Banner = require('./models/Banner');

async function migrateBanner() {
  try {
    console.log('Starting Banner migration...');
    
    // Find banners that haven't been migrated yet
    const banners = await Banner.find({
      $or: [
        { imageType: { $ne: 'base64' } },
        { imageType: { $exists: false } }
      ]
    });
    
    console.log(`Found ${banners.length} banners to migrate`);
    
    let migratedCount = 0;
    
    for (const banner of banners) {
      if (banner.imageUrl && banner.imageUrl.trim()) {
        try {
          const imagePath = path.join(__dirname, banner.imageUrl);
          
          if (fs.existsSync(imagePath)) {
            const imageBase64 = convertImageToBase64(imagePath);
            
            if (imageBase64) {
              banner.imageBase64 = imageBase64;
              banner.imageType = 'base64';
              await banner.save();
              migratedCount++;
              console.log(`Migrated banner: ${banner._id}`);
            } else {
              console.log(`Failed to convert image for banner: ${banner._id}`);
            }
          } else {
            console.log(`Image file not found for banner: ${banner._id}, path: ${imagePath}`);
          }
        } catch (error) {
          console.error(`Error migrating banner ${banner._id}:`, error.message);
        }
      }
    }
    
    console.log(`Migration completed. Migrated ${migratedCount} banners`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateBanner(); 