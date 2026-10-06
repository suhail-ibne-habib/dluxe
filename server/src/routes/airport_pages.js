const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

async function airportName(airportId) {
  if (!airportId) return null;
  const location = await db().collection('locations').findOne({ 'airports.id': num(airportId) });
  return location?.airports?.find((airport) => Number(airport.id) === num(airportId)) || null;
}

function present(page, airport) {
  const { _id, ...rest } = page;
  return {
    ...rest,
    airport_name: airport?.name || null,
    airport_booking_link: airport?.link || null,
    airport_note: airport?.note || null,
  };
}

router.get('/', async (req, res) => {
  try {
    const pages = await db().collection('airport_pages').find({}).sort({ created_at: -1 }).toArray();
    const presented = [];
    for (const page of pages) presented.push(present(page, await airportName(page.airport_id)));
    res.json(presented);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const page = await db().collection('airport_pages').findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Airport page not found' });
    res.json(present(page, await airportName(page.airport_id)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const existing = await db().collection('airport_pages').findOne({ slug: body.slug });
    if (existing) return res.status(400).json({ message: 'A page with this URL slug already exists.' });
    const id = await nextId('airport_pages');
    await db().collection('airport_pages').insertOne({
      id,
      slug: body.slug,
      page_title: body.page_title,
      meta_description: body.meta_description || '',
      hero_image_url: body.hero_image_url || '',
      content: body.content || '',
      additional_info: body.additional_info || '',
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      airport_id: body.airport_id ? num(body.airport_id) : null,
      faqs: body.faqs || [],
      package_overrides: body.package_overrides || null,
      created_at: new Date(),
    });
    res.status(201).json({ id, message: 'Airport page created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = num(req.params.id);
    const body = req.body;
    const existing = await db().collection('airport_pages').findOne({ slug: body.slug, id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'A page with this URL slug already exists.' });
    const airportId = body.airport_id ? num(body.airport_id) : null;
    if (airportId) {
      await db().collection('airport_pages').updateMany({ airport_id: airportId, id: { $ne: id } }, { $set: { airport_id: null } });
    }
    await db().collection('airport_pages').updateOne({ id }, {
      $set: {
        slug: body.slug,
        page_title: body.page_title,
        meta_description: body.meta_description || '',
        hero_image_url: body.hero_image_url || '',
        content: body.content || '',
        additional_info: body.additional_info || '',
        is_published: Boolean(body.is_published),
        airport_id: airportId,
        faqs: body.faqs || [],
        package_overrides: body.package_overrides || null,
      },
    });
    res.json({ message: 'Airport page updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('airport_pages').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Airport page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
