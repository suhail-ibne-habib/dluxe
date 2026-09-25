const express = require('express');
const router = express.Router();
const { query, execute } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const locations = await query('SELECT id, country_name as countryName, flag_icon as flagIcon FROM locations ORDER BY country_name ASC');
    const airports = await query(`
      SELECT a.id, a.location_id, a.name, a.link, a.note, ap.id as page_id, ap.slug as page_slug
      FROM airports a
      LEFT JOIN airport_pages ap ON ap.airport_id = a.id
    `);
    const excluded = await query('SELECT airport_id, package_id FROM airport_excluded_packages');
    const pricing = await query('SELECT airport_id, package_id, custom_price FROM airport_package_pricing');

    const excludedByAirport = new Map();
    for (const row of excluded) {
      if (!excludedByAirport.has(row.airport_id)) excludedByAirport.set(row.airport_id, []);
      excludedByAirport.get(row.airport_id).push(row.package_id);
    }
    const pricingByAirport = new Map();
    for (const row of pricing) {
      if (!pricingByAirport.has(row.airport_id)) pricingByAirport.set(row.airport_id, []);
      pricingByAirport.get(row.airport_id).push({ package_id: row.package_id, custom_price: row.custom_price });
    }
    const airportsByLocation = new Map();
    for (const airport of airports) {
      airport.excludedPackages = excludedByAirport.get(airport.id) || [];
      airport.customPricing = pricingByAirport.get(airport.id) || [];
      if (!airportsByLocation.has(airport.location_id)) airportsByLocation.set(airport.location_id, []);
      airportsByLocation.get(airport.location_id).push(airport);
    }
    for (const location of locations) {
      location.airports = airportsByLocation.get(location.id) || [];
    }

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locations = await query('SELECT id, country_name as countryName, flag_icon as flagIcon FROM locations WHERE id = ?', [id]);
    if (locations.length === 0) return res.status(404).json({ message: 'Location not found' });
    
    let location = locations[0];
    location.airports = await query(`
      SELECT a.id, a.name, a.link, a.note, ap.id as page_id, ap.slug as page_slug
      FROM airports a
      LEFT JOIN airport_pages ap ON ap.airport_id = a.id
      WHERE a.location_id = ?
    `, [location.id]);
    
    for (let airport of location.airports) {
      const excluded = await query('SELECT package_id FROM airport_excluded_packages WHERE airport_id = ?', [airport.id]);
      airport.excludedPackages = excluded.map(e => e.package_id);

      const pricing = await query('SELECT package_id, custom_price FROM airport_package_pricing WHERE airport_id = ?', [airport.id]);
      airport.customPricing = pricing;
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { countryName, flagIcon, airports } = req.body;
    const result = await execute('INSERT INTO locations (country_name, flag_icon) VALUES (?, ?)', [countryName, flagIcon]);
    const locationId = result.insertId;

    if (Array.isArray(airports)) {
      for (const airport of airports) {
        const airportResult = await execute('INSERT INTO airports (location_id, name, link, note) VALUES (?, ?, ?, ?)', [locationId, airport.name, airport.link, airport.note || null]);
        const airportId = airportResult.insertId;
        
        if (airport.page_id) {
          // Unlink any page that currently points to this airportId (unlikely on POST, but safe)
          // and unlink the target page from any other airport
          await execute('UPDATE airport_pages SET airport_id = NULL WHERE airport_id = ?', [airportId]);
          await execute('UPDATE airport_pages SET airport_id = ? WHERE id = ?', [airportId, airport.page_id]);
        }
        
        if (Array.isArray(airport.excludedPackages)) {
          for (const pkgId of airport.excludedPackages) {
            await execute('INSERT INTO airport_excluded_packages (airport_id, package_id) VALUES (?, ?)', [airportId, pkgId]);
          }
        }
        if (Array.isArray(airport.customPricing)) {
          for (const pricing of airport.customPricing) {
            if (pricing.custom_price != null && pricing.custom_price !== '') {
               await execute('INSERT INTO airport_package_pricing (airport_id, package_id, custom_price) VALUES (?, ?, ?)', [airportId, pricing.package_id, pricing.custom_price]);
            }
          }
        }
      }
    }
    
    res.status(201).json({ id: locationId, message: 'Location created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { countryName, flagIcon, airports } = req.body;
    
    await execute('UPDATE locations SET country_name = ?, flag_icon = ? WHERE id = ?', [countryName, flagIcon, id]);
    
    // Clean up any dangling airport_pages pointers before deleting old airports
    const oldAirports = await query('SELECT id FROM airports WHERE location_id = ?', [id]);
    const oldAirportIds = oldAirports.map(a => a.id);
    if (oldAirportIds.length > 0) {
      const placeholders = oldAirportIds.map(() => '?').join(',');
      await execute(
        `UPDATE airport_pages SET airport_id = NULL WHERE airport_id IN (${placeholders})`,
        oldAirportIds
      );
    }
    
    // Simplest way to update nested airports and exclusions: Delete all existing and re-insert the new list
    await execute('DELETE FROM airports WHERE location_id = ?', [id]);
    
    if (Array.isArray(airports)) {
      for (const airport of airports) {
        const airportResult = await execute('INSERT INTO airports (location_id, name, link, note) VALUES (?, ?, ?, ?)', [id, airport.name, airport.link, airport.note || null]);
        const airportId = airportResult.insertId;
        
        if (airport.page_id) {
          // Because we delete and re-insert airports, old airport_ids might still be on the page, but we're creating new ones.
          // Link the selected page to this new airportId
          await execute('UPDATE airport_pages SET airport_id = ? WHERE id = ?', [airportId, airport.page_id]);
        }
        
        if (Array.isArray(airport.excludedPackages)) {
          for (const pkgId of airport.excludedPackages) {
            await execute('INSERT INTO airport_excluded_packages (airport_id, package_id) VALUES (?, ?)', [airportId, pkgId]);
          }
        }
        if (Array.isArray(airport.customPricing)) {
          for (const pricing of airport.customPricing) {
            if (pricing.custom_price != null && pricing.custom_price !== '') {
               await execute('INSERT INTO airport_package_pricing (airport_id, package_id, custom_price) VALUES (?, ?, ?)', [airportId, pricing.package_id, pricing.custom_price]);
            }
          }
        }
      }
    }
    
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM locations WHERE id = ?', [id]);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
