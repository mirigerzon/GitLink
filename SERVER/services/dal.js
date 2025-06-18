const genericDal = require('../services/genericDal.js');
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    // acquireTimeout: 60000,
    // timeout: 60000,
});

const ALLOWED_TABLES = [
    'users', 'developers', 'recruiters', 'passwords', 'roles',
    'projects', 'job_applications', 'project_ratings', 'messages', 'jobs'
];

const USER_ROLES = {
    DEVELOPER: 'developer',
    RECRUITER: 'recruiter'
};

const getUser = async (username) => {
    if (!username) throw new Error('Username is required');

    const users = await genericDal.GET_WITH_JOINS(
        ["users", "passwords", "roles"],
        [
            'users.id = passwords.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: "username", value: username }]
    );

    if (users.length === 0) throw new Error('User not found');

    const user = users[0];

    switch (user.role) {
        case 'developer':
            return await getUserWithRoleData(user.id, 'developers');
        case 'recruiter':
            return await getUserWithRoleData(user.id, 'recruiters');
        default:
            throw new Error(`Invalid user role: ${user.role}`);
    }
};

const getUserWithRoleData = async (userId, roleTable) => {
    if (!userId) throw new Error('User ID is required');

    const users = await genericDal.GET_WITH_JOINS(
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
    if (!Object.values(USER_ROLES).includes(role)) throw new Error(`Invalid role: ${role}`);

    const roleTable = role === USER_ROLES.DEVELOPER ? 'developers' : 'recruiters';

    const users = await genericDal.GET_WITH_JOINS(
        ["users", roleTable, "roles"],
        [
            `users.id = ${roleTable}.user_id`,
            'users.role_id = roles.role_id',
        ]
    );

    if (users.length === 0) throw new Error(`No ${role}s found`);
    return users;
};

const getProjectWithCreator = async (projectId) => {
    if (!projectId) throw new Error('Project ID is required');

    return await genericDal.GET_WITH_JOINS(
        ["projects", "developers"],
        ["projects.git_name = developers.git_name"],
        [{ field: "projects.id", value: projectId }]
    );
};

const rateProjectTransactional = async (username, projectId, rating) => {
    if (!username || !projectId || rating === undefined) throw new Error('Username, project ID, and rating are required');
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();
        await conn.query(`
            INSERT INTO project_ratings (username, project_id, rating)
            VALUES (?, ?, ?)
        `, [username, projectId, rating]);

        // Update project statistics
        await conn.query(`
            UPDATE projects p
            JOIN (
                SELECT 
                    project_id,
                    ROUND(AVG(rating), 2) AS avg_rating,
                    COUNT(*) AS count_rating
                FROM project_ratings
                WHERE project_id = ?
                GROUP BY project_id
            ) r ON r.project_id = p.id
            SET p.rating = r.avg_rating,
                p.rating_count = r.count_rating
            WHERE p.id = ?;
        `, [projectId, projectId]);

        await conn.commit();
    } catch (err) {
        await conn.rollback();

        if (err.message.includes("Duplicate") || err.code === 'ER_DUP_ENTRY') {
            throw new Error("User has already rated this project");
        }

        throw new Error(`Transaction failed: ${err.message}`);
    } finally {
        conn.release();
    }
};

const getApplications = async (job_id) => {
    if (!job_id) throw new Error('Job ID is required');

    const application = await genericDal.GET_WITH_JOINS(["users", "developers", "job_applications", "roles"],
        [
            'users.id = developers.user_id',
            'users.id = job_applications.user_id',
            'users.role_id = roles.role_id',
        ],
        [{ field: 'job_id', value: job_id, }]);
    return application;
}

// Graceful shutdown
const closePool = async () => {
    await pool.end();
};

process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);


module.exports = {
    getUserWithRoleData,
    getUsersByRole,
    getUser,
    getProjectWithCreator,
    rateProjectTransactional,
    getApplications,
    // Utility
    closePool
};



// const getDevelopers = async () => {
//     return await getUsersByRole(USER_ROLES.DEVELOPER);
// };

// const getRecruiters = async () => {
//     return await getUsersByRole(USER_ROLES.RECRUITER);
// };

// const getDeveloper = async (id) => {
//     return await getUserWithRoleData(id, 'developers');
// };

// const getRecruiter = async (id) => {
//     return await getUserWithRoleData(id, 'recruiters');
// };

// const mysql = require("mysql2/promise");
// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     waitForConnections: true,
//     connectionLimit: 10,
//     // acquireTimeout: 60000,
//     // timeout: 60000,
// });

// const ALLOWED_TABLES = [
//     'users', 'developers', 'recruiters', 'passwords', 'roles',
//     'projects', 'job_applications', 'project_ratings'
// ];

// const USER_ROLES = {
//     DEVELOPER: 'developer',
//     RECRUITER: 'recruiter'
// };

// const validateTable = (table) => {
//     if (!ALLOWED_TABLES.includes(table)) throw new Error(`Invalid table name: ${table}`);
// };

// const validateTables = (tables) => {
//     tables.forEach(validateTable);
// };

// const validateConditions = (conditions) => {
//     if (!Array.isArray(conditions)) throw new Error('Conditions must be an array');

//     conditions.forEach(cond => {
//         if (!cond.field || cond.value === undefined) throw new Error('Invalid condition: field and value are required');
//     });
// };





// const getUser = async (username) => {
//     const users = await GET(["users", "passwords", "roles"],
//         [
//             'users.id = passwords.user_id',
//             'users.role_id = roles.role_id'
//         ],
//         [{ field: "username", value: username }]);
//     if (users.length == 0) throw new Error('user not found');
//     const user = users[0];
//     if (user.role == 'developer')
//         return await getDeveloper(user.id);
//     else if (user.role == 'recruiter')
//         return await getRecruiter(user.id)
//     else
//         throw new Error('role not found');
// }

// const getDeveloper = async (id) => {
//     const user = await GET(["users", "developers", "passwords", "roles"],
//         [
//             'users.id = developers.user_id',
//             'users.id = passwords.user_id',
//             'users.role_id = roles.role_id'
//         ],
//         [{ field: 'id', value: id }]);
//     if (user.length == 0) throw new Error('user not found');
//     return user;
// }

// const getRecruiter = async (id) => {
//     const user = await GET(["users", "recruiters", "passwords", "roles"],
//         [
//             'users.id = recruiters.user_id',
//             'users.id = passwords.user_id',
//             'users.role_id = roles.role_id',
//         ],
//         [{ field: 'id', value: id }]);
//     if (user.length == 0) throw new Error('user not found');
//     return user;
// }

// const getDevelopers = async () => {
//     const user = await GET(["users", "developers", "roles"],
//         [
//             'users.id = developers.user_id',
//             'users.role_id = roles.role_id',
//         ]);
//     if (user.length == 0) throw new Error('user not found');
//     return user;
// }

// const getRecruiters = async () => {
//     const user = await GET(["users", "recruiters", "roles"],
//         [
//             'users.id = recruiters.user_id',
//             'users.role_id = roles.role_id',
//         ]);
//     if (user.length == 0) throw new Error('user not found');
//     return user;
// }

// const getProjectWithCreator = async (projectId) => {
//     return await GET(["projects", "developers"],
//         ["projects.git_name = developers.git_name"],
//         [{ field: "projects.id", value: projectId }]
//     );
// }

// const rateProjectTransactional = async (username, projectId, rating) => {
//     const conn = await pool.getConnection();
//     try {
//         await conn.beginTransaction();
//         await conn.query(`
//             INSERT INTO project_ratings (username, project_id, rating)
//             VALUES (?, ?, ?)
//         `, [username, projectId, rating]);
//         await conn.query(`
//             UPDATE projects p
//             JOIN (
//                 SELECT
//                     project_id,
//                     ROUND(AVG(rating), 2) AS avg_rating,
//                     COUNT(*) AS count_rating
//                 FROM project_ratings
//                 WHERE project_id = ?
//                 GROUP BY project_id
//             ) r ON r.project_id = p.id
//             SET p.rating = r.avg_rating,
//                 p.rating_count = r.count_rating
//             WHERE p.id = ?;
//         `, [projectId, projectId]);

//         await conn.commit();
//     } catch (err) {
//         await conn.rollback();
//         if (err.message.includes("Duplicate") || err.code === 'ER_DUP_ENTRY') {
//             throw new Error("User has already rated this project.");
//         }
//         throw err;
//     } finally {
//         conn.release();
//     }
// };

// const GET = async (tables = [], joins = [], conditions = []) => {
//     if (tables.length === 0) throw new Error("At least one table is required");

//     let query = `SELECT * FROM ${tables[0]}`;

//     for (let i = 1; i < tables.length; i++) {
//         if (!joins[i - 1]) {
//             throw new Error(`Missing JOIN condition between ${tables[i - 1]} and ${tables[i]}`);
//         }
//         query += ` JOIN ${tables[i]} ON ${joins[i - 1]}`;
//     }
//     const values = [];
//     const whereClauses = [`${tables[0]}.is_active = 1`];
//     for (const cond of conditions) {
//         whereClauses.push(`${cond.field} = ?`);
//         values.push(cond.value);
//     }
//     query += ` WHERE ${whereClauses.join(" AND ")}`;

//     const [results] = await pool.query(query, values);
//     return results;
// };

// module.exports = {
//     getUser,
//     getDevelopers,
//     getDeveloper,
//     getRecruiters,
//     getRecruiter,
//     getProjectWithCreator,
//     rateProjectTransactional,
//     getApplications,
// };
