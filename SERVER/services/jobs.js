const jobsModel = require('../models/jobs');

const getJobsWithApplicantsCount = async () => {
    return await jobsModel.getJobsWithApplicantsCount();
};

module.exports = {
    getJobsWithApplicantsCount
};
