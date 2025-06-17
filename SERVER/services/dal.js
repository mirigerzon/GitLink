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
});

const getApplications = async (job_id) => {
    const application = await GET(["users", "developers", "job_applications", "roles"],
        [
            'users.id = developers.user_id',
            'users.id = job_applications.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: 'job_id', value: job_id, }]);
    return application;
}

const getUser = async (username) => {
    const users = await GET(["users", "passwords", "roles"],
        [
            'users.id = passwords.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: "username", value: username }]);
    if (users.length == 0) throw new Error('user not found');
    const user = users[0];
    if (user.role == 'developer')
        return await getDeveloper(user.id);
    else if (user.role == 'recruiter')
        return await getRecruiter(user.id)
    else
        throw new Error('role not found');
}

const getDeveloper = async (id) => {
    const user = await GET(["users", "developers", "passwords", "roles"],
        [
            'users.id = developers.user_id',
            'users.id = passwords.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: 'id', value: id }]);
    if (user.length == 0) throw new Error('user not found');
    return user;
}

const getRecruiter = async (id) => {
    const user = await GET(["users", "recruiters", "passwords", "roles"],
        [
            'users.id = recruiters.user_id',
            'users.id = passwords.user_id',
            'users.role_id = roles.role_id',
        ],
        [{ field: 'id', value: id }]);
    if (user.length == 0) throw new Error('user not found');
    return user;
}

const getDevelopers = async () => {
    const user = await GET(["users", "developers", "roles"],
        [
            'users.id = developers.user_id',
            'users.role_id = roles.role_id',
        ]);
    if (user.length == 0) throw new Error('user not found');
    return user;
}

const getRecruiters = async () => {
    const user = await GET(["users", "recruiters", "roles"],
        [
            'users.id = recruiters.user_id',
            'users.role_id = roles.role_id',
        ]);
    if (user.length == 0) throw new Error('user not found');
    return user;
}

const getProjectWithCreator = async (projectId) => {
    return await GET(["projects", "developers"],
        ["projects.git_name = developers.git_name"],
        [{ field: "projects.id", value: projectId }]
    );
}

const rateProjectTransactional = async (username, projectId, rating) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(`
            INSERT INTO project_ratings (username, project_id, rating)
            VALUES (?, ?, ?)
        `, [username, projectId, rating]);
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
            throw new Error("User has already rated this project.");
        }
        throw err;
    } finally {
        conn.release();
    }
};

const GET = async (tables = [], joins = [], conditions = []) => {
    if (tables.length === 0) throw new Error("At least one table is required");

    let query = `SELECT * FROM ${tables[0]}`;

    for (let i = 1; i < tables.length; i++) {
        if (!joins[i - 1]) {
            throw new Error(`Missing JOIN condition between ${tables[i - 1]} and ${tables[i]}`);
        }
        query += ` JOIN ${tables[i]} ON ${joins[i - 1]}`;
    }
    const values = [];
    const whereClauses = [`${tables[0]}.is_active = 1`];
    for (const cond of conditions) {
        whereClauses.push(`${cond.field} = ?`);
        values.push(cond.value);
    }
    query += ` WHERE ${whereClauses.join(" AND ")}`;

    const [results] = await pool.query(query, values);
    return results;
};

module.exports = {
    getUser,
    getDevelopers,
    getDeveloper,
    getRecruiters,
    getRecruiter,
    getProjectWithCreator,
    rateProjectTransactional,
    getApplications,
};
