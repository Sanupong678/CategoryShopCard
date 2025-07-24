const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const ADMIN_USER = 'admin';
// hash ของรหัสผ่าน 'artit0817245565'
const ADMIN_HASH = '$2b$10$wQw6Qw6Qw6Qw6Qw6Qw6QOeQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, ADMIN_HASH);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router; 