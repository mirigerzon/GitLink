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
} = require('../utils/routerHelpers.js');
const asyncHandler = require('../middlewares/asyncHandler');
const RESOURCE_NAME = 'projects';

router.get('/', asyncHandler(async (req, res) => {
    const { username } = req.query;
    writeLog(`Fetching projects from IP: ${req.ip}`, 'info');

    try {
        const conditions = createConditions(req);
        if (username)
            conditions.push({ field: 'username', value: username });

        const data = await getItemByConditions(
            RESOURCE_NAME,
            conditions.length ? conditions : undefined
        );

        if (!data) {
            writeLog(`project not found for username: ${username} from IP: ${req.ip}`, 'warn');
            const error = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Successfully fetched ${data.length} projects from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch projects from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.post("/", asyncHandler(async (req, res) => {
    const { name, url, details } = req.body;

    if (!name || !url || !details) {
        writeLog(`Project creation failed - missing required fields by user: ${req.user?.username} from IP: ${req.ip}`, 'warn');
        const error = new Error('Name, url, and details are required');
        error.status = 400;
        throw error;
    }

    writeLog(`Creating new project by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        let conditions = Object.entries(req.body).map(([key, value]) => ({
            field: key,
            value
        }));

        conditions = addUserIdCondition(req, conditions);
        const body = Object.fromEntries(conditions.map(({ field, value }) => [field, value]));

        const created = await createItem(RESOURCE_NAME, body);
        writeLog(`Project created successfully - id: ${created.id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.status(201).json({ message: 'Project created successfully', result: created });
    } catch (error) {
        writeLog(`Failed to create project by user: ${req.user?.username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.post("/rate", asyncHandler(async (req, res) => {
    const { project_id, rating } = req.body;

    if (!project_id || !rating) {
        writeLog(`Project rating failed - missing required fields by user: ${req.user?.username} from IP: ${req.ip}`, 'warn');
        const error = new Error('Project ID and rating are required');
        error.status = 400;
        throw error;
    }

    const username = req.user?.username;

    if (!username) {
        writeLog(`Project rating failed - user not authenticated from IP: ${req.ip}`, 'warn');
        const error = new Error('User not authenticated');
        error.status = 401;
        throw error;
    }

    if (rating < 1 || rating > 5) {
        writeLog(`Project rating failed - invalid rating value: ${rating} by user: ${username} from IP: ${req.ip}`, 'warn');
        const error = new Error('Rating must be between 1 and 5');
        error.status = 400;
        throw error;
    }

    writeLog(`Rating project id: ${project_id} with rating: ${rating} by user: ${username} from IP: ${req.ip}`, 'info');

    try {
        await projectsService.rateProject(username, project_id, rating);
        writeLog(`Project rated successfully - id: ${project_id}, rating: ${rating} by user: ${username} from IP: ${req.ip}`, 'info');
        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
        writeLog(`Failed to rate project id: ${project_id} by user: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, url, details, languages } = req.body;

    if (!id) {
        writeLog(`Project update failed - no project ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Project ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Updating project id: ${id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const result = await updateItem(
            RESOURCE_NAME,
            { name, url, details, languages },
            [{ field: 'id', value: id }]
        );

        if (!result) {
            writeLog(`Project not found for update - id: ${id} from IP: ${req.ip}`, 'warn');
            const error = new Error('Project not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Project updated successfully - id: ${id} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({
            message: 'Project updated successfully',
            result,
            project_id: id
        });
    } catch (error) {
        writeLog(`Failed to update project id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId) {
        writeLog(`Project deletion failed - no project ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Project ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Deleting project id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await deleteItem(RESOURCE_NAME, conditions);

        if (!result) {
            writeLog(`Project not found for deletion - id: ${itemId} from IP: ${req.ip}`, 'warn');
            const error = new Error('Project not found or access denied');
            error.status = 404;
            throw error;
        }

        writeLog(`Project deleted successfully - id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({ message: 'Project deleted successfully', result });
    } catch (error) {
        writeLog(`Failed to delete project id: ${itemId} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;