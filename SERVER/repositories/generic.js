const pool = require("./mysqlPool");

const ALLOWED_TABLES = [
  'users', 'developers', 'recruiters', 'passwords', 'roles',
  'projects', 'job_applications', 'project_ratings', 'messages', 'jobs'
];

const validateTable = (table) => {
  if (!table) {
    throw new Error('Table name is required');
  }
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
};

const validateTables = (tables) => {
  if (!Array.isArray(tables) || tables.length === 0) {
    throw new Error('Tables must be a non-empty array');
  }
  tables.forEach(validateTable);
};

const validateConditions = (conditions) => {
  if (!Array.isArray(conditions)) {
    throw new Error('Conditions must be an array');
  }

  conditions.forEach(cond => {
    if (!cond || typeof cond !== 'object') {
      throw new Error('Invalid condition: must be an object');
    }
    if (!cond.field || cond.value === undefined) {
      throw new Error('Invalid condition: field and value are required');
    }
  });
};

const validateData = (data) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    throw new Error('Data is required and must be a non-empty object');
  }
};

const GET = async (table, conditions = []) => {
  try {
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

    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    console.error('Error in GET:', error.message);
    throw new Error(`Database query failed: ${error.message}`);
  }
};

const GET_WITH_JOINS = async (tables = [], joins = [], conditions = [], check_status = true) => {
  try {
    validateTables(tables);
    validateConditions(conditions);

    if (joins.length !== tables.length - 1) {
      throw new Error(`JOIN conditions count (${joins.length}) must equal tables count minus 1 (${tables.length - 1})`);
    }

    let query = `SELECT * FROM \`${tables[0]}\``;

    for (let i = 1; i < tables.length; i++) {
      if (!joins[i - 1] || typeof joins[i - 1] !== 'string') {
        throw new Error(`Invalid JOIN condition between ${tables[i - 1]} and ${tables[i]}`);
      }
      query += ` JOIN \`${tables[i]}\` ON ${joins[i - 1]}`;
    }

    const values = [];
    const whereClauses = [`\`${tables[0]}\`.is_active = 1`];

    if (check_status) {
      whereClauses.push(`\`${tables[0]}\`.status = 1`);
    }

    conditions.forEach(cond => {
      whereClauses.push(`\`${cond.field}\` = ?`);
      values.push(cond.value);
    });

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }


    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    console.error('Error in GET_WITH_JOINS:', error.message);
    throw new Error(`Database query with joins failed: ${error.message}`);
  }
};

const CREATE = async (table, data) => {
  try {
    validateTable(table);
    validateData(data);

    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => "?");

    const sql = `INSERT INTO \`${table}\` (\`${fields.join("`, `")}\`) VALUES (${placeholders.join(", ")})`;

    const [result] = await pool.query(sql, values);
    return result;
  } catch (error) {
    console.error('Error in CREATE:', error.message);
    throw new Error(`Database insert failed: ${error.message}`);
  }
};

const UPDATE = async (table, data, conditions = []) => {
  try {
    validateTable(table);
    validateData(data);
    validateConditions(conditions);

    if (conditions.length === 0) {
      throw new Error('Conditions are required for UPDATE operation');
    }

    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ");
    const whereClauses = conditions.map((c) => `\`${c.field}\` = ?`).join(" AND ");
    const whereValues = conditions.map((c) => c.value);

    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClauses}`;

    const [result] = await pool.query(sql, [...values, ...whereValues]);
    return result;
  } catch (error) {
    console.error('Error in UPDATE:', error.message);
    throw new Error(`Database update failed: ${error.message}`);
  }
};

const DELETE = async (table, conditions = []) => {
  try {
    validateTable(table);
    validateConditions(conditions);

    if (conditions.length === 0) {
      throw new Error('Conditions are required for DELETE operation');
    }

    const whereClauses = conditions.map((c) => `\`${c.field}\` = ?`).join(" AND ");
    const whereValues = conditions.map((c) => c.value);
    const sql = `UPDATE \`${table}\` SET is_active = FALSE WHERE ${whereClauses}`;

    const [result] = await pool.query(sql, whereValues);
    return result;
  } catch (error) {
    console.error('Error in DELETE:', error.message);
    throw new Error(`Database soft delete failed: ${error.message}`);
  }
};

module.exports = {
  GET,
  GET_WITH_JOINS,
  CREATE,
  UPDATE,
  DELETE,
};