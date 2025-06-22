const dal = require('../models/dal.js');
const genericDal = require('../models/genericDal.js');
const { sendEmail } = require('../models/emailService.js');

const getJobApplications = async (job_id) => {
    try {
        const applications = await dal.getApplications(job_id);
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
        await dal.rejectApplicant(job_id, developerId, messageData);
    } catch (error) {
        console.error('Error rejecting applicant:', error);
        throw new Error('Failed to reject applicant');
    }
}

const notifyApplicant = async ({ email, title, content }) => {
    try {
        await sendEmail({
            to: email,
            subject: title,
            html: content
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

        const response = await genericDal.CREATE('job_applications', data);

        await dal.createMessage({
            user_id: data.user_id,
            email: email,
            title: 'Application Received!',
            content: `We have received your application for job #${data.job_id}...`
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
