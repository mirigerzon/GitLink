const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const { getItemByConditions, createItem, deleteItem, updateItem } = require('../../services/generic.js');
const jobsService = require('../../services/jobs.js');
const { writeLog } = require('../../common/logger.js');
const { addUserIdCondition } = require('../utils/routerHelpers.js');
const RESOURCE_NAME = 'jobs';

router.get('/', asyncHandler(async (req, res) => {
    writeLog(`Fetching all jobs with applicants count from IP: ${req.ip}`, 'info');

    try {
        const data = await jobsService.getJobsWithApplicantsCount();
        writeLog(`Successfully fetched ${data.length} jobs from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch jobs from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        writeLog(`Job fetch failed - no job ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Job ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Fetching job data for id: ${id} from IP: ${req.ip}`, 'info');

    try {
        const data = await getItemByConditions('jobs', [{ field: 'id', value: Number(id) }]);

        if (!data || data.length === 0) {
            writeLog(`Job not found for id: ${id} from IP: ${req.ip}`, 'warn');
            const error = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Successfully fetched job data for id: ${id} from IP: ${req.ip}`, 'info');
        res.json(data[0]);
    } catch (error) {
        writeLog(`Failed to fetch job data for id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.post('/', asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        writeLog(`Job creation failed - user not authenticated from IP: ${req.ip}`, 'warn');
        const error = new Error('User not authenticated');
        error.status = 401;
        throw error;
    }

    const { title, details, company_name } = req.body;
    if (!title || !details || !company_name) {
        writeLog(`Job creation failed - missing required fields by user: ${req.user.username} from IP: ${req.ip}`, 'warn');
        const error = new Error('Title, description, and company are required');
        error.status = 400;
        throw error;
    }

    writeLog(`Creating new job by user: ${req.user.username} from IP: ${req.ip}`, 'info');

    try {
        const body = { ...req.body };
        const created = await createItem(RESOURCE_NAME, body);
        writeLog(`Job created successfully - id: ${created.id} by user: ${req.user.username} from IP: ${req.ip}`, 'info');
        res.status(201).json({ message: 'Job created successfully', result: created });
    } catch (error) {
        writeLog(`Failed to create job by user: ${req.user.username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId) {
        writeLog(`Job deletion failed - no job ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Job ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Deleting job id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await deleteItem(RESOURCE_NAME, conditions);

        if (!result) {
            writeLog(`Job not found for deletion - id: ${itemId} from IP: ${req.ip}`, 'warn');
            const error = new Error('Job not found or access denied');
            error.status = 404;
            throw error;
        }

        writeLog(`Job deleted successfully - id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({ message: 'Job deleted successfully', result });
    } catch (error) {
        writeLog(`Failed to delete job id: ${itemId} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        writeLog(`Job update failed - no job ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Job ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Updating job id: ${id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const result = await updateItem(RESOURCE_NAME, req.body, [{ field: 'id', value: id }]);

        if (!result) {
            writeLog(`Job not found for update - id: ${id} from IP: ${req.ip}`, 'warn');
            const error = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Job updated successfully - id: ${id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({
            message: 'Job updated successfully',
            result,
            job_id: id
        });
    } catch (error) {
        writeLog(`Failed to update job id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;