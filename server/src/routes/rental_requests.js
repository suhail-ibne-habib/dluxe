const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const requests = await db().collection('rental_requests').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    res.json(requests.map((item) => ({ ...item, _id: item.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.email || !body.carId) return res.status(400).json({ message: 'Car and email are required' });
    const car = await db().collection('cars').findOne({ id: num(body.carId) });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const id = await nextId('rental_requests');
    await db().collection('rental_requests').insertOne({
      id,
      carId: car.id,
      carName: car.name,
      pickupLocation: body.pickupLocation || car.location || '',
      pickupDate: body.pickupDate || null,
      returnDate: body.returnDate || null,
      name: body.name || '',
      email: body.email,
      phone: body.phone || '',
      status: 'Inquiry',
      createdAt: new Date(),
    });
    res.status(201).json({ id, message: 'Rental request received' });
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
    await db().collection('rental_requests').updateOne({ id: num(req.params.id) }, { $set: { status } });
    res.json({ message: 'Rental request updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
