const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const bookings = await db().collection('tour_bookings').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    res.json(bookings.map((item) => ({ ...item, _id: item.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.tourId || !body.date || !body.name || !body.email) {
      return res.status(400).json({ message: 'Tour, date, name, and email are required' });
    }
    const tour = await db().collection('tours').findOne({ id: num(body.tourId), isActive: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    const guests = Math.max(1, Number(body.guests || 1));
    const id = await nextId('tour_bookings');
    await db().collection('tour_bookings').insertOne({
      id,
      tourId: tour.id,
      tourName: tour.name,
      date: body.date,
      guests,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      notes: body.notes || '',
      status: 'Inquiry',
      createdAt: new Date(),
    });
    res.status(201).json({ id, message: 'Tour request received' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const status = req.body.status;
    if (!['Inquiry', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await db().collection('tour_bookings').updateOne({ id: num(req.params.id) }, { $set: { status } });
    res.json({ message: 'Tour booking updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
