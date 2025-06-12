const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../LOG/log.js');

router.get('/', async (req, res) => {
    const table = "messages";
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

router.put("/", async (req, res) => {
    try {
        const body = req.body;
        const result = await genericDataService.updateItem(
            'messages',
            body,
            [{ field: 'email', value: req.user.email }] //לעשות שהוא יבדוק אם מי שביקש הוא המשתמש הנוכחי
        );
        writeLog(`Updated messager for user= ${body} with data=${JSON.stringify(body)}`, 'info');
        res.json(result);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR updating email= in table='messages' - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR updating 'messages' item` });
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const baseConditions = [{ field: 'id', value: req.params.itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await genericDataService.deleteItem('messages', conditions);
        writeLog(`Deleted itemId=${req.params.itemId} from table=${'messages'}`, 'info');
        res.json({ message: 'Deleted successfully', result });
    } catch (err) {
        console.error(err);
        writeLog(`ERROR deleting itemId=${req.params.itemId} from table=${'messages'} - ${err.message}`, 'error');
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