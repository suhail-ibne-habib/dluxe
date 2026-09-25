const { execute } = require('../config/db');
require('dotenv').config({ path: '../../.env' });

async function updateSMTPSettings() {
  const settings = {
    'smtp_host': 'smtp-relay.brevo.com',
    'smtp_port': '587',
    'smtp_user': process.env.SMTP_USER || '',
    'smtp_pass': process.env.SMTP_PASS || '',
    'smtp_secure': 'false'
  };

  console.log('Updating SMTP settings in database...');

  try {
    for (const [key, value] of Object.entries(settings)) {
      const sql = `
        INSERT INTO settings (setting_key, setting_value) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE setting_value = ?
      `;
      await execute(sql, [key, value, value]);
      console.log(`Updated ${key}`);
    }
    console.log('Successfully updated all SMTP settings.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating settings:', error);
    process.exit(1);
  }
}

updateSMTPSettings();
