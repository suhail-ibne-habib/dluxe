const { db } = require('./db');

async function ensureSchema() {
  const database = db();
  await Promise.all([
    database.collection('locations').createIndex({ id: 1 }, { unique: true }),
    database.collection('packages').createIndex({ id: 1 }, { unique: true }),
    database.collection('airport_pages').createIndex({ slug: 1 }, { unique: true }),
    database.collection('airlines').createIndex({ name: 1 }, { unique: true }),
    database.collection('settings').createIndex({ key: 1 }, { unique: true }),
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
  ]);

  const locations = await database.collection('locations').countDocuments();
  if (locations === 0) {
    const { seed } = require('../scripts/seed');
    await seed();
  }
}

module.exports = { ensureSchema };
