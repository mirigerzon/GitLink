const express = require('express');
const router = express.Router();
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../LOG/log.js');

router.get('/', async (req, res) => {
    try {
        const data = await dataService.getRecruiters();
        writeLog(`Fetched data from table = recruiters `, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=recruiters- ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting recruiters` });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await dataService.getRecruiter();
        writeLog(`Fetched data from table = recruiters `, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=recruiters- ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting recruiters` });
    }
});

module.exports = router;