// dal/mongoConnect.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;

async function connectToMongo() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME);
  console.log("Connected to MongoDB");
}

function getDb() {
  if (!db) throw new Error("MongoDB not connected");
  return db;
}

module.exports = { connectToMongo, getDb };
