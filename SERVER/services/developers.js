const usersRepository = require('../repositories/users.js');

const getDevelopers = async () => {
    try {
        const developers = await usersRepository.getUsersByRole('developer');
        if (!developers || developers.length === 0) {
            return [];
        }
        return developers;
    } catch (error) {
        console.error('Error fetching developers:', error);
        throw new Error('Failed to fetch developers');
    }
};

const getDeveloper = async (id) => {
    if (!id) {
        throw new Error('Developer ID is required');
    }

    try {
        const developer = await usersRepository.getUserWithRoleData(id, 'developer');
        if (!developer) {
            throw new Error('Developer not found');
        }
        return developer;
    } catch (error) {
        console.error('Error fetching developer:', error);
        throw error;
    }
};

module.exports = {
    getDevelopers,
    getDeveloper
};