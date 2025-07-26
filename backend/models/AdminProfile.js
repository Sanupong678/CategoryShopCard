const mongoose = require('mongoose');

const AdminProfileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number },
  nickname: { type: String },
  phone: { type: String },
  province: { type: String },
  detail: { type: String },
  facebook: { type: String },
  lineId: { type: String },
  imageUrls: [{ type: String }], // รองรับหลายรูป
  lineQrcodeText: { type: String }, // ข้อความ line
  qrcode: { type: String }, // path รูป QR code
}, { timestamps: true });

module.exports = mongoose.model('AdminProfile', AdminProfileSchema); 