const express = require('express');
const router = express.Router();
const { deleteItem, updateItem } = require('../../services/generic.js');
const jobApplicationsService = require('../../services/job_applications.js');
const { writeLog } = require('../../common/logger.js');
const { addUserIdCondition, handleError, validateRequiredFields } = require('../utils/routerHelpers.js');
const asyncHandler = require('../middlewares/asyncHandler');

const RESOURCE_NAME = 'job_applications';

router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        writeLog(`Job applications fetch failed - no job ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Job ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Fetching job applications for job id: ${id} from IP: ${req.ip}`, 'info');

    try {
        const data = await jobApplicationsService.getJobApplications(id);
        writeLog(`Successfully fetched ${data.length} job applications for job id: ${id} from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch job applications for job id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.post('/', asyncHandler(async (req, res) => {
    const { job_id, user_id, email } = req.body;

    if (!job_id || !user_id || !email) {
        writeLog(`Job application creation failed - missing required fields from IP: ${req.ip}`, 'warn');
        const error = new Error('job_id, user_id, and email are required');
        error.status = 400;
        throw error;
    }

    jobApplicationsService.checkUserOwnership(req, user_id, 'job application');

    writeLog(`Creating job application for user: ${user_id} to job: ${job_id} from IP: ${req.ip}`, 'info');

    try {
        const applicationData = { job_id, user_id };
        const created = await jobApplicationsService.createApply(applicationData, email);
        writeLog(`Job application created successfully for user: ${user_id} to job: ${job_id} from IP: ${req.ip}`, 'info');
        res.status(201).json({ message: 'Application submitted successfully', result: created });
    } catch (error) {
        writeLog(`Failed to create job application for user: ${user_id} to job: ${job_id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId) {
        writeLog(`Job application deletion failed - no application ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Application ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Deleting job application id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await deleteItem(RESOURCE_NAME, conditions);

        if (!result) {
            writeLog(`Job application not found for deletion - id: ${itemId} from IP: ${req.ip}`, 'warn');
            const error = new Error('Application not found or access denied');
            error.status = 404;
            throw error;
        }

        writeLog(`Job application deleted successfully - id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({ message: 'Application deleted successfully', result });
    } catch (error) {
        writeLog(`Failed to delete job application id: ${itemId} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/:job_id', asyncHandler(async (req, res) => {
    const { job_id } = req.params;
    const { action, ...data } = req.body;

    if (!job_id) {
        writeLog(`Job application update failed - no job ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Job ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Processing job application action: ${action} for job: ${job_id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        switch (action) {
            case 'notify':
                const notifyResult = await jobApplicationsService.notifyApplicant(data);
                writeLog(`Notification sent successfully for job application - job: ${job_id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
                return res.json({ message: 'Email sent successfully', result: notifyResult });

            case 'reject':
                const rejectResult = await jobApplicationsService.rejectApplicant(data, Number(job_id));
                writeLog(`Job application rejected successfully - job: ${job_id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
                return res.json({ message: 'Application rejected successfully', result: rejectResult });

            case 'update':
            default:
                const { user_id, ...body } = data;
                if (!user_id) {
                    writeLog(`Job application update failed - no user ID provided for job: ${job_id} from IP: ${req.ip}`, 'warn');
                    const error = new Error('User ID is required for update');
                    error.status = 400;
                    throw error;
                }

                const updateResult = await updateItem(
                    RESOURCE_NAME,
                    body,
                    [
                        { field: 'job_id', value: Number(job_id) },
                        { field: 'user_id', value: user_id }
                    ]
                );
                writeLog(`Job application updated successfully - job: ${job_id}, user: ${user_id} by: ${req.user?.username} from IP: ${req.ip}`, 'info');
                return res.json({ message: 'Application updated successfully', result: updateResult });
        }
    } catch (error) {
        writeLog(`Failed to process job application action: ${action} for job: ${job_id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;