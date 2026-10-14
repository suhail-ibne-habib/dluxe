const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');

const starters = [
  {
    name: 'Scooter tours',
    slug: 'scooter-tours',
    category: 'Scooter tours',
    summary: 'A guided scooter ride along the coast, with stops for views and photos.',
    description: 'Ride with a guide on an easy island loop. The tour includes the scooter, a helmet, and time at the main lookout points. Riders need a valid license.',
    duration: '3 hours',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1400&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    name: 'Scooter rental',
    slug: 'scooter-rental',
    category: 'Scooter rental',
    summary: 'Take a scooter for the day and explore St. Maarten on your own.',
    description: 'Pick up a scooter in the morning and return it the same day. A helmet is included. This is a self-guided rental, not a guided tour.',
    duration: 'Full day',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1400&q=80',
    isActive: true,
    isPopular: false,
  },
  {
    name: 'ATV tours',
    slug: 'atv-tours',
    category: 'ATV tours',
    summary: 'A guided ATV ride on dirt trails, beaches, and hillside tracks.',
    description: 'Follow a guide off the main roads. The tour includes the ATV, a safety briefing, and a helmet. No previous ATV experience is required.',
    duration: '2 hours',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    name: 'ATV rental',
    slug: 'atv-rental',
    category: 'ATV rental',
    summary: 'Rent an ATV and set your own route for the day.',
    description: 'The rental includes the ATV, fuel for the booked time, and a helmet. A short safety briefing is given at pickup.',
    duration: 'Full day',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80',
    isActive: true,
    isPopular: false,
  },
  {
    name: 'Hiking tours',
    slug: 'hiking-tours',
    category: 'Hiking tours',
    summary: 'A guided walk with coastal views, shade stops, and a local guide.',
    description: 'Walk a marked island trail with a guide. The pace is moderate. Bring closed shoes and water. Pickup from the hotel can be arranged in the notes.',
    duration: '4 hours',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80',
    isActive: true,
    isPopular: false,
  },
];

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'tour';
}

function present(item, bookingCount = 0) {
  return {
    id: item.id,
    _id: item.id,
    name: item.name,
    slug: item.slug,
    category: item.category || '',
    summary: item.summary || '',
    description: item.description || '',
    duration: item.duration || '',
    price: Number(item.price || 0),
    imageUrl: item.imageUrl || '',
    isActive: Boolean(item.isActive),
    isPopular: Boolean(item.isPopular),
    totalBookings: bookingCount,
  };
}

async function bookingCounts() {
  const bookings = await db().collection('tour_bookings').find({ status: { $ne: 'Cancelled' } }).toArray();
  const counts = {};
  bookings.forEach((booking) => {
    const key = Number(booking.tourId);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

async function seedTours() {
  const count = await db().collection('tours').countDocuments();
  if (count > 0) return;
  let id = await nextId('tours');
  const docs = starters.map((tour, index) => {
    const doc = { ...tour, id: id + index };
    return doc;
  });
  if (docs.length > 1) {
    await db().collection('counters').updateOne({ _id: 'tours' }, { $set: { seq: id + docs.length - 1 } });
  }
  await db().collection('tours').insertMany(docs);
}

router.get('/', async (req, res) => {
  try {
    const tours = await db().collection('tours').find({}).sort({ id: 1 }).toArray();
    const counts = await bookingCounts();
    res.json(tours.map((item) => present(item, counts[item.id] || 0)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const item = await db().collection('tours').findOne({ slug: req.params.slug });
    if (!item || !item.isActive) return res.status(404).json({ message: 'Tour not found' });
    res.json(present(item));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ message: 'Name is required' });
    let slug = slugify(body.slug || body.name);
    const taken = await db().collection('tours').findOne({ slug });
    if (taken) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const id = await nextId('tours');
    await db().collection('tours').insertOne({
      id,
      name: body.name,
      slug,
      category: body.category || body.name,
      summary: body.summary || '',
      description: body.description || '',
      duration: body.duration || '',
      price: Number(body.price || 0),
      imageUrl: body.imageUrl || '',
      isActive: body.isActive !== false,
      isPopular: Boolean(body.isPopular),
    });
    res.status(201).json({ id, slug, message: 'Tour created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const current = await db().collection('tours').findOne({ id: num(req.params.id) });
    if (!current) return res.status(404).json({ message: 'Tour not found' });
    const update = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.category !== undefined) update.category = data.category;
    if (data.summary !== undefined) update.summary = data.summary;
    if (data.description !== undefined) update.description = data.description;
    if (data.duration !== undefined) update.duration = data.duration;
    if (data.price !== undefined) update.price = Number(data.price);
    if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) update.isActive = Boolean(data.isActive);
    if (data.isPopular !== undefined) update.isPopular = Boolean(data.isPopular);
    if (data.slug !== undefined && data.slug !== current.slug) {
      const slug = slugify(data.slug);
      const taken = await db().collection('tours').findOne({ slug, id: { $ne: current.id } });
      if (taken) return res.status(400).json({ message: 'That link is already used' });
      update.slug = slug;
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No fields provided' });
    await db().collection('tours').updateOne({ id: current.id }, { $set: update });
    res.json({ message: 'Tour updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('tours').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Tour deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
module.exports.seedTours = seedTours;
