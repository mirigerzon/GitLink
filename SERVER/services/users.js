const generic = require('../repositories/generic.js');
const usersRepositories = require('../repositories/users.js');
const bcrypt = require('bcrypt');
const { sendPasswordChangeWarningEmail } = require('../services/emailService.js');

const getUsers = async () => {
    try {
        const users = await usersRepositories.getUsers();
        return users?.length > 0 ? users : null;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
    }
}

const getUser = async (username) => {
    try {
        const user = await usersRepositories.getUser(username);
        if (user.role == 'admin') return user;
        return usersRepositories.getUserWithRoleData(user.id, `${user.role}s`)
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
    }
}

const updateUserStatus = async (table, body, conditions) => {
    try {
        const { email, id } = body;
        const data = { status: body.status };
        const messageData = {
            user_id: id,
            email: email,
            title: body.status === 0 ? 'Account Blocked' : 'Account Active',
            content: body.status === 0
                ? `Your account has been blocked...`
                : `Your account has been reactivated...`
        };

        await usersRepositories.updateAndInformUser(table, data, conditions, messageData);
    } catch (error) {
        console.error('Error updating user status:', error);
        throw new Error('Failed to update user status');
    }
}

const changeUserPassword = async (userId, currentPassword, newPassword, email) => {
    try {
        if (!userId || !currentPassword || !newPassword) {
            throw new Error("All password fields are required");
        }

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

module.exports = {
    getUsers,
    getUser,
    updateUserStatus,
    changeUserPassword
};
