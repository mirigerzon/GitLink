const usersRepository = require('../repositories/users.js');

const getDevelopers = async () => {
    try {
        const res = await usersRepository.getUsersByRole('developer');
        return res || null;
    } catch (error) {
        console.error('Error fetching developers:', error);
        throw new Error('Failed to fetch developers');
    }
}

const getDeveloper = async (id) => {
    try {
        const res = await usersRepository.getUserWithRoleData(id, 'developer');
        return res || null;
    } catch (error) {
        console.error('Error fetching developer:', error);
        throw new Error('Failed to fetch developer');
    }
}

module.exports = {
    getDevelopers,
    getDeveloper
};
