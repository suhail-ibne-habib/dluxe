const { query, execute } = require('./db');

async function columnExists(table, column) {
  const rows = await query(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].total) > 0;
}

async function ensureColumn(table, column, definition) {
  if (await columnExists(table, column)) return;
  await execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`Added ${table}.${column}`);
}

async function ensureSchema() {
  await execute(`
    CREATE TABLE IF NOT EXISTS airlines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      code VARCHAR(10) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const existing = await query('SELECT COUNT(*) AS total FROM airlines');
  if (Number(existing[0].total) === 0) {
    const starters = [
      ['Delta Airlines', 'DL'],
      ['American Airlines', 'AA'],
      ['United Airlines', 'UA'],
      ['KLM Royal Dutch Airlines', 'KL'],
    ];
    for (const [name, code] of starters) {
      await execute('INSERT INTO airlines (name, code) VALUES (?, ?)', [name, code]);
    }
    console.log('Seeded airlines');
  }

  await ensureColumn('airports', 'note', 'TEXT NULL');
  await ensureColumn('reservations', 'package_id', 'INT NULL');
  await ensureColumn('airport_pages', 'airport_id', 'INT NULL');
  await ensureColumn('airport_pages', 'additional_info', 'TEXT NULL');
  await ensureColumn('airport_pages', 'package_overrides', 'LONGTEXT NULL');

  const serviceLevel = await query(
    `SELECT DATA_TYPE, COLUMN_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservations' AND COLUMN_NAME = 'service_level'`
  );
  if (serviceLevel[0] && String(serviceLevel[0].COLUMN_TYPE).toLowerCase().startsWith('enum')) {
    await execute('ALTER TABLE reservations MODIFY service_level VARCHAR(255) NOT NULL');
    console.log('Widened reservations.service_level so package names can be stored');
  }
}

module.exports = { ensureSchema };
