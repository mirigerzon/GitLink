const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const genericDataService = require('../../services/generic.js');
const usersService = require('../../services/users.js');
const { writeLog } = require('../../common/logger.js');
const { validateRequiredFields, upload } = require('../utils/routerHelpers.js');
const RESOURCE_NAME = 'users';

router.get('/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }
    const data = await usersService.getUser(username);
    writeLog(`Fetched ${RESOURCE_NAME} data for username=${username}`, 'info');
    res.json(data);
}));

router.get('/', asyncHandler(async (req, res) => {
    const data = await usersService.getUsers();
    writeLog(`Fetched ${RESOURCE_NAME} data`, 'info');
    res.json(data);
}));

router.put('/update-cv', upload.single('cv_file'), asyncHandler(async (req, res) => {
    const { user_id } = req.body;

    if (req.user?.id && req.user.id !== parseInt(user_id)) {
        const error = new Error('You can only update your own CV');
        error.status = 403;
        throw error;
    }

    let cvFilePath = null;
    if (req.file) cvFilePath = `cv_files/${req.file.filename}`;

    await genericDataService.updateItem(RESOURCE_NAME,
        { cv_file: cvFilePath },
        [{ field: 'id', value: user_id }]
    );
    res.status(200).json({ message: 'CV updated successfully' });
}));

router.put('/update-image', upload.single('profile_image'), asyncHandler(async (req, res) => {
    const { user_id, use_git_avatar } = req.body;

    if (req.user?.id && req.user.id !== parseInt(user_id)) {
        const error = new Error('You can only update your own profile image');
        error.status = 403;
        throw error;
    }

    let profileImagePath = null;
    if (use_git_avatar === 'true') {
        profileImagePath = req.body.profile_image;
    } else if (req.file) {
        profileImagePath = `profile_images/${req.file.filename}`;
    }

    await genericDataService.updateItem(RESOURCE_NAME,
        { profile_image: profileImagePath },
        [{ field: 'id', value: user_id }]
    );
    res.status(200).json({ message: 'Profile image updated successfully', file: profileImagePath });
}));

router.put('/change-password', asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, ['user_id', 'currentPassword', 'newPassword']);

    const { user_id, currentPassword, newPassword, email } = req.body;

    if (req.user?.user_id && req.user.user_id !== user_id) {
        const error = new Error('You can only change your own password');
        error.status = 403;
        throw error;
    }

    const user = await usersService.changeUserPassword(user_id, currentPassword, newPassword, email);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    res.status(200).json({ message: 'Password changed successfully' });
}));

router.put('/status/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        const error = new Error('username is required');
        error.status = 400;
        throw error;
    }
    const result = await usersService.updateUserStatus(
        RESOURCE_NAME,
        req.body,
        [{ field: 'username', value: username }]
    );
    writeLog(`Updated username=${username} by user=${req.user.username}`, 'info');
    res.json({
        message: 'user updated successfully',
        result
    });
}));

router.put('/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        const error = new Error('username is required');
        error.status = 400;
        throw error;
    }
    const result = await genericDataService.updateItem(
        RESOURCE_NAME,
        req.body,
        [{ field: 'username', value: username }]
    );
    writeLog(`Updated username=${username} by user=${req.user.username}`, 'info');
    res.json({
        message: 'user updated successfully',
        result
    });
}));

module.exports = router;