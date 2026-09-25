const { execute } = require('./src/config/db');

async function updateDb() {
  try {
    console.log("Adding airport_id to airport_pages...");
    await execute('ALTER TABLE airport_pages ADD COLUMN airport_id INT NULL');
    console.log("Success!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
    } else {
      console.error(err);
    }
  } finally {
    process.exit();
  }
}

updateDb();
