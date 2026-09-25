const express = require('express');
const router = express.Router();
const { query, execute } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const airlines = await query('SELECT id, name, code, is_active AS isActive FROM airlines ORDER BY name ASC');
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Airline name is required' });
    const result = await execute(
      'INSERT INTO airlines (name, code, is_active) VALUES (?, ?, ?)',
      [String(name).trim(), code ? String(code).trim().toUpperCase() : null, isActive === false ? 0 : 1]
    );
    res.status(201).json({ id: result.insertId, message: 'Airline created' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'That airline already exists' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Airline name is required' });
    await execute(
      'UPDATE airlines SET name = ?, code = ?, is_active = ? WHERE id = ?',
      [String(name).trim(), code ? String(code).trim().toUpperCase() : null, isActive ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Airline updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'That airline already exists' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM airlines WHERE id = ?', [req.params.id]);
    res.json({ message: 'Airline deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
