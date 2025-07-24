const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/footerdb'; // เปลี่ยนชื่อ db ตามที่ใช้จริง

mongoose.connect(MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  // รายชื่อ collection ที่ต้องการลบ
  const collections = [
    'contactItems',
    'aboutItems',
    'helpItems',
    'socialLinks',
    'copyright',
    // เพิ่มชื่อ collection ที่มี field items ถ้ามี เช่น 'footers_old'
  ];
  for (const name of collections) {
    try {
      await db.dropCollection(name);
      console.log(`Dropped collection: ${name}`);
    } catch (e) {
      console.log(`Collection not found or already dropped: ${name}`);
    }
  }
  mongoose.disconnect();
});