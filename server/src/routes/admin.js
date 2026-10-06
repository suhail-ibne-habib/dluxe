const express = require('express');
const router = express.Router();
const { db, num } = require('../config/db');

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await db().collection('transactions').find({}).sort({ created_at: -1 }).toArray();
    const reservations = await db().collection('reservations').find({}).toArray();
    const byId = new Map(reservations.map((reservation) => [Number(reservation.id), reservation]));
    res.json(transactions.map((transaction) => {
      const reservation = byId.get(Number(transaction.reservation_id));
      return {
        ...transaction,
        _id: transaction.id,
        customer_name: reservation?.customerName || '',
        customer_email: reservation?.customerEmail || '',
      };
    }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/transactions/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Succeeded', 'Failed', 'Refunded'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await db().collection('transactions').updateOne({ id: num(req.params.id) }, { $set: { status } });
    res.json({ message: 'Transaction updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/transactions/refund', async (req, res) => {
  try {
    await db().collection('transactions').updateOne({ id: num(req.body.transactionId) }, { $set: { status: 'Refunded' } });
    res.json({ message: 'Refund successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/analytics/revenue', async (req, res) => {
  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    const reservations = await db().collection('reservations').find({
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: start },
    }).toArray();
    const buckets = new Map();
    for (const reservation of reservations) {
      const date = new Date(reservation.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = buckets.get(key) || { name: date.toLocaleString('en', { month: 'short' }), total: 0, sort: date.getFullYear() * 12 + date.getMonth() };
      current.total += Number(reservation.totalAmount || 0);
      buckets.set(key, current);
    }
    res.json([...buckets.values()].sort((a, b) => a.sort - b.sort).map(({ name, total }) => ({ name, total })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const filter = req.query.email ? { email: { $regex: req.query.email, $options: 'i' } } : {};
    const customers = await db().collection('users').find(filter, { projection: { _id: 0, password: 0 } }).toArray();
    res.json(customers.map((customer) => ({ ...customer, _id: customer.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
