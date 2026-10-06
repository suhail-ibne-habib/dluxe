const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const airlines = await db().collection('airlines').find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Airline name is required' });
    const existing = await db().collection('airlines').findOne({ name });
    if (existing) return res.status(400).json({ message: 'That airline already exists' });
    const id = await nextId('airlines');
    await db().collection('airlines').insertOne({
      id,
      name,
      code: req.body.code ? String(req.body.code).trim().toUpperCase() : null,
      isActive: req.body.isActive !== false,
    });
    res.status(201).json({ id, message: 'Airline created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Airline name is required' });
    const duplicate = await db().collection('airlines').findOne({ name, id: { $ne: num(req.params.id) } });
    if (duplicate) return res.status(400).json({ message: 'That airline already exists' });
    await db().collection('airlines').updateOne(
      { id: num(req.params.id) },
      { $set: { name, code: req.body.code ? String(req.body.code).trim().toUpperCase() : null, isActive: Boolean(req.body.isActive) } }
    );
    res.json({ message: 'Airline updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('airlines').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Airline deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
