const dns = require('dns');
const { MongoClient } = require('mongodb');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const user = encodeURIComponent(process.env.DB_USER || '');
  const pass = encodeURIComponent(process.env.DB_PASSWORD || '');
  const name = process.env.DB_NAME || 'dluxe';
  return `mongodb+srv://${user}:${pass}@cluster0.x73jxvb.mongodb.net/${name}?retryWrites=true&w=majority&appName=Cluster0`;
}

const client = new MongoClient(mongoUri());
const databaseName = process.env.DB_NAME || 'dluxe';
let connected = false;

async function connect() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db(databaseName);
}

function db() {
  return client.db(databaseName);
}

async function nextId(name) {
  const row = await db().collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return row?.seq ?? row?.value?.seq;
}

function num(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}

module.exports = { client, connect, db, nextId, num };
