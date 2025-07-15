const express = require('express');
const router = express.Router();
const adminProfileController = require('../controllers/adminProfileController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/profile', adminProfileController.getProfile);
router.put('/profile', upload.array('images', 5), adminProfileController.updateProfile);

module.exports = router; 