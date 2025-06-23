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
    if (!id) return res.status(400).json({ error: 'Job ID is required' });

    const data = await jobApplicationsService.getJobApplications(id);
    writeLog(`Fetched ${RESOURCE_NAME} for job id=${id}`, 'info');
    res.json(data);
}));

router.post('/', asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, ['job_id', 'user_id', 'email']);

    const { job_id, user_id, email } = req.body;

    if (req.user?.id && req.user.id !== user_id) return res.status(403).json({ error: 'You can only apply for yourself' });

    const applicationData = { job_id, user_id };
    const created = await jobApplicationsService.createApply(applicationData, email);
    writeLog(`Created job application: ${JSON.stringify(applicationData)}`, 'info');
    res.status(201).json({ message: 'Application submitted successfully', result: created });
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const baseConditions = [{ field: 'id', value: itemId }];
    const conditions = addUserIdCondition(req, baseConditions);
    const result = await deleteItem(RESOURCE_NAME, conditions);
    writeLog(`Deleted job application id=${itemId}`, 'info');
    res.json({ message: 'Application deleted successfully', result });
}));

// Generic PUT route for updating job applications
router.put('/:job_application_id', asyncHandler(async (req, res) => {
    const { action, ...data } = req.body;

    switch (action) {
        case 'notify':
            const notifyResult = await jobApplicationsService.notifyApplicant(data);
            writeLog(`Sent notification for application id=${req.params.job_application_id}`, 'info');
            return res.json({ message: 'Email sent successfully', result: notifyResult });

        case 'reject':
            const rejectResult = await jobApplicationsService.rejectApplicant(data, Number(req.params.job_application_id));
            writeLog(`Rejected application id=${req.params.job_application_id}`, 'info');
            return res.json({ message: 'Application rejected successfully', result: rejectResult });

        case 'update':
        default:
            const { user_id, ...body } = data;
            const updateResult = await updateItem(
                RESOURCE_NAME,
                body,
                [
                    { field: 'job_id', value: Number(req.params.job_application_id) },
                    { field: 'user_id', value: user_id }
                ]
            );
            writeLog(`Updated application id=${req.params.job_application_id}`, 'info');
            return res.json({ message: 'Application updated successfully', result: updateResult });
    }
}));

module.exports = router;