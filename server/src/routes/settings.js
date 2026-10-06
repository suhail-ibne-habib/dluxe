const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

const PRIVATE_KEYS = new Set(['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'mail_from']);

function unquote(value) {
  return String(value || '').replace(/^"|"$/g, '');
}

router.get('/', async (req, res) => {
  try {
    const results = await db().collection('settings').find({}).toArray();
    const settings = {};
    const isAdmin = req.authUser?.role === 'admin';
    results.forEach((row) => {
      if (!isAdmin && PRIVATE_KEYS.has(row.key)) return;
      if (row.key === 'smtp_pass') return;
      settings[row.key] = row.value;
    });
    if (isAdmin) {
      settings.smtp_host = settings.smtp_host || process.env.SMTP_HOST || '';
      settings.smtp_port = settings.smtp_port || process.env.SMTP_PORT || '587';
      settings.smtp_secure = settings.smtp_secure || process.env.SMTP_SECURE || 'false';
      settings.smtp_user = settings.smtp_user || process.env.SMTP_USER || '';
      settings.mail_from = unquote(settings.mail_from || process.env.MAIL_FROM || '');
      settings.smtp_pass_set = results.some((row) => row.key === 'smtp_pass' && row.value) || Boolean(process.env.SMTP_PASS);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    if ((PRIVATE_KEYS.has(key) && req.authUser?.role !== 'admin') || key === 'smtp_pass') {
      return res.status(404).json({ message: 'Setting not found' });
    }
    const row = await db().collection('settings').findOne({ key });
    if (!row) return res.status(404).json({ message: 'Setting not found' });
    res.json({ value: row.value });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/', async (req, res) => {
  if (req.authUser?.role !== 'admin') {
    return res.status(401).json({ message: 'Admin session required' });
  }
  try {
    for (const [key, value] of Object.entries(req.body)) {
      if (key === 'smtp_pass' && String(value).trim() === '') continue;
      if (value === undefined || value === null) continue;
      await db().collection('settings').updateOne(
        { key },
        { $set: { key, value: String(value) } },
        { upsert: true }
      );
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
