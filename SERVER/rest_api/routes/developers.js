const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const { getDevelopers, getDeveloper } = require('../../services/developers.js');
const { writeLog } = require('../../common/logger.js');
const RESOURCE_NAME = 'developers';

router.get('/', asyncHandler(async (req, res) => {
    writeLog(`Fetching all ${RESOURCE_NAME} from IP: ${req.ip}`, 'info');

    try {
        const data = await getDevelopers();
        writeLog(`Successfully fetched ${data.length} ${RESOURCE_NAME} from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch ${RESOURCE_NAME} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        writeLog(`Developer fetch failed - no ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Developer ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Fetching developer data for id: ${id} from IP: ${req.ip}`, 'info');

    try {
        const data = await getDeveloper(id);

        if (!data) {
            writeLog(`Developer not found for id: ${id} from IP: ${req.ip}`, 'warn');
            const error = new Error('Developer not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Successfully fetched developer data for id: ${id} from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch developer data for id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;