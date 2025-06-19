const dal = require('../services/genericDal');
const bcrypt = require('bcrypt');

const getItemByConditions = async (table, conditions = []) => {
  const res = await dal.GET(table, conditions);
  return res || null;
};

const deleteItem = async (table, conditions = []) => {
  return await dal.DELETE(table, conditions);
};

const createItem = async (table, data) => {
  if (Array.isArray(data)) {
    data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
  }
  return await dal.CREATE(table, data);
};

const updateItem = async (table, data, conditions = []) => {
  return await dal.UPDATE(table, data, conditions);
};


module.exports = {
  getItemByConditions,
  deleteItem,
  createItem,
  updateItem,
};
