const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/categoryshopcard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const migrateProductStatus = async () => {
  try {
    console.log('เริ่มต้นการ migrate product status...');
    
    // อัปเดตสินค้าทั้งหมดที่ไม่มี status ให้เป็น 'ปกติ'
    const result = await Product.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'ปกติ' } }
    );
    
    console.log(`อัปเดตสินค้า ${result.modifiedCount} รายการให้มี status เป็น 'ปกติ'`);
    
    // ตรวจสอบผลลัพธ์
    const totalProducts = await Product.countDocuments();
    const productsWithStatus = await Product.countDocuments({ status: { $exists: true } });
    
    console.log(`สินค้าทั้งหมด: ${totalProducts} รายการ`);
    console.log(`สินค้าที่มี status: ${productsWithStatus} รายการ`);
    
    console.log('การ migrate เสร็จสิ้น!');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการ migrate:', error);
  } finally {
    mongoose.connection.close();
  }
};

migrateProductStatus(); 