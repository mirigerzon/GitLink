const express = require('express');
const router = express.Router();
const dataService = require('../../BL/bl');
const { writeLog } = require('../../log'); 

router.delete('/:table/:itemId', async (req, res) => {
  try {
    const baseConditions = [{ field: 'id', value: req.params.itemId }];
    const conditions = addUserIdConditions(req, baseConditions);
    const result = await dataService.deleteItem(req.params.table, conditions);
    writeLog(`Deleted itemId=${req.params.itemId} from table=${req.params.table}`, 'info');
    res.json({ message: 'Deleted successfully', result });
  } catch (err) {
    console.error(err);
    writeLog(`ERROR deleting itemId=${req.params.itemId} from table=${req.params.table} - ${err.message}`, 'error'); 
    res.status(500).json({ error: `ERROR deleting from ${req.params.table}` });
  }
});

router.delete('/:parentTable/:parentId/:childTable/:childId', async (req, res) => {
  const parentField = `${req.params.parentTable.slice(0, -1)}_id`;
  try {
    const baseConditions = [
      { field: 'id', value: req.params.childId },
      { field: parentField, value: req.params.parentId }
    ];
    const conditions = addUserIdConditions(req, baseConditions);
    const result = await dataService.deleteItem(req.params.childTable, conditions);
    writeLog(`Deleted childId=${req.params.childId} from childTable=${req.params.childTable} with parentId=${req.params.parentId}`, 'info');
    res.json({ message: 'Deleted successfully', result });
  } catch (err) {
    console.error(err);
    writeLog(`ERROR deleting childId=${req.params.childId} from childTable=${req.params.childTable} - ${err.message}`, 'error'); 
    res.status(500).json({ error: `ERROR deleting from ${req.params.childTable}` });
  }
});

const addUserIdConditions = (req, conditions = []) => {
  if (req.body != undefined && req.body.user_id === 'null') {
    conditions.push({ field: 'user_id', value: req.user.id });
  }
  return conditions;
};

module.exports = router;