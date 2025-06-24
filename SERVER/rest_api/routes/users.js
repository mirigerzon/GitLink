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
        writeLog(`User fetch failed - no username provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Fetching user data for username: ${username} from IP: ${req.ip}`, 'info');

    try {
        const data = await usersService.getUser(username);

        if (!data) {
            writeLog(`User not found for username: ${username} from IP: ${req.ip}`, 'warn');
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Successfully fetched user data for username: ${username} from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch user data for username: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.get('/', asyncHandler(async (req, res) => {
    writeLog(`Fetching all users from IP: ${req.ip}`, 'info');

    try {
        const data = await usersService.getUsers();
        writeLog(`Successfully fetched ${data.length} users from IP: ${req.ip}`, 'info');
        res.json(data);
    } catch (error) {
        writeLog(`Failed to fetch users from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/update-cv', upload.single('cv_file'), asyncHandler(async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        writeLog(`CV update failed - no user ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('User ID is required');
        error.status = 400;
        throw error;
    }

    usersService.checkUserOwnership(req, user_id, 'CV');

    writeLog(`Updating CV for user: ${user_id} from IP: ${req.ip}`, 'info');

    try {
        let cvFilePath = null;
        if (req.file) {
            cvFilePath = `cv_files/${req.file.filename}`;
            writeLog(`CV file uploaded successfully for user: ${user_id} - filename: ${req.file.filename} from IP: ${req.ip}`, 'info');
        }

        await genericDataService.updateItem(RESOURCE_NAME,
            { cv_file: cvFilePath },
            [{ field: 'id', value: user_id }]
        );

        writeLog(`CV updated successfully for user: ${user_id} from IP: ${req.ip}`, 'info');
        res.status(200).json({ message: 'CV updated successfully' });
    } catch (error) {
        writeLog(`Failed to update CV for user: ${user_id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/update-image', upload.single('profile_image'), asyncHandler(async (req, res) => {
    const { user_id, use_git_avatar } = req.body;

    if (!user_id) {
        writeLog(`Profile image update failed - no user ID provided from IP: ${req.ip}`, 'warn');
        const error = new Error('User ID is required');
        error.status = 400;
        throw error;
    }

    usersService.checkUserOwnership(req, user_id, 'profile image');

    writeLog(`Updating profile image for user: ${user_id} from IP: ${req.ip}`, 'info');

    try {
        let profileImagePath = null;
        if (use_git_avatar === 'true') {
            profileImagePath = req.body.profile_image;
            writeLog(`Using Git avatar for user: ${user_id} from IP: ${req.ip}`, 'info');
        } else if (req.file) {
            profileImagePath = `profile_images/${req.file.filename}`;
            writeLog(`Profile image file uploaded successfully for user: ${user_id} - filename: ${req.file.filename} from IP: ${req.ip}`, 'info');
        }

        await genericDataService.updateItem(RESOURCE_NAME,
            { profile_image: profileImagePath },
            [{ field: 'id', value: user_id }]
        );

        writeLog(`Profile image updated successfully for user: ${user_id} from IP: ${req.ip}`, 'info');
        res.status(200).json({ message: 'Profile image updated successfully', file: profileImagePath });
    } catch (error) {
        writeLog(`Failed to update profile image for user: ${user_id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/change-password', asyncHandler(async (req, res) => {
    const { user_id, currentPassword, newPassword, email } = req.body;

    if (!user_id || !currentPassword || !newPassword || !email) {
        writeLog(`Password change failed - missing required fields from IP: ${req.ip}`, 'warn');
        const error = new Error('User ID, current password, new password, and email are required');
        error.status = 400;
        throw error;
    }

    if (req.user?.user_id && req.user.user_id !== user_id) {
        writeLog(`Unauthorized password change attempt by user: ${req.user.username} for user: ${user_id} from IP: ${req.ip}`, 'warn');
        const error = new Error('You can only change your own password');
        error.status = 403;
        throw error;
    }

    writeLog(`Password change attempt for user: ${user_id} from IP: ${req.ip}`, 'info');

    try {
        const user = await usersService.changeUserPassword(user_id, currentPassword, newPassword, email);

        if (!user) {
            writeLog(`Password change failed - user not found: ${user_id} from IP: ${req.ip}`, 'warn');
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        writeLog(`Password changed successfully for user: ${user_id} from IP: ${req.ip}`, 'info');
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        writeLog(`Failed to change password for user: ${user_id} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/status/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        writeLog(`User status update failed - no username provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Updating user status for username: ${username} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const result = await usersService.updateUserStatus(
            RESOURCE_NAME,
            req.body,
            [{ field: 'username', value: username }]
        );

        writeLog(`User status updated successfully for username: ${username} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({
            message: 'User status updated successfully',
            result
        });
    } catch (error) {
        writeLog(`Failed to update user status for username: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.put('/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        writeLog(`User update failed - no username provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }

    writeLog(`Updating user data for username: ${username} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');

    try {
        const result = await genericDataService.updateItem(
            RESOURCE_NAME,
            req.body,
            [{ field: 'username', value: username }]
        );

        if (!result) {
            writeLog(`User not found for update - username: ${username} from IP: ${req.ip}`, 'warn');
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        writeLog(`User updated successfully for username: ${username} by user: ${req.user?.username} from IP: ${req.ip}`, 'info');
        res.json({
            message: 'User updated successfully',
            result
        });
    } catch (error) {
        writeLog(`Failed to update user for username: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

module.exports = router;