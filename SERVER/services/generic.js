const generic = require('../repositories/generic');

const getItemByConditions = async (table, conditions = []) => {
  if (!table) {
    throw new Error('Table name is required');
  }

  try {
    const result = await generic.GET(table, conditions);
    return result || [];
  } catch (error) {
    console.error(`Error fetching items from ${table}:`, error);
    throw new Error(`Failed to fetch items from ${table}`);
  }
};

const deleteItem = async (table, conditions = []) => {
  if (!table) {
    throw new Error('Table name is required');
  }

  if (!conditions || conditions.length === 0) {
    throw new Error('Conditions are required for delete operation');
  }

  try {
    const result = await generic.DELETE(table, conditions);
    return result;
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error);
    throw new Error(`Failed to delete item from ${table}`);
  }
};

const createItem = async (table, data) => {
  if (!table) {
    throw new Error('Table name is required');
  }

  if (!data) {
    throw new Error('Data is required for create operation');
  }

  try {
    if (Array.isArray(data)) {
      data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
    }

    const result = await generic.CREATE(table, data);
    return result;
  } catch (error) {
    console.error(`Error creating item in ${table}:`, error);
    throw new Error(`Failed to create item in ${table}`);
  }
};

const updateItem = async (table, data, conditions = []) => {
  if (!table) {
    throw new Error('Table name is required');
  }

  if (!data) {
    throw new Error('Data is required for update operation');
  }

  if (!conditions || conditions.length === 0) {
    throw new Error('Conditions are required for update operation');
  }

  try {
    const result = await generic.UPDATE(table, data, conditions);
    return result;
  } catch (error) {
    console.error(`Error updating item in ${table}:`, error);
    throw new Error(`Failed to update item in ${table}`);
  }
};

module.exports = {
  getItemByConditions,
  deleteItem,
  createItem,
  updateItem,
};