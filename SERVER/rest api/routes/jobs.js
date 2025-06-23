const express = require('express');
const router = express.Router();
const {
    getItemByConditions,
    createItem,
    deleteItem,
    updateItem
} = require('../../services/generic.js'); const jobsService = require('../../services/jobs.js');
const { writeLog } = require('../../log/log.js');
const {
    addUserIdCondition,
    handleError
} = require('../utils/routerHelpers.js');

const RESOURCE_NAME = 'jobs';

router.get('/', async (req, res) => {
    try {
        const data = await jobsService.getJobsWithApplicantsCount()

        writeLog(`Fetched ${RESOURCE_NAME}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'fetching');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'job ID is required' });
        const data = await getItemByConditions('jobs', [{ field: 'id', value: Number(id) }]);
        writeLog(`Fetched job data for id=${id}`, 'info');
        res.json(data[0]);
    } catch (err) {
        handleError(res, err, 'job', 'fetching');
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'User not authenticated' });

        const body = { ...req.body };
        const created = await createItem(RESOURCE_NAME, body);
        writeLog(`Created job with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Job created successfully', result: created });
    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'creating');
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);

        const result = await deleteItem(RESOURCE_NAME, conditions);
        writeLog(`Deleted job id=${itemId}`, 'info');
        res.json({ message: 'Job deleted successfully', result });
    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'deleting');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Project ID is required' });
        const result = await updateItem(
            RESOURCE_NAME,
            req.body,
            [{ field: 'id', value: id }]
        );

        writeLog(`Updated project id=${id} by user=${req.user.username}`, 'info');
        res.json({
            message: 'Project updated successfully',
            result,
            project_id: id
        });

    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'updating project');
    }
});

module.exports = router;