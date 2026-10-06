const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

async function pagesByAirport() {
  const pages = await db().collection('airport_pages').find({ airport_id: { $ne: null } }).toArray();
  return new Map(pages.map((page) => [Number(page.airport_id), page]));
}

function present(location, pages) {
  return {
    id: location.id,
    countryName: location.countryName,
    flagIcon: location.flagIcon,
    airports: (location.airports || []).map((airport) => {
      const page = pages.get(Number(airport.id));
      return {
        ...airport,
        page_id: page?.id || null,
        page_slug: page?.slug || null,
      };
    }),
  };
}

async function saveAirports(airports) {
  const saved = [];
  for (const airport of airports || []) {
    const id = airport.id ? num(airport.id) : await nextId('airports');
    if (airport.page_id) {
      await db().collection('airport_pages').updateMany({ airport_id: id }, { $set: { airport_id: null } });
      await db().collection('airport_pages').updateOne({ id: num(airport.page_id) }, { $set: { airport_id: id } });
    }
    saved.push({
      id,
      name: airport.name,
      link: airport.link || '',
      note: airport.note || '',
      excludedPackages: (airport.excludedPackages || []).map(num),
      customPricing: (airport.customPricing || [])
        .filter((item) => item.custom_price !== '' && item.custom_price != null)
        .map((item) => ({ package_id: num(item.package_id), custom_price: Number(item.custom_price) })),
    });
  }
  return saved;
}

router.get('/', async (req, res) => {
  try {
    const [locations, pages] = await Promise.all([
      db().collection('locations').find({}).sort({ countryName: 1 }).toArray(),
      pagesByAirport(),
    ]);
    res.json(locations.map((location) => present(location, pages)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const location = await db().collection('locations').findOne({ id: num(req.params.id) });
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(present(location, await pagesByAirport()));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = await nextId('locations');
    const airports = await saveAirports(req.body.airports);
    await db().collection('locations').insertOne({
      id,
      countryName: req.body.countryName,
      flagIcon: req.body.flagIcon,
      airports,
    });
    res.status(201).json({ id, message: 'Location created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = num(req.params.id);
    const current = await db().collection('locations').findOne({ id });
    const oldIds = (current?.airports || []).map((airport) => airport.id);
    if (oldIds.length) {
      await db().collection('airport_pages').updateMany({ airport_id: { $in: oldIds } }, { $set: { airport_id: null } });
    }
    const airports = await saveAirports(req.body.airports);
    await db().collection('locations').updateOne(
      { id },
      { $set: { countryName: req.body.countryName, flagIcon: req.body.flagIcon, airports } }
    );
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = num(req.params.id);
    const current = await db().collection('locations').findOne({ id });
    const oldIds = (current?.airports || []).map((airport) => airport.id);
    if (oldIds.length) {
      await db().collection('airport_pages').updateMany({ airport_id: { $in: oldIds } }, { $set: { airport_id: null } });
    }
    await db().collection('locations').deleteOne({ id });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
