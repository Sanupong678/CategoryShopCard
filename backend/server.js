require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');
const path = require('path');
const bannerRoutes = require('./routes/banner');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const adminProfileRoutes = require('./routes/adminProfile');
const whyContentRoutes = require('./routes/whyContent');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔽 เชื่อม MONGO_URL ให้ตรงกับ .env
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/banner', bannerRoutes);
app.use('/api', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminProfileRoutes);
app.use('/api/whycontent', whyContentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
