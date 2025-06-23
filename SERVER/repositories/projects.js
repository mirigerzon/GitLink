const { GET_WITH_JOINS } = require("./generic");
const pool = require("./mysqlPool");

const getProjectWithCreator = async (projectId) => {
    if (!projectId) throw new Error('Project ID is required');

    return await GET_WITH_JOINS(
        ["projects", "developers"],
        ["projects.git_name = developers.git_name"],
        [{ field: "id", value: projectId }]
    );
};

const rateProjectTransactional = async (username, projectId, rating) => {
    const conn = await pool.getConnection();
    try {
        if (!username || !projectId || rating === undefined)
            throw new Error('Username, project ID, and rating are required');

        await conn.beginTransaction();

        await conn.query(`
            INSERT INTO project_ratings (username, project_id, rating)
            VALUES (?, ?, ?)
        `, [username, projectId, rating]);

        await conn.query(`
            UPDATE projects
            SET rating = (
                SELECT ROUND(AVG(rating), 2)
                FROM project_ratings
                WHERE project_id = ?
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM project_ratings
                WHERE project_id = ?
            )
            WHERE id = ?;
        `, [projectId, projectId, projectId]);

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        conn.release();
    }
};

module.exports = {
    getProjectWithCreator,
    rateProjectTransactional
};
