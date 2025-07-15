const Banner = require('../models/Banner');

function logError(context, err, req) {
  console.error(`[${new Date().toISOString()}] [Banner] ${context} Error:`);
  if (req) {
    console.error('  req.body:', req.body);
    console.error('  req.file:', req.file);
  }
  console.error('  error:', err);
  if (err && err.stack) console.error('  stack:', err.stack);
}

// อัปโหลด banner ใหม่
exports.createBanner = async (req, res) => {
  try {
    console.log('[Banner] createBanner req.body:', req.body);
    console.log('[Banner] createBanner req.file:', req.file);
    const { title, description } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const banner = new Banner({ title, description, imageUrl });
    await banner.save();
    console.log('[Banner] Created:', banner);
    res.json(banner);
  } catch (err) {
    logError('Create', err, req);
    res.status(500).json({ error: 'Failed to create banner', details: err.message });
  }
};

// ดึง banner ล่าสุด
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne().sort({ createdAt: -1 });
    console.log('[Banner] Fetched:', banner);
    res.json(banner);
  } catch (err) {
    logError('Fetch', err, req);
    res.status(500).json({ error: 'Failed to fetch banner', details: err.message });
  }
};

// แก้ไข banner
exports.updateBanner = async (req, res) => {
  try {
    console.log('[Banner] updateBanner req.body:', req.body);
    console.log('[Banner] updateBanner req.file:', req.file);
    const { id } = req.params;
    const { title, description } = req.body;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const banner = await Banner.findByIdAndUpdate(
      id,
      { title, description, imageUrl },
      { new: true }
    );
    console.log('[Banner] Updated:', banner);
    res.json(banner);
  } catch (err) {
    logError('Update', err, req);
    res.status(500).json({ error: 'Failed to update banner', details: err.message });
  }
};