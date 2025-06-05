const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../../dataBase/LOG/log.js');

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

router.post('/:table', async (req, res) => {
    try {
        const body = addUserIdCondition(req);
        const created = await dataService.createItem(req.params.table, body);
        writeLog(`Created new item in table=${req.params.table} with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Created successfully', result: created });
    } catch (err) {
        console.error(err);
        writeLog(`ERROR creating item in table=${req.params.table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR inserting into ${req.params.table}` });
    }
});

router.post("/projects/rate", async (req, res) => {
    try {
        const userGitName = req.user.git_name;
        const { project_id, rating } = req.body;
        if (!project_id || !rating) throw new Error("Missing parameters.");

        await dataService.rateProject(userGitName, project_id, rating);
        res.status(200).json({ message: "Rating submitted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const addUserIdCondition = (req) => {
    const body = { ...req.body };
    if (body.user_id === 'null') {
        body.user_id = req.user?.id;
    }
    return body;
};

module.exports = router;