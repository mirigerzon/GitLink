const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../LOG/log.js');

router.get('/', async (req, res) => {
    const table = "users";
    try {
        const data = await dataService.getUser(req.params.id);
        writeLog(`Fetched data from table=${table}`, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=${table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting ${table}` });
    }
});

router.get('/:username', async (req, res) => {
    const table = "users";
    try {
        const data = await dataService.getUser(req.params.username);
        writeLog(`Fetched data from table=${table} `, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=${table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting ${table}` });
    }
});

router.post("/rate", async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { project_id, rating } = req.body;
        if (!project_id || !rating) throw new Error("Missing parameters.");

        await dataService.rateProject(userEmail, project_id, rating);
        res.status(200).json({ message: "Rating submitted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
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

module.exports = router;