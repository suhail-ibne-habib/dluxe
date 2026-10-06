const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skyview',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 1,
  idleTimeout: 15000,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

const RETRYABLE = new Set(['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'EPIPE', 'ETIMEDOUT']);

async function withRetry(run) {
  try {
    return await run();
  } catch (error) {
    if (!RETRYABLE.has(error.code)) throw error;
    return run();
  }
}

async function query(sql, params = []) {
  const [rows] = await withRetry(() => pool.execute(sql, params));
  return rows;
}

async function execute(sql, params = []) {
  const [result] = await withRetry(() => pool.execute(sql, params));
  return result;
}

module.exports = {
  pool,
  query,
  execute
};
