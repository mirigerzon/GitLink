const dal = require('../models/dal.js');

const getJobsWithApplicantsCount = async () => {
    return await dal.getJobsWithApplicantsCount();
};

module.exports = {
    getJobsWithApplicantsCount
};
