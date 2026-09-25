const express = require('express');
const router = express.Router();
const { query, execute } = require('../config/db');

// Get all airport pages (Admin)
router.get('/', async (req, res) => {
  try {
    const pages = await query(`
      SELECT ap.*, a.name AS airport_name
      FROM airport_pages ap
      LEFT JOIN airports a ON ap.airport_id = a.id
      ORDER BY ap.created_at DESC
    `);
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific airport page by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pages = await query(`
      SELECT ap.*, a.name AS airport_name, a.link as airport_booking_link, a.note as airport_note
      FROM airport_pages ap
      LEFT JOIN airports a ON ap.airport_id = a.id
      WHERE ap.slug = ?
    `, [slug]);
    
    if (pages.length === 0) {
      return res.status(404).json({ message: 'Airport page not found' });
    }
    
    res.json(pages[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new airport page (Admin)
router.post('/', async (req, res) => {
  try {
    const { slug, page_title, meta_description, hero_image_url, content, additional_info, is_published, airport_id, faqs, package_overrides } = req.body;
    
    // Check if slug already exists
    const existing = await query('SELECT id FROM airport_pages WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A page with this URL slug already exists.' });
    }

    const result = await execute(
      'INSERT INTO airport_pages (slug, page_title, meta_description, hero_image_url, content, additional_info, is_published, airport_id, faqs, package_overrides) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, page_title, meta_description, hero_image_url, content, additional_info || null, is_published !== undefined ? is_published : true, airport_id || null, faqs ? JSON.stringify(faqs) : null, package_overrides ? JSON.stringify(package_overrides) : null]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Airport page created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing airport page (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, page_title, meta_description, hero_image_url, content, additional_info, is_published, airport_id, faqs, package_overrides } = req.body;
    
    // Check if slug exists for another page
    const existing = await query('SELECT id FROM airport_pages WHERE slug = ? AND id != ?', [slug, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A page with this URL slug already exists.' });
    }

    // Optionally handle resetting other pages with this airport_id
    if (airport_id) {
      await execute('UPDATE airport_pages SET airport_id = NULL WHERE airport_id = ? AND id != ?', [airport_id, id]);
    }

    await execute(
      'UPDATE airport_pages SET slug = ?, page_title = ?, meta_description = ?, hero_image_url = ?, content = ?, additional_info = ?, is_published = ?, airport_id = ?, faqs = ?, package_overrides = ? WHERE id = ?',
      [slug, page_title, meta_description, hero_image_url, content, additional_info || null, is_published, airport_id || null, faqs ? JSON.stringify(faqs) : null, package_overrides ? JSON.stringify(package_overrides) : null, id]
    );
    
    res.json({ message: 'Airport page updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an airport page (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM airport_pages WHERE id = ?', [id]);
    res.json({ message: 'Airport page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
