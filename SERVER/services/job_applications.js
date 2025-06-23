const generic = require('../repositories/generic.js');
const jobApplicationsRepository = require('../repositories/jobApplications.js');
const { sendEmail, sendApplicatEmail } = require('./emailService.js');

const getJobApplications = async (job_id) => {
    try {
        const applications = await jobApplicationsRepository.getApplications(job_id);
        return applications;
    } catch (error) {
        console.error('Error fetching job applications:', error);
        throw new Error('Failed to fetch job applications');
    }
}

const rejectApplicant = async (body, job_id) => {
    try {
        const { developerId, developerEmail } = body;
        const messageData = {
            user_id: developerId,
            email: developerEmail,
            title: 'Application Rejected',
            content: `Thank you for applying for Job #${job_id}...`
        };
        await jobApplicationsRepository.rejectApplicant(job_id, developerId, messageData);
    } catch (error) {
        console.error('Error rejecting applicant:', error);
        throw new Error('Failed to reject applicant');
    }
}

const notifyApplicant = async ({ user_id, email, title, content }) => {
    try {
        await sendEmail({
            user_id: user_id,
            email: email,
            title: title,
            content: content,
            dbContent: 'Attention - you geo a new email about a work',
            saveOnly: false
        });
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw new Error('Failed to send notification email');
    }
}

const createApply = async (data, email) => {
    try {
        if (Array.isArray(data)) {
            data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
        }

        const response = await generic.CREATE('job_applications', data);

        await sendEmail({
            user_id: data.user_id,
            email: email,
            title: 'Application Received!',
            dbContent: `We received your application for job #${data.job_id}. Thank you!`,
            content: sendApplicatEmail(data.job_id),
            saveOnly: false
        });

        return response;
    } catch (error) {
        console.error('Error creating application:', error);

        if (error.message.includes('Duplicate') || error.code === '23505') {
            throw new Error('You have already contacted the recruiter for this position...');
        }

        throw new Error('Failed to submit application');
    }
}

module.exports = {
    getJobApplications,
    rejectApplicant,
    notifyApplicant,
    createApply
};
