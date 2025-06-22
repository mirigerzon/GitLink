const dal = require('../models/dal.js');
const genericDal = require('../models/genericDal.js');

const getDevelopers = async () => {
    try {
        const res = await dal.getUsersByRole('developer');
        return res || null;
    } catch (error) {
        console.error('Error fetching developers:', error);
        throw new Error('Failed to fetch developers');
    }
}

const getDeveloper = async (id) => {
    try {
        const res = await dal.getUserWithRoleData(id, 'developer');
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
