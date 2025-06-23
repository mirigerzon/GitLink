const generic = require('../repositories/generic.js');
const usersRepositories = require('../repositories/users.js');
const bcrypt = require('bcrypt');
const { sendPasswordChangeWarningEmail } = require('../services/emailService.js');

const getUsers = async () => {
    try {
        const users = await usersRepositories.getUsers();
        return users && users.length > 0 ? users : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
    }
};

const getUser = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const user = await usersRepositories.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.role === 'admin') {
            return user;
        }

        return await usersRepositories.getUserWithRoleData(user.id, `${user.role}s`);
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

const updateUserStatus = async (table, body, conditions) => {
    if (!table || !body || !conditions) {
        throw new Error('Table, body, and conditions are required');
    }

    const { email, id, status } = body;

    if (!email || !id || status === undefined) {
        throw new Error('Email, ID, and status are required');
    }

    try {
        const data = { status: status };
        const messageData = {
            user_id: id,
            email: email,
            title: status === 0 ? 'Account Blocked' : 'Account Activated',
            content: status === 0
                ? 'Your account has been temporarily blocked. Please contact support if you believe this is an error.'
                : 'Your account has been reactivated. You can now access all features.'
        };

        await usersRepositories.updateAndInformUser(table, data, conditions, messageData);
    } catch (error) {
        console.error('Error updating user status:', error);
        throw new Error('Failed to update user status');
    }
};

const changeUserPassword = async (userId, currentPassword, newPassword, email) => {
    if (!userId || !currentPassword || !newPassword || !email) {
        throw new Error('User ID, current password, new password, and email are required');
    }

    if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
    }

    try {
        const passwords = await generic.GET('passwords', [
            { field: 'user_id', value: userId }
        ]);

        if (!passwords?.length) {
            throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, passwords[0].hashed_password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const conditions = [{ field: 'user_id', value: userId }];

        await sendPasswordChangeWarningEmail(userId, email);

        return await generic.UPDATE('passwords', { hashed_password: hashedNewPassword }, conditions);
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

const checkUserOwnership = (req, targetUserId, resourceName) => {
    if (req.user?.id && req.user.id !== parseInt(targetUserId)) {
        writeLog(`Unauthorized access attempt by user: ${req.user.username} trying to access ${resourceName} of user: ${targetUserId} from IP: ${req.ip}`, 'warn');
        const error = new Error(`You can only update your own ${resourceName}`);
        error.status = 403;
        throw error;
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUserStatus,
    changeUserPassword,
    checkUserOwnership
};