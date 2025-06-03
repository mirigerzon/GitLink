const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

const GET = async (table, conditions = []) => {
  let query = `SELECT * FROM gitlink.${table} WHERE is_active = 1`;
  const values = [];
  if (conditions.length > 0) {
    const whereClauses = conditions.map(cond => {
      values.push(cond.value);
      return `${cond.field} = ?`;
    });
    query += ` AND ${whereClauses.join(' AND ')}`;
  }
  const [results] = await pool.query(query, values);
  return results;
};

const POST = async (table, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map(() => '?');
  const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
  const [result] = await pool.query(sql, values); 
  return result;
};

module.exports = {
  GET,
  POST,
};
