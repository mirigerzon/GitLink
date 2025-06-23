const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const recruitersService = require('../../services/recruiters.js');
const { writeLog } = require('../../common/logger.js');
const RESOURCE_NAME = 'recruiters';

router.get('/', asyncHandler(async (req, res) => {
    writeLog(`Fetching all ${RESOURCE_NAME} from IP: ${req.ip}`, 'info');

    try {
        const data = await recruitersService.getRecruiters();
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
        writeLog(`${RESOURCE_NAME} fetch failed - no ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error(`${RESOURCE_NAME} ID is required`);
        error.status = 400;
        throw error;
    }

    writeLog(`Fetching ${RESOURCE_NAME} data for id: ${id} from IP: ${req.ip}`, 'info');

    try {
        const data = await recruitersService.getRecruiter(id);

        if (!data) {
            writeLog(`${RESOURCE_NAME} not found for id: ${id} from IP: ${req.ip}`, 'warn');
            const error = new Error(`${RESOURCE_NAME} not found`);
            error.status = 404;
            throw error;
        }

        writeLog(`Successfully fetched ${RESOURCE_NAME} data for id: ${id} from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch ${RESOURCE_NAME} data for id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;