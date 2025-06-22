const { GET_WITH_JOINS } = require("./generic");
const pool = require('../models/mysqlPool');

const getUsers = async () => {
    return await GET_WITH_JOINS(
        ["users", "passwords", "roles"],
        [
            'users.id = passwords.user_id',
            `users.role_id = roles.role_id AND roles.role != 'admin'`
        ]
    );
};

const getUser = async (username) => {
    if (!username) throw new Error('Username is required');

    const users = await GET_WITH_JOINS(
        ["users", "passwords", "roles"],
        [
            'users.id = passwords.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: "username", value: username }]
    );

    return users[0] || null;
};

const getUserWithRoleData = async (userId, roleTable) => {
    if (!userId) throw new Error('User ID is required');

    const users = await GET_WITH_JOINS(
        ["users", roleTable, "passwords", "roles"],
        [
            `users.id = ${roleTable}.user_id`,
            'users.id = passwords.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: 'id', value: userId }]
    );

    if (users.length === 0) throw new Error('User not found');

    return users[0];
};

const getUsersByRole = async (role) => {
    const USER_ROLES = {
        DEVELOPER: 'developer',
        RECRUITER: 'recruiter',
        ADMIN: 'admin'
    };

    if (!Object.values(USER_ROLES).includes(role)) throw new Error(`Invalid role: ${role}`);

    const roleTable = role === USER_ROLES.DEVELOPER ? 'developers' : 'recruiters';

    return await GET_WITH_JOINS(
        ["users", roleTable, "roles"],
        [
            `users.id = ${roleTable}.user_id`,
            'users.role_id = roles.role_id'
        ]
    );
};

const updateAndInformUser = async (table, data, conditions = [], messageData) => {
    const connection = await pool.getConnection();
    try {
        if (!data || Object.keys(data).length === 0)
            throw new Error('Data is required for update operation');

        if (!conditions || conditions.length === 0)
            throw new Error('Conditions are required for update operation');

        if (!messageData || !messageData.user_id || !messageData.email || !messageData.title || !messageData.content)
            throw new Error('Complete message data is required');

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
