const usersRepositories = require('../repositories/users.js');

const getRecruiters = async () => {
    try {
        const res = await usersRepositories.getUsersByRole('recruiter');
        return res || null;
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        throw new Error('Failed to fetch recruiters');
    }
}

const getRecruiter = async (id) => {
    try {
        const res = await usersRepositories.getUserWithRoleData(id, 'recruiter');
        return res || null;
    } catch (error) {
        console.error('Error fetching recruiter:', error);
        throw new Error('Failed to fetch recruiter');
    }
}

module.exports = {
    getRecruiters,
    getRecruiter
};
