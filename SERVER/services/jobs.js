const jobsRepository = require('../repositories/jobs');

const getJobsWithApplicantsCount = async () => {
    try {
        const jobs = await jobsRepository.getJobsWithApplicantsCount();
        return jobs || [];
    } catch (error) {
        console.error('Error fetching jobs with applicants count:', error);
        throw new Error('Failed to fetch jobs with applicants count');
    }
};

module.exports = {
    getJobsWithApplicantsCount
};