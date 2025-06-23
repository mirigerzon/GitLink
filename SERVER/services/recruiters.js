const usersRepositories = require('../repositories/users.js');

const getRecruiters = async () => {
    try {
        const recruiters = await usersRepositories.getUsersByRole('recruiter');
        if (!recruiters || recruiters.length === 0) {
            return [];
        }
        return recruiters;
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        throw new Error('Failed to fetch recruiters');
    }
};

const getRecruiter = async (id) => {
    if (!id) {
        throw new Error('Recruiter ID is required');
    }

    try {
        const recruiter = await usersRepositories.getUserWithRoleData(id, 'recruiter');
        if (!recruiter) {
            throw new Error('Recruiter not found');
        }
        return recruiter;
    } catch (error) {
        console.error('Error fetching recruiter:', error);
        throw error;
    }
};

module.exports = {
    getRecruiters,
    getRecruiter
};