const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const testimonials = await db().collection('testimonials').find({}, { projection: { _id: 0 } }).toArray();
    testimonials.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || new Date(b.created_at) - new Date(a.created_at));
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const id = await nextId('testimonials');
    await db().collection('testimonials').insertOne({
      id,
      author_name: body.author_name,
      author_title: body.author_title || '',
      author_image_url: body.author_image_url || '',
      content: body.content,
      rating: Number(body.rating || 5),
      is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : false,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      created_at: new Date(),
    });
    res.status(201).json({ message: 'Testimonial created successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    await db().collection('testimonials').updateOne({ id: num(req.params.id) }, {
      $set: {
        author_name: body.author_name,
        author_title: body.author_title || '',
        author_image_url: body.author_image_url || '',
        content: body.content,
        rating: Number(body.rating || 5),
        is_featured: Boolean(body.is_featured),
        is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      },
    });
    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('testimonials').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
