const jobsRepository = require('../repositories/jobs');

const getJobsWithApplicantsCount = async () => {
    return await jobsRepository.getJobsWithApplicantsCount();
};

module.exports = {
    getJobsWithApplicantsCount
};
