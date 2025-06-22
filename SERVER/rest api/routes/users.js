const express = require('express');
const router = express.Router();
const genericDataService = require('../../services/generic.js');
const usersService = require('../../services/users.js');

const { writeLog } = require('../../log/log.js');
const { handleError, validateRequiredFields, upload } = require('../utils/routerHelpers.js');

router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'Username is required' });
        const data = await usersService.getUser(username);
        writeLog(`Fetched user data for username=${username}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'users', 'fetching');
    }
});

router.get('/', async (req, res) => {
    try {
        const data = await usersService.getUsers();
        writeLog(`Fetched users data`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'users', 'fetching');
    }
});

router.put('/update-cv', upload.single('cv_file'), async (req, res) => {
    try {
        const { user_id } = req.body;

        if (req.user?.id && req.user.id !== parseInt(user_id)) return res.status(403).json({ error: 'You can only update your own CV' })

        let cvFilePath = null;
        if (req.file) cvFilePath = `cv_files/${req.file.filename}`;

        await genericDataService.updateItem('users',
            { cv_file: cvFilePath },
            [{ field: 'id', value: user_id }]
        );
        res.status(200).json({ message: 'CV updated successfully' });
    } catch (err) {
        handleError(res, err, 'users', 'updating CV for');
    }
});

router.put('/update-image', upload.single('profile_image'), async (req, res) => {
    try {
        const { user_id, use_git_avatar } = req.body;

        if (req.user?.id && req.user.id !== parseInt(user_id)) return res.status(403).json({ error: 'You can only update your own profile image' });

        let profileImagePath = null;
        if (use_git_avatar === 'true') {
            profileImagePath = req.body.profile_image;
        } else if (req.file) {
            profileImagePath = `profile_images/${req.file.filename}`;
        }

        await genericDataService.updateItem('users',
            { profile_image: profileImagePath },
            [{ field: 'id', value: user_id }]
        );
        res.status(200).json({ message: 'Profile image updated successfully', file: profileImagePath });
    } catch (err) {
        handleError(res, err, 'users', 'updating profile image for');
    }
});

router.put('/change-password', async (req, res) => {
    try {
        validateRequiredFields(req.body, ['user_id', 'currentPassword', 'newPassword']);

        const { user_id, currentPassword, newPassword, email } = req.body;

        if (req.user?.user_id && req.user.user_id !== user_id) return res.status(403).json({ error: 'You can only change your own password' });

        const user = await usersService.changeUserPassword(user_id, currentPassword, newPassword, email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        handleError(res, err, 'users', 'changing password for');
    }
});

router.put('/status/:username', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'username is required' });
        const result = await usersService.updateUserStatus(
            'users',
            req.body,
            [{ field: 'username', value: username }]
        );
        writeLog(`Updated username=${username} by user=${req.user.username}`, 'info');
        res.json({
            message: 'user updated successfully',
            result
        });
    } catch (err) {
        handleError(res, err, 'users', 'updating user');
    }
});

router.put('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'username is required' });
        const result = await genericDataService.updateItem(
            'users',
            req.body,
            [{ field: 'username', value: username }]
        );
        writeLog(`Updated username=${username} by user=${req.user.username}`, 'info');
        res.json({
            message: 'user updated successfully',
            result
        });
    } catch (err) {
        handleError(res, err, 'users', 'updating user');
    }
});

module.exports = router;