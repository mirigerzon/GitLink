const express = require('express');
const router = express.Router();
const recruitersService = require('../../services/recruiters.js');
const { writeLog } = require('../../log/log.js');
const { handleError } = require('../utils/routerHelpers.js');

router.get('/', async (req, res) => {
    try {
        const data = await recruitersService.getRecruiters();
        writeLog('Fetched recruiters data', 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'recruiters', 'fetching');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Recruiter ID is required' });

        const data = await recruitersService.getRecruiter(id);
        writeLog(`Fetched recruiter data for id=${id}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'recruiter', 'fetching');
    }
});

module.exports = router;