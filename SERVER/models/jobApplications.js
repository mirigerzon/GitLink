const { GET_WITH_JOINS } = require("./generic");
const usersModel = require("./users");

const getApplications = async (job_id) => {
    if (!job_id) throw new Error('Job ID is required');

    return await GET_WITH_JOINS(
        ["users", "developers", "job_applications", "roles"],
        [
            'users.id = developers.user_id',
            'users.id = job_applications.user_id',
            'users.role_id = roles.role_id'
        ],
        [{ field: 'job_id', value: job_id }]
    );
};

const rejectApplicant = async (job_id, developerId, messageData) => {
    return await usersModel.updateAndInformUser(
        'job_applications',
        { is_treated: 'rejected' },
        [
            { field: 'job_id', value: job_id },
            { field: 'user_id', value: developerId }
        ],
        messageData
    );
};

module.exports = {
    getApplications,
    rejectApplicant
};