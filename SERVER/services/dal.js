// dal/mongoDal.js
const { ObjectId } = require('mongodb');
const { getDb } = require('./mongoConnect');

const GET = async (collection, conditions = {}) => {
  const db = getDb();
  const filter = { is_active: true, ...conditions };
  return await db.collection(collection).find(filter).toArray();
};

module.exports = {
  GET,
};
