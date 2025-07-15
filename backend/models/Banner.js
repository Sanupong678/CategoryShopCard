 const mongoose = require('mongoose');
 const BannerSchema = new mongoose.Schema({
    imageUrl:String,
    createdAt: { type: Date, default: Date.now }
 });
 module.exports = mongoose.model('Banner', BannerSchema);