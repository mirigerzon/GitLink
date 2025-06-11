const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../LOG/log.js');

router.get('/', async (req, res) => {
    const table = "jobs";
    try {
        const conditions = createConditions(req);
        const data = await genericDataService.getItemByConditions(table, conditions.length ? conditions : undefined);
        writeLog(`Fetched data from table=${table} with conditions=${JSON.stringify(conditions)}`, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=${table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting ${table}` });
    }
});

router.post("/", async (req, res) => {
    try {
        const table = 'jobs';
        const body = addUserIdCondition(req);
        const created = await genericDataService.createItem(table, body);
        writeLog(`Created new item in table=${table} with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Created successfully', result: created });
    } catch (err) {
        writeLog(`ERROR creating item in table=${'jobs'} - ${err.message}`, 'error');
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const baseConditions = [{ field: 'id', value: req.params.itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await genericDataService.deleteItem('jobs', conditions);
        writeLog(`Deleted itemId=${req.params.itemId} from table=${'jobs'}`, 'info');
        res.json({ message: 'Deleted successfully', result });
    } catch (err) {
        console.error(err);
        writeLog(`ERROR deleting itemId=${req.params.itemId} from table=${'jobs'} - ${err.message}`, 'error');
        res.status(500).json({ error: err.message });
    }
});

const createConditions = (req) => {
    const query = req.query;
    if (query.user_id === 'null') {
        query.user_id = req.user?.id;
    }
    let conditions = [];
    if (Object.keys(query).length > 0) {
        conditions = Object.entries(query).map(([key, value]) => ({
            field: key,
            value: isNaN(value) ? value : Number(value)
        }));
    }
    return conditions;
};

const addUserIdCondition = (req, conditions = []) => {
    const userId = req.user?.user_id;
    if (!userId) return conditions;
    // throw new Error("User not authenticated");
    const updated = [...conditions];
    if (!updated.some(cond => cond.field === 'user_id')) {
        updated.push({ field: 'user_id', value: userId });
    }
    return updated;
};

module.exports = router;