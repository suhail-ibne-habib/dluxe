const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

async function withTotals(packages) {
  const reservations = await db().collection('reservations').find({ status: { $ne: 'Cancelled' } }).toArray();
  return packages.map((item) => {
    const orders = reservations.filter((reservation) => Number(reservation.packageId) === Number(item.id));
    return {
      id: item.id,
      _id: item.id,
      name: item.name,
      basePrice: item.basePrice,
      description: item.description || '',
      features: item.features || [],
      isActive: Boolean(item.isActive),
      isPopular: Boolean(item.isPopular),
      rankOrder: item.rankOrder || 0,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, reservation) => sum + Number(reservation.totalAmount || 0), 0),
    };
  });
}

router.get('/', async (req, res) => {
  try {
    const packages = await db().collection('packages').find({}).sort({ rankOrder: 1 }).toArray();
    res.json(await withTotals(packages));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await db().collection('packages').findOne({ id: num(req.params.id) });
    if (!item) return res.status(404).json({ message: 'Package not found' });
    const [presented] = await withTotals([item]);
    res.json(presented);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = await nextId('packages');
    await db().collection('packages').insertOne({
      id,
      name: req.body.name,
      basePrice: Number(req.body.basePrice || 0),
      description: req.body.description || '',
      features: req.body.features || [],
      isActive: Boolean(req.body.isActive),
      isPopular: Boolean(req.body.isPopular),
      rankOrder: Number(req.body.rankOrder || 0),
    });
    res.status(201).json({ id, message: 'Package created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const update = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.basePrice !== undefined) update.basePrice = Number(data.basePrice);
    if (data.description !== undefined) update.description = data.description;
    if (data.features !== undefined) update.features = data.features;
    if (data.isActive !== undefined) update.isActive = Boolean(data.isActive);
    if (data.isPopular !== undefined) update.isPopular = Boolean(data.isPopular);
    if (data.rankOrder !== undefined) update.rankOrder = Number(data.rankOrder);
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No fields provided' });
    await db().collection('packages').updateOne({ id: num(req.params.id) }, { $set: update });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('packages').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
