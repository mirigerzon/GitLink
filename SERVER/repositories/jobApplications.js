const { GET_WITH_JOINS } = require("./generic");
const usersRepository = require("./users");

const getApplications = async (jobId) => {
    if (!jobId) {
        throw new Error('Job ID is required');
    }

    try {
        const applications = await GET_WITH_JOINS(
            ["users", "developers", "job_applications", "roles"],
            [
                'users.id = developers.user_id',
                'users.id = job_applications.user_id',
                'users.role_id = roles.role_id'
            ],
            [{ field: 'job_id', value: jobId }]
        );

        return applications;
    } catch (error) {
        console.error('Error in getApplications:', error.message);
        throw new Error(`Failed to fetch job applications: ${error.message}`);
    }
};

const rejectApplicant = async (jobId, developerId, messageData) => {
    if (!jobId || !developerId || !messageData) {
        throw new Error('Job ID, developer ID, and message data are required');
    }

    if (!messageData.user_id || !messageData.email || !messageData.title || !messageData.content) {
        throw new Error('Complete message data is required');
    }

    try {
        const result = await usersRepository.updateAndInformUser(
            'job_applications',
            { is_treated: 'rejected' },
            [
                { field: 'job_id', value: jobId },
                { field: 'user_id', value: developerId }
            ],
            messageData
        );

        return result;
    } catch (error) {
        console.error('Error in rejectApplicant:', error.message);
        throw new Error(`Failed to reject applicant: ${error.message}`);
    }
};

module.exports = {
    getApplications,
    rejectApplicant
};