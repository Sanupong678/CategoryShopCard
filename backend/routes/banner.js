const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bannerController = require('../controllers/bannerController');

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), bannerController.createBanner);
router.get('/', bannerController.getBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);

module.exports = router;
