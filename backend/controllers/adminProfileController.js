const AdminProfile = require('../models/AdminProfile');
const path = require('path');
const fs = require('fs');



exports.getProfile = async (req, res) => {
  try {
    let profile = await AdminProfile.findOne();
    if (!profile) {
      profile = await AdminProfile.create({ firstName: '', lastName: '' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('BODY', req.body);
    console.log('FILES', req.files);
    let profile = await AdminProfile.findOne();
    if (!profile) {
      profile = new AdminProfile();
    }
    // handle images
    let imageUrls = profile.imageUrls || [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      imageUrls = req.files.images.map(file => '/uploads/' + file.filename);
    }
    // handle qrcode
    if (req.files && req.files.qrcode && req.files.qrcode.length > 0) {
      profile.qrcode = '/uploads/' + req.files.qrcode[0].filename;
    }
    // update fields
    profile.firstName = req.body.firstName;
    profile.lastName = req.body.lastName;
    profile.age = req.body.age;
    profile.nickname = req.body.nickname;
    profile.phone = req.body.phone;
    profile.province = req.body.province;
    profile.detail = req.body.detail;
    profile.facebook = req.body.facebook;
    profile.lineId = req.body.lineId;
    profile.lineQrcodeText = req.body.lineQrcodeText;
    if (imageUrls.length > 0) profile.imageUrls = imageUrls;
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}; 