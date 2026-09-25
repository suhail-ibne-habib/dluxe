const express = require('express');
const router = express.Router();
const { query, execute } = require('../config/db');

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await query(`
      SELECT t.*, t.id as _id, r.customer_name, r.customer_email 
      FROM transactions t
      JOIN reservations r ON t.reservation_id = r.id
      ORDER BY t.created_at DESC
    `);
    res.json(transactions);
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
    await execute('UPDATE transactions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Transaction updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/transactions/refund', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // Simplistic refund logic for demo
    await execute('UPDATE transactions SET status = "Refunded" WHERE id = ?', [transactionId]);
    res.json({ message: 'Refund successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/analytics/revenue', async (req, res) => {
  try {
    const months = await query(`
      SELECT DATE_FORMAT(created_at, '%b') AS name,
             SUM(total_amount) AS total
      FROM reservations
      WHERE status != 'Cancelled'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    res.json(months.map((row) => ({
      name: row.name,
      total: Number(row.total) || 0
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const { email } = req.query;
    let sql = 'SELECT * FROM users';
    let params = [];
    
    if (email) {
      sql += ' WHERE email LIKE ?';
      params.push(`%${email}%`);
    }
    
    const customers = await query(sql, params);
    res.json(customers.map(({ password, ...customer }) => ({ ...customer, _id: customer.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
