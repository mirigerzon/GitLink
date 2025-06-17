const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');

router.get('/:id', async (req, res) => {
    const table = "job_applications";
    try {
        const data = await dataService.getJobApplications(req.params.id);
        writeLog(`Fetched data from table=${table}`, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=${table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting ${table}` });
    }
});

router.post("/", async (req, res) => {
    try {
        const table = 'job_applications';
        const body = { 'job_id': req.body.job_id, 'user_id': req.body.user_id };
        const created = await dataService.createApply(body, req.body.email);
        writeLog(`Created new item in table=${table} with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Created successfully', result: created });
    } catch (err) {
        writeLog(`ERROR creating item in table=${'job_applications'} - ${err.message}`, 'error');
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const baseConditions = [{ field: 'id', value: req.params.itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await genericDataService.deleteItem('job_applications', conditions);
        writeLog(`Deleted itemId=${req.params.itemId} from table=${'job_applications'}`, 'info');
        res.json({ message: 'Deleted successfully', result });
    } catch (err) {
        console.error(err);
        writeLog(`ERROR deleting itemId=${req.params.itemId} from table=${'job_applications'} - ${err.message}`, 'error');
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
    const user_id = req.user?.id;
    if (!user_id) return conditions;
    // throw new Error("User not authenticated");
    const updated = [...conditions];
    if (!updated.some(cond => cond.field === 'user_id')) {
        updated.push({ field: 'user_id', value: user_id });
    }
    return updated;
};

module.exports = router;