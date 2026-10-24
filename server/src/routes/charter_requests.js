const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const requests = await db().collection('charter_requests').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    res.json(requests.map((item) => ({ ...item, _id: item.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.tripType || !body.fromAirport || !body.toAirport || !body.departureDate || !body.name || !body.email) {
      return res.status(400).json({ message: 'Trip type, airports, departure date, name, and email are required' });
    }
    if (body.tripType === 'Round Trip' && !body.returnDate) {
      return res.status(400).json({ message: 'Return date is required for round trip' });
    }
    const passengers = Math.max(1, Number(body.passengers || 1));
    const id = await nextId('charter_requests');
    await db().collection('charter_requests').insertOne({
      id,
      tripType: body.tripType,
      fromAirport: body.fromAirport,
      toAirport: body.toAirport,
      departureDate: body.departureDate,
      departureTime: body.departureTime || '',
      returnDate: body.returnDate || '',
      returnTime: body.returnTime || '',
      passengers,
      hasConnection: Boolean(body.hasConnection),
      connectionFlight: body.connectionFlight || '',
      notes: body.notes || '',
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      status: 'Inquiry',
      createdAt: new Date(),
    });
    res.status(201).json({ id, message: 'Charter request received' });
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
    await db().collection('charter_requests').updateOne({ id: num(req.params.id) }, { $set: { status } });
    res.json({ message: 'Charter request updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
