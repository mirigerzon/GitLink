const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const { getItemByConditions, createItem, deleteItem, updateItem } = require('../../services/generic.js');
const jobsService = require('../../services/jobs.js');
const { writeLog } = require('../../common/logger.js');
const { addUserIdCondition } = require('../utils/routerHelpers.js');
const RESOURCE_NAME = 'jobs';

router.get('/', asyncHandler(async (req, res) => {
    const data = await jobsService.getJobsWithApplicantsCount();
    writeLog(`Fetched ${RESOURCE_NAME}`, 'info');
    res.json(data);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        const error = new Error('job ID is required');
        error.status = 400;
        throw error;
    }
    const data = await getItemByConditions('jobs', [{ field: 'id', value: Number(id) }]);
    writeLog(`Fetched job data for id=${id}`, 'info');
    res.json(data[0]);
}));

router.post('/', asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        const error = new Error('User not authenticated');
        error.status = 401;
        throw error;
    }

    const body = { ...req.body };
    const created = await createItem(RESOURCE_NAME, body);
    writeLog(`Created job with data=${JSON.stringify(body)}`, 'info');
    res.status(201).json({ message: 'Job created successfully', result: created });
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const baseConditions = [{ field: 'id', value: itemId }];
    const conditions = addUserIdCondition(req, baseConditions);

    const result = await deleteItem(RESOURCE_NAME, conditions);
    writeLog(`Deleted job id=${itemId}`, 'info');
    res.json({ message: 'Job deleted successfully', result });
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        const error = new Error('Project ID is required');
        error.status = 400;
        throw error;
    }
    const result = await updateItem(RESOURCE_NAME, req.body, [{ field: 'id', value: id }]);

    writeLog(`Updated project id=${id} by user=${req.user.username}`, 'info');
    res.json({
        message: 'Project updated successfully',
        result,
        project_id: id
    });
}));

module.exports = router;