const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, nextId, num } = require('../config/db');
const { sendWelcomeEmail } = require('../utils/mailer');

router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await db().collection('users').findOne({ email });
    if (!user) return res.json(null);
    res.json({ id: user.id, name: user.name, email: user.email, is_password_temp: user.is_password_temp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, isPasswordTemp } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await nextId('users');
    await db().collection('users').insertOne({
      id,
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      is_password_temp: Boolean(isPasswordTemp),
      created_at: new Date(),
    });
    if (isPasswordTemp) await sendWelcomeEmail(email, name, password);
    res.status(201).json({ id, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { password, isPasswordTemp, name, email, phone } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (password) {
      update.password = await bcrypt.hash(password, 10);
      update.is_password_temp = Boolean(isPasswordTemp);
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No fields provided' });
    await db().collection('users').updateOne({ id: num(req.params.id) }, { $set: update });
    if (password && isPasswordTemp) {
      const user = await db().collection('users').findOne({ id: num(req.params.id) });
      if (user) await sendWelcomeEmail(user.email, user.name, password);
    }
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    if (!req.authUser?.email) return res.status(401).json({ message: 'Unauthorized' });
    const rows = await db().collection('reservations').find({ customerEmail: req.authUser.email }).sort({ createdAt: -1 }).toArray();
    res.json(rows.map((row) => ({ ...row, _id: row.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('users').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
