const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const locations = await db().collection('rental_locations').find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Location name is required' });
    const existing = await db().collection('rental_locations').findOne({ name });
    if (existing) return res.status(400).json({ message: 'That location already exists' });
    const id = await nextId('rental_locations');
    await db().collection('rental_locations').insertOne({ id, name });
    res.status(201).json({ id, message: 'Location created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Location name is required' });
    const id = num(req.params.id);
    const duplicate = await db().collection('rental_locations').findOne({ name, id: { $ne: id } });
    if (duplicate) return res.status(400).json({ message: 'That location already exists' });
    await db().collection('rental_locations').updateOne({ id }, { $set: { name } });
    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('rental_locations').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
