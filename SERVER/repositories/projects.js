const { GET_WITH_JOINS } = require("./generic");
const pool = require("./mysqlPool");

const getProjectWithCreator = async (projectId) => {
    if (!projectId) {
        throw new Error('Project ID is required');
    }

    try {
        const projects = await GET_WITH_JOINS(
            ["projects", "developers"],
            ["projects.git_name = developers.git_name"],
            [{ field: "id", value: projectId }],
            false
        );

        return projects;
    } catch (error) {
        console.error('Error in getProjectWithCreator:', error.message);
        throw new Error(`Failed to fetch project with creator: ${error.message}`);
    }
};

const rateProjectTransactional = async (username, projectId, rating) => {
    if (!username || !projectId || rating === undefined) {
        throw new Error('Username, project ID, and rating are required');
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingRating] = await connection.query(
            'SELECT id FROM project_ratings WHERE username = ? AND project_id = ?',
            [username, projectId]
        );

        if (existingRating.length > 0) {
            throw new Error('User has already rated this project');
        }

        await connection.query(
            'INSERT INTO project_ratings (username, project_id, rating) VALUES (?, ?, ?)',
            [username, projectId, rating]
        );

        await connection.query(`
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

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error('Error in rateProjectTransactional:', error.message);
        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updateDeveloperRating = async (gitName) => {
    if (!gitName) {
        throw new Error('Git name is required');
    }

    try {
        const sql = `
            UPDATE developers 
            SET rating = (
                SELECT ROUND(
                    SUM(p.rating * p.rating_count) / SUM(p.rating_count), 2
                )
                FROM projects p 
                WHERE p.git_name = ? 
                AND p.rating_count > 0
                AND p.is_active = 1
            )
            WHERE git_name = ?
        `;

        const [result] = await pool.query(sql, [gitName, gitName]);
        return result;
    } catch (error) {
        console.error('Error updating developer rating:', error.message);
        throw new Error(`Failed to update developer rating: ${error.message}`);
    }
};

module.exports = {
    getProjectWithCreator,
    rateProjectTransactional,
    updateDeveloperRating
};