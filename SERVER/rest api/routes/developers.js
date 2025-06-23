const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const { getDevelopers, getDeveloper } = require('../../services/developers.js');
const { writeLog } = require('../../common/logger.js');
const RESOURCE_NAME = 'developers';

router.get('/', asyncHandler(async (req, res) => {
    const data = await getDevelopers();
    writeLog(`Fetched data from RESOURCE = ${RESOURCE_NAME}`, 'info');
    res.json(data);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        const error = new Error('Developer ID is required');
        error.status = 400;
        throw error;
    }

    const data = await getDeveloper(id);
    writeLog(`Fetched developer data for id=${id}`, 'info');
    res.json(data);
}));

module.exports = router;