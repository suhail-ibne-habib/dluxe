const fs = require('fs');
const path = require('path');
const { connect, db, nextId } = require('../config/db');

const faqs = [
  {
    question: 'What is VIP Airport Meet & Greet service?',
    answer: 'Our VIP Meet & Greet service provides a personal concierge to escort you through the airport, helping with luggage, fast-tracking you through security and customs, and ensuring a seamless transition from your vehicle to the plane or vice versa.',
  },
  {
    question: 'What is the difference between Meet & Greet, VIP Terminal, and VIP Private Suite?',
    answer: 'Meet & Greet happens in the main terminal with fast-track services. VIP Terminal uses a separate standalone facility away from the main terminal crowds. VIP Private Suite offers a fully private, luxury room within the airport for ultimate privacy and relaxation.',
  },
  {
    question: 'What is included in VIP Airport Meet & Assist?',
    answer: 'It typically includes a personal escort, porter services for your luggage, priority check-in assistance, and fast-track clearance through security, immigration, and customs.',
  },
  {
    question: 'Does VIP Meet & Greet include baggage porter, lounge access, golf cart buggy or airport transfer?',
    answer: 'Baggage porter is usually included. Lounge access depends on the package level. Golf cart buggies and airport transfers can be added as supplementary services or are included in premium packages like the VIP Terminal.',
  },
];

function parseQuoted(text, start) {
  let i = start + 1;
  let value = '';
  while (i < text.length) {
    if (text[i] === "'" && text[i + 1] === "'") {
      value += "'";
      i += 2;
      continue;
    }
    if (text[i] === "'") return { value, next: i + 1 };
    value += text[i];
    i += 1;
  }
  return null;
}

function parseAirportLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('(')) return null;
  const comma = trimmed.indexOf(',');
  const locationId = Number(trimmed.slice(1, comma));
  let cursor = comma + 1;
  while (trimmed[cursor] === ' ') cursor += 1;
  const name = parseQuoted(trimmed, cursor);
  if (!name) return null;
  cursor = name.next;
  while (trimmed[cursor] === ' ' || trimmed[cursor] === ',') cursor += 1;
  const link = parseQuoted(trimmed, cursor);
  if (!link) return null;
  const cleanLink = link.value.includes('skyvipservices') || link.value.includes('skyview') ? '' : link.value;
  return { locationId, name: name.value, link: cleanLink };
}

function readLocations() {
  const file = path.join(__dirname, '../../sql/seed_locations.sql');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const locations = new Map();
  for (const line of lines) {
    const match = line.match(/^INSERT INTO locations \(id, country_name, flag_icon\) VALUES \((\d+), '(.*)', '(.*)'\);$/);
    if (!match) continue;
    locations.set(Number(match[1]), {
      id: Number(match[1]),
      countryName: match[2],
      flagIcon: match[3],
      airports: [],
    });
  }
  let airportId = 1;
  for (const line of lines) {
    const airport = parseAirportLine(line);
    if (!airport) continue;
    const location = locations.get(airport.locationId);
    if (!location) continue;
    location.airports.push({
      id: airportId,
      name: airport.name,
      link: airport.link,
      note: '',
      excludedPackages: [],
      customPricing: [],
    });
    airportId += 1;
  }
  return [...locations.values()];
}

async function seed() {
  await connect();
  const database = db();
  const locations = readLocations();
  if (await database.collection('locations').countDocuments() === 0 && locations.length) {
    await database.collection('locations').insertMany(locations);
    await database.collection('counters').updateOne(
      { _id: 'airports' },
      { $set: { seq: locations.reduce((max, location) => Math.max(max, ...location.airports.map((airport) => airport.id)), 0) } },
      { upsert: true }
    );
    await database.collection('counters').updateOne(
      { _id: 'locations' },
      { $set: { seq: Math.max(...locations.map((location) => location.id)) } },
      { upsert: true }
    );
    console.log(`Seeded ${locations.length} locations`);
  }

  if (await database.collection('airlines').countDocuments() === 0) {
    const airlines = [
      ['Delta Airlines', 'DL'],
      ['American Airlines', 'AA'],
      ['United Airlines', 'UA'],
      ['KLM Royal Dutch Airlines', 'KL'],
    ];
    for (const [name, code] of airlines) {
      await database.collection('airlines').insertOne({ id: await nextId('airlines'), name, code, isActive: true });
    }
    console.log('Seeded airlines');
  }

  if (await database.collection('packages').countDocuments() === 0) {
    const packages = [
      { name: 'VIP Meet & Greet', basePrice: 395, isPopular: false },
      { name: 'VIP Terminal', basePrice: 1280, isPopular: true },
      { name: 'Standard Greeting', basePrice: 250, isPopular: false },
    ];
    for (const [index, item] of packages.entries()) {
      await database.collection('packages').insertOne({
        id: await nextId('packages'),
        ...item,
        description: '',
        features: [],
        isActive: true,
        rankOrder: index,
      });
    }
    console.log('Seeded packages');
  }

  if (await database.collection('airport_pages').countDocuments() === 0) {
    const all = await database.collection('locations').find({}).toArray();
    const airports = all.flatMap((location) => location.airports || []);
    const sxm = airports.find((airport) => /Princess Juliana/i.test(airport.name));
    const sbh = airports.find((airport) => /Barth/i.test(airport.name));
    const pages = [
      {
        slug: 'saint-barths',
        airport_id: sbh?.id || null,
        page_title: 'SBH, Saint Barthélemy Airport',
        meta_description: 'Experience premium VIP treatment at Saint Barthélemy Airport (SBH). Enjoy personalized meet & greet, fast-track clearance, and exclusive lounge access.',
        hero_image_url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2600&auto=format&fit=crop',
        additional_info: '<h3>SBH Fast Track</h3><p>Expedite your airport experience with our priority fast-track service through security and customs.</p>',
        content: '<p>Saint Barthélemy Airport (SBH), also known as Gustaf III Airport, is famous for its unique and thrilling landing approach.</p>',
      },
      {
        slug: 'sint-maarten',
        airport_id: sxm?.id || null,
        page_title: 'Princess Juliana Airport VIP Services (SXM)',
        meta_description: 'Experience premium VIP treatment at Princess Juliana International Airport (SXM). Enjoy personalized meet & greet, fast-track clearance, and exclusive lounge access.',
        hero_image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2600&auto=format&fit=crop',
        additional_info: '<h3>SXM Fast Track</h3><p>Explore more about our Fast Track services to elevate your airport experience in Sint Maarten.</p>',
        content: '<p>Princess Juliana International Airport (SXM) is the premier gateway to the dual-nation island of Saint Martin / Sint Maarten.</p>',
      },
    ];
    for (const page of pages) {
      await database.collection('airport_pages').insertOne({
        id: await nextId('airport_pages'),
        ...page,
        is_published: true,
        faqs,
        package_overrides: null,
        created_at: new Date(),
      });
    }
    console.log('Seeded airport pages');
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seed };
