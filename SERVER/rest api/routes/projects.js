const express = require('express');
const router = express.Router();
const {
    getItemByConditions,
    createItem,
    updateItem,
    deleteItem
} = require('../../services/generic.js');
const projectsService = require('../../services/projects.js');
const { writeLog } = require('../../log/log.js');
const {
    createConditions,
    addUserIdCondition,
    handleError,
    validateRequiredFields
} = require('../utils/routerHelpers.js');

const RESOURCE_NAME = 'projects';

router.get('/', async (req, res) => {
    try {
        const conditions = createConditions(req);
        const data = await getItemByConditions(
            RESOURCE_NAME,
            conditions.length ? conditions : undefined
        );

        writeLog(`Fetched ${RESOURCE_NAME} with conditions=${JSON.stringify(conditions)}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'fetching');
    }
});

router.post("/", async (req, res) => {
    try {
        let conditions = Object.entries(req.body).map(([key, value]) => ({
            field: key,
            value
        }));

        conditions = addUserIdCondition(req, conditions);
        const body = Object.fromEntries(conditions.map(({ field, value }) => [field, value]));

        const created = await createItem(RESOURCE_NAME, body);
        writeLog(`Created project with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Project created successfully', result: created });
    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'creating');
    }
});

router.post("/rate", async (req, res) => {
    try {
        validateRequiredFields(req.body, ['project_id', 'rating']);

        const { project_id, rating } = req.body;
        const username = req.user?.username;

        if (!username) return res.status(401).json({ error: 'User not authenticated' });

        await projectsService.rateProject(username, project_id, rating);
        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
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

    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'updating project');
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);

        const result = await deleteItem(RESOURCE_NAME, conditions);
        writeLog(`Deleted project id=${itemId}`, 'info');
        res.json({ message: 'Project deleted successfully', result });
    } catch (err) {
        handleError(res, err, RESOURCE_NAME, 'deleting');
    }
});

module.exports = router;