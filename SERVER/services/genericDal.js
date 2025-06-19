const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  // acquireTimeout: 60000,
  // timeout: 60000,
});

const ALLOWED_TABLES = [
  'users', 'developers', 'recruiters', 'passwords', 'roles',
  'projects', 'job_applications', 'project_ratings', 'messages', 'jobs'
];

const USER_ROLES = {
  DEVELOPER: 'developer',
  RECRUITER: 'recruiter'
};

const validateTable = (table) => { if (!ALLOWED_TABLES.includes(table)) throw new Error(`Invalid table name: ${table}`) };

const validateTables = (tables) => {
  tables.forEach(validateTable);
};

const validateConditions = (conditions) => {
  if (!Array.isArray(conditions)) throw new Error('Conditions must be an array');

  conditions.forEach(cond => {
    if (!cond.field || cond.value === undefined) throw new Error('Invalid condition: field and value are required');
  });
};

const GET = async (table, conditions = []) => {
  validateTable(table);
  validateConditions(conditions);

  let query = `SELECT * FROM \`${table}\` WHERE is_active = 1`;
  const values = [];

  if (conditions.length > 0) {
    const whereClauses = conditions.map((cond) => {
      values.push(cond.value);
      return `\`${cond.field}\` = ?`;
    });
    query += ` AND ${whereClauses.join(" AND ")}`;
  }

  try {
    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

const GET_WITH_JOINS = async (tables = [], joins = [], conditions = []) => {
  if (tables.length === 0) {
    throw new Error("At least one table is required");
  }

  validateTables(tables);
  validateConditions(conditions);

  let query = `SELECT * FROM \`${tables[0]}\``;

  for (let i = 1; i < tables.length; i++) {
    if (!joins[i - 1]) {
      throw new Error(`Missing JOIN condition between ${tables[i - 1]} and ${tables[i]}`);
    }
    query += ` JOIN \`${tables[i]}\` ON ${joins[i - 1]}`;
  }

  const values = [];
  const whereClauses = [`\`${tables[0]}\`.is_active = 1`];

  conditions.forEach(cond => {
    whereClauses.push(`\`${cond.field}\` = ?`);
    values.push(cond.value);
  });

  query += ` WHERE ${whereClauses.join(" AND ")}`;

  try {
    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

const CREATE = async (table, data) => {
  validateTable(table);

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is required for CREATE operation');
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map(() => "?");

  const sql = `INSERT INTO \`${table}\` (\`${fields.join("`, `")}\`) VALUES (${placeholders.join(", ")})`;

  try {
    const [result] = await pool.query(sql, values);
    return result;
  } catch (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }
};

const UPDATE = async (table, data, conditions = []) => {
  validateTable(table);
  validateConditions(conditions);

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is required for UPDATE operation');
  }

  if (conditions.length === 0) {
    throw new Error('Conditions are required for UPDATE operation');
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ");
  const whereClauses = conditions.map((c) => `\`${c.field}\` = ?`).join(" AND ");
  const whereValues = conditions.map((c) => c.value);

  const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClauses}`;

  try {
    const [result] = await pool.query(sql, [...values, ...whereValues]);
    return result;
  } catch (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }
};

const DELETE = async (table, conditions = []) => {
  validateTable(table);
  validateConditions(conditions);

  if (conditions.length === 0) {
    throw new Error('Conditions are required for DELETE operation');
  }

  const whereClauses = conditions.map((c) => `\`${c.field}\` = ?`).join(" AND ");
  const whereValues = conditions.map((c) => c.value);
  const sql = `UPDATE \`${table}\` SET is_active = FALSE WHERE ${whereClauses}`;

  try {
    const [result] = await pool.query(sql, whereValues);
    return result;
  } catch (error) {
    throw new Error(`Database delete failed: ${error.message}`);
  }
};

const updateAndInformUser = async (table, data, conditions = [], messageData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const updateSql = `UPDATE \`${table}\` SET ${Object.keys(data).map(f => `\`${f}\` = ?`).join(", ")} WHERE ${conditions.map(c => `\`${c.field}\` = ?`).join(" AND ")}`;
    const updateParams = [...Object.values(data), ...conditions.map(c => c.value)];

    const insertSql = `INSERT INTO messages (user_id, email, title, content) VALUES (?, ?, ?, ?)`;
    const insertParams = [messageData.user_id, messageData.email, messageData.title, messageData.content];

    await connection.query(updateSql, updateParams);
    await connection.query(insertSql, insertParams);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};



module.exports = {
  GET,
  GET_WITH_JOINS,
  CREATE,
  UPDATE,
  DELETE,
  updateAndInformUser,
};
