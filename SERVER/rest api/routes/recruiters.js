const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const recruitersService = require('../../services/recruiters.js');
const { writeLog } = require('../../common/logger.js');
const RESOURCE_NAME = 'recruiters';

router.get('/', asyncHandler(async (req, res) => {
    const data = await recruitersService.getRecruiters();
    writeLog(`Fetched ${RESOURCE_NAME} data`, 'info');
    res.json(data);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        const error = new Error(`${RESOURCE_NAME} ID is required`);
        error.status = 400;
        throw error;
    }

    const data = await recruitersService.getRecruiter(id);
    writeLog(`Fetched ${RESOURCE_NAME} data for id=${id}`, 'info');
    res.json(data);
}));

module.exports = router;