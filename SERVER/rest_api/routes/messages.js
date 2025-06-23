const express = require('express');
const router = express.Router();
const {
    getItemByConditions,
    updateItem,
    deleteItem
} = require('../../services/generic.js');
const { writeLog } = require('../../common/logger.js');
const {
    createConditions,
    addUserIdCondition,
    handleError
} = require('../utils/routerHelpers.js');
const asyncHandler = require('../middlewares/asyncHandler');

const RESOURCE_NAME = 'messages';

router.get('/', asyncHandler(async (req, res) => {
    writeLog(`Fetching messages from IP: ${req.ip}`, 'info');

    try {
        const conditions = createConditions(req);
        const data = await getItemByConditions(
            RESOURCE_NAME,
            conditions.length ? conditions : undefined
        );

        writeLog(`Successfully fetched ${data.length} messages from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch messages from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/', asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        writeLog(`Message update failed - no email provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Email is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Updating message for user email: ${email} from IP: ${req.ip}`, 'info');

    try {
        const body = req.body;
        const result = await updateItem(
            RESOURCE_NAME,
            body,
            [{ field: 'email', value: email }]
        );

        if (!result) {
            writeLog(`Message not found for update - email: ${email} from IP: ${req.ip}`, 'warn');
            const error = new Error('Message not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Message updated successfully for user email: ${email} from IP: ${req.ip}`, 'info');
        res.json({ message: 'Message updated successfully', result });
    } catch (error) {
        writeLog(`Failed to update message for email: ${email} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!id) {
        writeLog(`Message update failed - no message ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Message ID is required');
        error.status = 400;
        throw error;
    }

    if (!email) {
        writeLog(`Message update failed - no email provided for message id: ${id} from IP: ${req.ip}`, 'warn');
        const error = new Error('Email is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Updating message id: ${id} for user email: ${email} from IP: ${req.ip}`, 'info');

    try {
        const body = req.body;
        const result = await updateItem(
            RESOURCE_NAME,
            body,
            [
                { field: 'id', value: id },
                { field: 'email', value: email }
            ]
        );

        if (!result) {
            writeLog(`Message not found for update - id: ${id}, email: ${email} from IP: ${req.ip}`, 'warn');
            const error = new Error('Message not found or access denied');
            error.status = 404;
            throw error;
        }

        writeLog(`Message updated successfully - id: ${id} for user email: ${email} from IP: ${req.ip}`, 'info');
        res.json({ message: 'Message updated successfully', result });
    } catch (error) {
        writeLog(`Failed to update message id: ${id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId) {
        writeLog(`Message deletion failed - no message ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Message ID is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Deleting message id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);
        const result = await deleteItem(RESOURCE_NAME, conditions);

        if (!result) {
            writeLog(`Message not found for deletion - id: ${itemId} from IP: ${req.ip}`, 'warn');
            const error = new Error('Message not found or access denied');
            error.status = 404;
            throw error;
        }

        writeLog(`Message deleted successfully - id: ${itemId} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({ message: 'Message deleted successfully', result });
    } catch (error) {
        writeLog(`Failed to delete message id: ${itemId} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;