const express = require('express');
const router = express.Router();
const { db, nextId, num } = require('../config/db');
const { sendLeadEmail } = require('../utils/mailer');

router.get('/', async (req, res) => {
  try {
    const leads = await db().collection('leads').find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    res.json(leads.map((lead) => ({ ...lead, _id: lead.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lead = await db().collection('leads').findOne({ id: num(req.params.id) }, { projection: { _id: 0 } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ ...lead, _id: lead.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const id = await nextId('leads');
    await db().collection('leads').insertOne({
      id,
      email: data.email,
      airport: data.airport || '',
      service_type: data.serviceType || data.service_type || '',
      date: data.date || null,
      passengers: data.passengers || 1,
      status: data.status || 'Inquiry',
      created_at: new Date(),
    });

    if (data.email) {
      try {
        let packages = await db().collection('packages').find({ isActive: true }).toArray();
        if (data.airport) {
          const location = await db().collection('locations').findOne({ 'airports.name': data.airport });
          const airport = location?.airports?.find((item) => item.name === data.airport);
          if (airport) {
            const hidden = new Set((airport.excludedPackages || []).map(Number));
            packages = packages.filter((item) => !hidden.has(Number(item.id))).map((item) => {
              const custom = (airport.customPricing || []).find((price) => Number(price.package_id) === Number(item.id));
              return { ...item, base_price: custom?.custom_price || item.basePrice };
            });
          }
        }
        await sendLeadEmail(data.email, data.serviceType || data.service_type, packages.map((item) => ({ ...item, base_price: item.base_price || item.basePrice })));
      } catch (mailError) {
        console.error('Lead Mailer error:', mailError);
      }
    }

    res.status(201).json({ id, message: 'Lead added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

async function updateLeadStatus(req, res) {
  try {
    const data = req.body;
    const update = {};
    if (data.email !== undefined) update.email = data.email;
    if (data.airport !== undefined) update.airport = data.airport;
    if (data.service_type !== undefined || data.serviceType !== undefined) update.service_type = data.service_type || data.serviceType;
    if (data.date !== undefined) update.date = data.date;
    if (data.passengers !== undefined) update.passengers = data.passengers;
    if (data.status !== undefined) update.status = data.status;
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No fields provided' });
    await db().collection('leads').updateOne({ id: num(req.params.id) }, { $set: update });
    res.json({ message: 'Lead updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

router.put('/:id', updateLeadStatus);
router.patch('/:id', updateLeadStatus);

router.delete('/:id', async (req, res) => {
  try {
    await db().collection('leads').deleteOne({ id: num(req.params.id) });
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
