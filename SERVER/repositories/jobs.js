const pool = require("../repositories/mysqlPool");

const getJobsWithApplicantsCount = async () => {
    const sql = `
        SELECT 
            j.*,
            COUNT(ja.user_id) AS applicants_count
        FROM jobs j
        LEFT JOIN job_applications ja 
            ON j.id = ja.job_id AND ja.is_active = 1
        WHERE j.is_active = 1
        GROUP BY j.id
        ORDER BY j.created_at DESC;
    `;

    const [rows] = await pool.query(sql);
    return rows;
};

module.exports = {
    getJobsWithApplicantsCount
};
