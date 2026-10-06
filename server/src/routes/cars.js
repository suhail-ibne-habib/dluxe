const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

const starters = [
  { name: 'Deriv intro Peacock GTC', year: 2018, pricePerDay: 450, location: 'Sint Maarten', transmission: 'Manual', seats: 2, imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Ferrari Pininfarina Sergio', year: 2021, pricePerDay: 1800, location: 'Saint Barths', transmission: 'Auto', seats: 2, imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bugatti Chiron Sport 300+', year: 2018, pricePerDay: 3500, location: 'Sint Maarten', transmission: 'Auto', seats: 2, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bugatti Centodieci', year: 2022, pricePerDay: 4200, location: 'Saint Barths', transmission: 'Auto', seats: 2, imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Aston Martin Valkyrie', year: 2021, pricePerDay: 2900, location: 'Sint Maarten', transmission: 'Auto', seats: 2, imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Rolls Royce Ghost', year: 2020, pricePerDay: 900, location: 'Saint Barths', transmission: 'Auto', seats: 4, imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80' },
];

async function seedCars() {
  if (await db().collection('cars').countDocuments() > 0) return;
  for (const car of starters) {
    await db().collection('cars').insertOne({ id: await nextId('cars'), ...car, available: true });
  }
  console.log('Seeded cars');
}

router.get('/', async (req, res) => {
  try {
    const filter = req.query.available === '1' ? { available: true } : {};
    const cars = await db().collection('cars').find(filter, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ message: 'Car name is required' });
    const id = await nextId('cars');
    await db().collection('cars').insertOne({
      id,
      name: body.name,
      year: Number(body.year || new Date().getFullYear()),
      pricePerDay: Number(body.pricePerDay || 0),
      location: body.location || '',
      transmission: body.transmission || 'Auto',
      seats: Number(body.seats || 2),
      imageUrl: body.imageUrl || '',
      available: body.available !== false,
    });
    res.status(201).json({ id, message: 'Car created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    await db().collection('cars').updateOne({ id: num(req.params.id) }, {
      $set: {
        name: body.name,
        year: Number(body.year || 0),
        pricePerDay: Number(body.pricePerDay || 0),
        location: body.location || '',
        transmission: body.transmission || 'Auto',
        seats: Number(body.seats || 2),
        imageUrl: body.imageUrl || '',
        available: Boolean(body.available),
      },
    });
    res.json({ message: 'Car updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('cars').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
module.exports.seedCars = seedCars;
