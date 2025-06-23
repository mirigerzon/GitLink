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

router.put('/notify', asyncHandler(async (req, res) => {
    const result = await jobApplicationsService.notifyApplicant(req.body);
    res.json({ message: 'Email sent successfully', result });
}));

router.put('/:job_application_id', asyncHandler(async (req, res) => {
    const { user_id, ...body } = req.body;
    const result = await updateItem(
        RESOURCE_NAME,
        body,
        [
            { field: 'job_id', value: Number(req.params.job_application_id) },
            { field: 'user_id', value: user_id }
        ]
    );
    writeLog(`Updated message for user=${req.body.email}`, 'info');
    res.json({ message: 'Message updated successfully', result });
}));

router.put('/reject/:job_id', asyncHandler(async (req, res) => {
    const { job_id } = req.params;
    const result = await jobApplicationsService.rejectApplicant(req.body, Number(job_id));
    writeLog(`reject application for job id=${job_id}`, 'info');
    res.json({ message: 'Application reject successfully', result });
}));

module.exports = router;