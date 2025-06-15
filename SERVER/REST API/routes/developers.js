const express = require('express');
const router = express.Router();
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');

router.get('/', async (req, res) => {
    try {
        const data = await dataService.getDevelopers();
        writeLog(`Fetched data from table = developers `, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=developers- ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting developers` });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await dataService.getDeveloper();
        writeLog(`Fetched data from table = developers `, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=developers- ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting developers` });
    }
});

module.exports = router;