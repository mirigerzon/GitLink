const express = require('express');
const router = express.Router();
const {
    getItemByConditions,
    createItem,
    updateItem,
    deleteItem
} = require('../../services/generic.js');
const projectsService = require('../../services/projects.js');
const { writeLog } = require('../../common/logger.js');
const {
    createConditions,
    addUserIdCondition,
    handleError,
    validateRequiredFields
} = require('../utils/routerHelpers.js');
const asyncHandler = require('../middlewares/asyncHandler');

const RESOURCE_NAME = 'projects';

router.get('/', asyncHandler(async (req, res) => {
    const conditions = createConditions(req);
    const data = await getItemByConditions(
        RESOURCE_NAME,
        conditions.length ? conditions : undefined
    );

    writeLog(`Fetched ${RESOURCE_NAME} with conditions=${JSON.stringify(conditions)}`, 'info');
    res.json(data);
}));

router.post("/", asyncHandler(async (req, res) => {
    let conditions = Object.entries(req.body).map(([key, value]) => ({
        field: key,
        value
    }));

    conditions = addUserIdCondition(req, conditions);
    const body = Object.fromEntries(conditions.map(({ field, value }) => [field, value]));

    const created = await createItem(RESOURCE_NAME, body);
    writeLog(`Created project with data=${JSON.stringify(body)}`, 'info');
    res.status(201).json({ message: 'Project created successfully', result: created });
}));

router.post("/rate", asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, ['project_id', 'rating']);

    const { project_id, rating } = req.body;
    const username = req.user?.username;

    if (!username) return res.status(401).json({ error: 'User not authenticated' });

    await projectsService.rateProject(username, project_id, rating);
    res.status(200).json({ message: 'Rating submitted successfully' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, url, details, languages } = req.body;

    if (!id) return res.status(400).json({ error: 'Project ID is required' });
    const result = await updateItem(
        RESOURCE_NAME,
        { name, url, details, languages },
        [{ field: 'id', value: id }]
    );

    writeLog(`Updated project id=${id} by user=${req.user.username}`, 'info');
    res.json({
        message: 'Project updated successfully',
        result,
        project_id: id
    });
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const baseConditions = [{ field: 'id', value: itemId }];
    const conditions = addUserIdCondition(req, baseConditions);

    const result = await deleteItem(RESOURCE_NAME, conditions);
    writeLog(`Deleted project id=${itemId}`, 'info');
    res.json({ message: 'Project deleted successfully', result });
}));

module.exports = router;