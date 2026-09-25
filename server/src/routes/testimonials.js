const express = require('express');
const router = express.Router();
const { query, execute } = require('../config/db');

// Get all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await query(`
      SELECT *
      FROM testimonials
      ORDER BY is_featured DESC, created_at DESC
    `);
    
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new testimonial
router.post('/', async (req, res) => {
  try {
    const { author_name, author_title, author_image_url, content, rating, is_featured, is_published } = req.body;
    
    const result = await execute(
      'INSERT INTO testimonials (author_name, author_title, author_image_url, content, rating, is_featured, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        author_name, 
        author_title || '', 
        author_image_url || '', 
        content, 
        rating || 5, 
        is_featured !== undefined ? is_featured : false, 
        is_published !== undefined ? is_published : true
      ]
    );
    
    res.status(201).json({ message: 'Testimonial created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing testimonial
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { author_name, author_title, author_image_url, content, rating, is_featured, is_published } = req.body;

    await execute(
      'UPDATE testimonials SET author_name = ?, author_title = ?, author_image_url = ?, content = ?, rating = ?, is_featured = ?, is_published = ? WHERE id = ?',
      [
        author_name, 
        author_title || '', 
        author_image_url || '', 
        content, 
        rating || 5, 
        is_featured !== undefined ? is_featured : false, 
        is_published !== undefined ? is_published : true, 
        id
      ]
    );
    
    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a testimonial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM testimonials WHERE id = ?', [id]);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
