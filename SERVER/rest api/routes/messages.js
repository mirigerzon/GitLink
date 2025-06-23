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
    const conditions = createConditions(req);
    const data = await getItemByConditions(
        RESOURCE_NAME,
        conditions.length ? conditions : undefined
    );

    writeLog(`Fetched ${RESOURCE_NAME} with conditions=${JSON.stringify(conditions)}`, 'info');
    res.json(data);
}));

router.put('/', asyncHandler(async (req, res) => {
    if (!req.body?.email) return res.status(401).json({ error: 'User not authenticated' });

    const body = req.body;
    const result = await updateItem(
        RESOURCE_NAME,
        body,
        [{ field: 'email', value: req.body.email }]
    );
    writeLog(`Updated message for user=${req.body.email}`, 'info');
    res.json({ message: 'Message updated successfully', result });
}));

router.put('/:id', asyncHandler(async (req, res) => {
    if (!req.body?.email) return res.status(401).json({ error: 'User not authenticated' });

    const { id } = req.params;
    const body = req.body;

    const result = await updateItem(
        RESOURCE_NAME,
        body,
        [
            { field: 'id', value: id },
            { field: 'email', value: req.body.email }
        ]
    );

    writeLog(`Updated message id=${id} for user=${req.body.email}`, 'info');
    res.json({ message: 'Message updated successfully', result });
}));

router.delete('/:itemId', asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const baseConditions = [{ field: 'id', value: itemId }];
    const conditions = addUserIdCondition(req, baseConditions);

    const result = await deleteItem(RESOURCE_NAME, conditions);
    writeLog(`Deleted message id=${itemId}`, 'info');
    res.json({ message: 'Message deleted successfully', result });
}));

module.exports = router;