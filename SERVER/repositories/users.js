const { GET_WITH_JOINS } = require("./generic");
const pool = require('./mysqlPool');

const USER_ROLES = {
    DEVELOPER: 'developer',
    RECRUITER: 'recruiter',
    ADMIN: 'admin'
};

const validateRole = (role) => {
    if (!role || !Object.values(USER_ROLES).includes(role)) {
        throw new Error(`Invalid role: ${role}`);
    }
};

const getUsers = async () => {
    try {
        const users = await GET_WITH_JOINS(
            ["users", "passwords", "roles"],
            [
                'users.id = passwords.user_id',
                `users.role_id = roles.role_id AND roles.role != 'admin'`
            ]
        );

        return users;
    } catch (error) {
        console.error('Error in getUsers:', error.message);
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
};

const getUser = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const users = await GET_WITH_JOINS(
            ["users", "passwords", "roles"],
            [
                'users.id = passwords.user_id',
                'users.role_id = roles.role_id'
            ],
            [{ field: "username", value: username }]
        );

        return users[0] || null;
    } catch (error) {
        console.error('Error in getUser:', error.message);
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
};

const getUserWithRoleData = async (userId, roleTable) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (!roleTable) {
        throw new Error('Role table is required');
    }

    const allowedRoleTables = ['developers', 'recruiters'];
    if (!allowedRoleTables.includes(roleTable)) {
        throw new Error(`Invalid role table: ${roleTable}`);
    }

    try {
        const users = await GET_WITH_JOINS(
            ["users", roleTable, "passwords", "roles"],
            [
                `users.id = ${roleTable}.user_id`,
                'users.id = passwords.user_id',
                'users.role_id = roles.role_id'
            ],
            [{ field: 'id', value: userId }]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        return users[0];
    } catch (error) {
        console.error('Error in getUserWithRoleData:', error.message);
        throw error;
    }
};

const getUsersByRole = async (role) => {
    validateRole(role);

    try {
        const roleTable = role === USER_ROLES.DEVELOPER ? 'developers' : 'recruiters';

        const users = await GET_WITH_JOINS(
            ["users", roleTable, "roles"],
            [
                `users.id = ${roleTable}.user_id`,
                'users.role_id = roles.role_id'
            ]
        );

        return users;
    } catch (error) {
        console.error('Error in getUsersByRole:', error.message);
        throw new Error(`Failed to fetch users by role: ${error.message}`);
    }
};

const updateAndInformUser = async (table, data, conditions = [], messageData) => {
    if (!table) {
        throw new Error('Table name is required');
    }

    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        throw new Error('Data is required and must be a non-empty object');
    }

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
        throw new Error('Conditions are required and must be a non-empty array');
    }

    if (!messageData || !messageData.user_id || !messageData.email || !messageData.title || !messageData.content) {
        throw new Error('Complete message data is required (user_id, email, title, content)');
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const updateSql = `UPDATE \`${table}\` SET ${Object.keys(data).map(f => `\`${f}\` = ?`).join(", ")} WHERE ${conditions.map(c => `\`${c.field}\` = ?`).join(" AND ")}`;
        const updateParams = [...Object.values(data), ...conditions.map(c => c.value)];

        const insertSql = `INSERT INTO messages (user_id, email, title, content) VALUES (?, ?, ?, ?)`;
        const insertParams = [messageData.user_id, messageData.email, messageData.title, messageData.content];

        await connection.query(updateSql, updateParams);
        await connection.query(insertSql, insertParams);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error('Error in updateAndInformUser:', error.message);
        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        connection.release();
    }
};

module.exports = {
    getUsers,
    getUser,
    getUserWithRoleData,
    getUsersByRole,
    updateAndInformUser
};