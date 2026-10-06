const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

async function countryName(id) {
  if (!id) return null;
  const location = await db().collection('locations').findOne({ id: num(id) });
  return location?.countryName || null;
}

async function present(row) {
  return {
    _id: row.id,
    id: row.id,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    fromLocationId: row.fromLocationId,
    fromAirport: row.fromAirport,
    toLocationId: row.toLocationId,
    toAirport: row.toAirport,
    departureDate: row.departureDate,
    returnDate: row.returnDate,
    passengers: row.passengers,
    serviceLevel: row.serviceLevel,
    packageId: row.packageId,
    status: row.status,
    totalAmount: row.totalAmount,
    paymentStatus: row.paymentStatus,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    fromLocation: { id: row.fromLocationId, countryName: await countryName(row.fromLocationId) },
    toLocation: row.toLocationId ? { id: row.toLocationId, countryName: await countryName(row.toLocationId) } : null,
  };
}

function fromBody(data) {
  return {
    customerName: data.customerName || data.customer_name || 'Guest User',
    customerEmail: data.customerEmail || data.customer_email || 'no-email@example.com',
    customerPhone: data.customerPhone || data.customer_phone || 'N/A',
    fromLocationId: data.fromLocationId || data.fromLocation || data.from_location_id || null,
    fromAirport: data.fromAirport || data.from_airport || null,
    toLocationId: data.toLocationId || data.to_location_id || null,
    toAirport: data.toAirport || data.to_airport || null,
    departureDate: data.departureDate || data.departure_date || null,
    returnDate: data.returnDate || data.return_date || null,
    passengers: data.passengers || 1,
    serviceLevel: data.serviceLevel || data.service_level || 'Premium',
    packageId: data.packageId || data.package_id || null,
    totalAmount: Number(data.totalAmount || data.total_amount || 0),
    status: data.status || 'Pending',
    paymentStatus: data.paymentStatus || data.payment_status || 'Unpaid',
    notes: data.notes || null,
  };
}

router.get('/', async (req, res) => {
  try {
    const filter = req.query.email ? { customerEmail: req.query.email } : {};
    const rows = await db().collection('reservations').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(await Promise.all(rows.map(present)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await db().collection('reservations').findOne({ id: num(req.params.id) });
    if (!row) return res.status(404).json({ message: 'Reservation not found' });
    res.json(await present(row));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = await nextId('reservations');
    const now = new Date();
    await db().collection('reservations').insertOne({ id, ...fromBody(req.body), createdAt: now, updatedAt: now });
    res.status(201).json({ id, message: 'Reservation created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['customerName', 'customerEmail', 'customerPhone', 'fromLocationId', 'fromAirport', 'toLocationId', 'toAirport', 'departureDate', 'returnDate', 'passengers', 'serviceLevel', 'packageId', 'status', 'totalAmount', 'paymentStatus', 'notes'];
    const update = { updatedAt: new Date() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (Object.keys(update).length === 1) return res.status(400).json({ message: 'No fields provided' });
    await db().collection('reservations').updateOne({ id: num(req.params.id) }, { $set: update });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('reservations').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
